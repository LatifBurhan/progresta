import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

// GET - Get single project
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const projectId = params.id;

    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "Database configuration error",
        },
        { status: 500 },
      );
    }

    // Fetch project with divisions
    const { data: project, error: projectError } = await supabaseAdmin
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
      .eq('id', projectId)
      .single()

    if (projectError) {
      console.error('Error fetching project:', projectError)
      return NextResponse.json({
        success: false,
        message: 'Gagal mengambil data project: ' + projectError.message
      }, { status: 500 })
    }

    if (!project) {
      return NextResponse.json({
        success: false,
        message: 'Project tidak ditemukan'
      }, { status: 404 })
    }

    // Transform the data
    const transformedProject = {
      ...project,
      divisions: project.project_divisions?.map((pd: any) => pd.divisions).filter(Boolean) || []
    };

    console.log('API - Transformed project:', JSON.stringify(transformedProject, null, 2))

    return NextResponse.json({
      success: true,
      project: transformedProject,
    });
  } catch (error: any) {
    console.error("Get project error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error: " + error.message,
      },
      { status: 500 },
    );
  }
}

// PUT - Update project
export async function PUT(
  request: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const projectId = params.id;

    const { name, tujuan, description, departmentIds, divisionIds, pic, prioritas, tanggalMulai, tanggalSelesai, lampiranFiles, status } = await request.json();

    console.log("Received update project request:", {
      projectId,
      name,
      tujuan,
      description,
      departmentIds,
      divisionIds,
      pic,
      prioritas,
      tanggalMulai,
      tanggalSelesai,
      lampiranFiles,
      status,
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

    if (divisionIds && !Array.isArray(divisionIds)) {
      return NextResponse.json(
        {
          success: false,
          message: "Format divisi tidak valid",
        },
        { status: 400 },
      );
    }

    // Validate lampiranFiles if provided
    if (lampiranFiles !== null && lampiranFiles !== undefined) {
      if (!Array.isArray(lampiranFiles)) {
        return NextResponse.json(
          {
            success: false,
            message: "lampiranFiles harus berupa array",
          },
          { status: 400 },
        );
      }
      
      // Validate each URL is a string
      for (const url of lampiranFiles) {
        if (typeof url !== 'string') {
          return NextResponse.json(
            {
              success: false,
              message: "Semua URL file harus berupa string",
            },
            { status: 400 },
          );
        }
      }
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

    if (status && !["Aktif", "Selesai", "Ditunda", "Dibatalkan", "Non-Aktif"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Status tidak valid",
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
        return NextResponse.json(
          {
            success: false,
            message: "Database configuration error",
          },
          { status: 500 },
        );
      }

      // Update project data
      const projectData: any = {
        name: name.trim(),
        tujuan: tujuan?.trim() || null,
        description: description?.trim() || null,
        pic: pic?.trim() || null,
        prioritas: prioritas || null,
        tanggal_mulai: tanggalMulai || null,
        tanggal_selesai: tanggalSelesai || null,
        status: status || "Aktif",
        updated_at: new Date().toISOString(),
      };

      // Only update lampiran_files if it's provided in the request
      if (lampiranFiles !== undefined) {
        projectData.lampiran_files = lampiranFiles;
      }

      const { data: updatedProject, error: projectError } = await supabaseAdmin
        .from("projects")
        .update(projectData)
        .eq("id", projectId)
        .select()
        .single();

      if (projectError) {
        console.error("Project update failed:", projectError);
        return NextResponse.json(
          {
            success: false,
            message: "Gagal mengupdate project: " + projectError.message,
          },
          { status: 500 },
        );
      }

      if (divisionIds && divisionIds.length > 0) {
        // Delete old project_divisions
        await supabaseAdmin.from("project_divisions").delete().eq("project_id", projectId);

        // Insert new project_divisions
        const projectDivisions = divisionIds.map((divisionId: string) => ({
          project_id: projectId,
          division_id: divisionId,
        }));

        const { error: divisionsError } = await supabaseAdmin.from("project_divisions").insert(projectDivisions);

        if (divisionsError) {
          console.error("Project divisions update failed:", divisionsError);
        }

        // Update project_department_divisions
        // Delete old entries
        await supabaseAdmin.from("project_department_divisions").delete().eq("project_id", projectId);

        // Get department_id for each division
        const { data: divisionsData, error: divisionsFetchError } = await supabaseAdmin
          .from('divisions')
          .select('id, department_id')
          .in('id', divisionIds)

        if (!divisionsFetchError && divisionsData) {
          // Create new project_department_divisions entries
          const projectDepartmentDivisions = divisionsData.map(division => ({
            project_id: projectId,
            department_id: division.department_id,
            division_id: division.id
          }))

          const { error: pddError } = await supabaseAdmin
            .from('project_department_divisions')
            .insert(projectDepartmentDivisions)

          if (pddError) {
            console.error('Project department divisions update failed:', pddError)
            // Continue anyway as this is supplementary data
          }
        }
      }

      // Get the complete updated project
      const { data: completeProject, error: fetchError } = await supabaseAdmin
        .from("projects")
        .select(
          `
          *,
          project_divisions (
            division_id,
            divisions (
              id,
              name,
              color
            )
          )
        `,
        )
        .eq("id", projectId)
        .single();

      if (fetchError) {
        console.error("Failed to fetch complete project after update:", fetchError);
        return NextResponse.json({
          success: true,
          message: "Project berhasil diupdate, tetapi gagal mengambil data divisi lengkap",
          project: {
            ...updatedProject,
            divisions: [],
          },
        });
      }

      // Transform the data
      const transformedProject = {
        ...completeProject,
        divisions: completeProject.project_divisions?.map((pd: any) => pd.divisions).filter(Boolean) || [],
      };

      return NextResponse.json({
        success: true,
        message: "Project berhasil diupdate!",
        project: transformedProject,
      });
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
    console.error("Update project error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error: " + error.message,
      },
      { status: 500 },
    );
  }
}

// DELETE - Delete project
export async function DELETE(
  request: NextRequest, 
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const projectId = params.id;

    console.log("Received delete project request:", { projectId });

    try {
      if (!supabaseAdmin) {
        return NextResponse.json(
          {
            success: false,
            message: "Database configuration error",
          },
          { status: 500 },
        );
      }

      // Delete from project_divisions first (if exists)
      await supabaseAdmin.from("project_divisions").delete().eq("project_id", projectId);

      // Delete the project
      const { error: deleteError } = await supabaseAdmin.from("projects").delete().eq("id", projectId);

      if (deleteError) {
        console.error("Project deletion failed:", deleteError);
        return NextResponse.json(
          {
            success: false,
            message: "Gagal menghapus project: " + deleteError.message,
          },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        message: "Project berhasil dihapus",
      });
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
    console.error("Delete project error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error: " + error.message,
      },
      { status: 500 },
    );
  }
}
