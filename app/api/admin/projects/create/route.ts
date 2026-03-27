import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { name, tujuan, description, divisionIds, pic, prioritas, tanggalMulai, tanggalSelesai, outputDiharapkan, catatan, lampiranUrl } = await request.json();

    console.log("Received create project request:", {
      name,
      tujuan,
      description,
      divisionIds,
      pic,
      prioritas,
      tanggalMulai,
      tanggalSelesai,
      outputDiharapkan,
      catatan,
      lampiranUrl,
    });

    // Validasi input
    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama project wajib diisi",
        },
        { status: 400 },
      );
    }

    if (!divisionIds || !Array.isArray(divisionIds) || divisionIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Minimal satu divisi wajib dipilih",
        },
        { status: 400 },
      );
    }

    if (prioritas && !["Rendah", "Sedang", "Tinggi", "Urgent"].includes(prioritas)) {
      return NextResponse.json(
        {
          success: false,
          message: "Prioritas tidak valid",
        },
        { status: 400 },
      );
    }

    // Validasi tanggal
    if (tanggalMulai && tanggalSelesai) {
      const startDate = new Date(tanggalMulai);
      const endDate = new Date(tanggalSelesai);

      if (endDate <= startDate) {
        return NextResponse.json(
          {
            success: false,
            message: "Tanggal selesai harus setelah tanggal mulai",
          },
          { status: 400 },
        );
      }
    }

    try {
      if (!supabaseAdmin) {
        return NextResponse.json({
          success: false,
          message: 'Database configuration error'
        }, { status: 500 })
      }

      // Generate project ID and prepare data
      const projectId = uuidv4()
      const now = new Date().toISOString()
      const projectData = {
        id: projectId,
        name: name.trim(),
        tujuan: tujuan?.trim() || null,
        description: description?.trim() || null,
        pic: pic?.trim() || null,
        prioritas: prioritas || null,
        tanggal_mulai: tanggalMulai || null,
        tanggal_selesai: tanggalSelesai || null,
        output_diharapkan: outputDiharapkan?.trim() || null,
        catatan: catatan?.trim() || null,
        lampiran_url: lampiranUrl?.trim() || null,
        status: 'Aktif',
        created_by: session.userId,
        divisionId: divisionIds[0],
        startDate: tanggalMulai || null,
        endDate: tanggalSelesai || null,
        isActive: true,
        createdAt: now,
        updatedAt: now
      }

      // Create project using direct insert
      const { data: newProject, error: projectError } = await supabaseAdmin
        .from('projects')
        .insert([projectData])
        .select()
        .single()

      if (projectError) {
        console.error('Project creation failed:', projectError)
        return NextResponse.json({
          success: false,
          message: 'Gagal membuat project: ' + projectError.message
        }, { status: 500 })
      }

      // Insert project divisions (Many-to-Many)
      const projectDivisions = divisionIds.map(divisionId => ({
        project_id: newProject.id,
        division_id: divisionId
      }))

      const { error: divisionsError } = await supabaseAdmin
        .from('project_divisions')
        .insert(projectDivisions)

      if (divisionsError) {
        console.error('Project divisions creation failed:', divisionsError)
        // Try to clean up the project
        await supabaseAdmin.from('projects').delete().eq('id', newProject.id)
        return NextResponse.json({
          success: false,
          message: 'Gagal menambahkan divisi ke project: ' + divisionsError.message
        }, { status: 500 })
      }

      // Get the complete project with divisions
      const { data: completeProject, error: fetchError } = await supabaseAdmin
        .from('projects')
        .select(`
          *,
          project_divisions (
            division_id,
            divisions (
              id,
              name,
              color
            )
          )
        `)
        .eq('id', newProject.id)
        .single()

      if (fetchError) {
        console.error('Failed to fetch complete project:', fetchError)
        return NextResponse.json({
          success: false,
          message: 'Project dibuat tapi gagal mengambil data lengkap'
        }, { status: 500 })
      }

      // Transform the data
      const transformedProject = {
        ...completeProject,
        divisions: completeProject.project_divisions?.map((pd: any) => pd.divisions).filter(Boolean) || []
      }

      console.log('Project created successfully:', transformedProject)

      return NextResponse.json({
        success: true,
        message: `Project berhasil dibuat dengan ${divisionIds.length} divisi!`,
        project: transformedProject
      })
    } catch (dbError: any) {
      console.error("Database operation error:", dbError);
      return NextResponse.json(
        {
          success: false,
          message: "Database error: " + dbError.message,
        },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("Create project error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error: " + error.message,
      },
      { status: 500 },
    );
  }
}
