import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import { sendNotification, NotificationTemplates } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { name, tujuan, description, departmentIds, divisionIds, userIds, pic, prioritas, tanggalMulai, tanggalSelesai, lampiranFiles } = await request.json();

    console.log("Received create project request:", {
      name,
      tujuan,
      description,
      departmentIds,
      divisionIds,
      userIds,
      pic,
      prioritas,
      tanggalMulai,
      tanggalSelesai,
      lampiranFiles,
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

    if (!departmentIds || !Array.isArray(departmentIds) || departmentIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Minimal satu departemen wajib dipilih",
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
        if (typeof url !== "string") {
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

      // Generate project ID and prepare data
      const projectId = uuidv4();
      const now = new Date().toISOString();
      const projectData = {
        id: projectId,
        name: name.trim(),
        tujuan: tujuan?.trim() || null,
        description: description?.trim() || null,
        pic: pic?.trim() || null,
        prioritas: prioritas || null,
        tanggal_mulai: tanggalMulai || null,
        tanggal_selesai: tanggalSelesai || null,
        lampiran_files: lampiranFiles || null,
        status: "Aktif",
        created_by: session.userId,
        divisionId: divisionIds[0],
        startDate: tanggalMulai || null,
        endDate: tanggalSelesai || null,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      // Create project using direct insert
      const { data: newProject, error: projectError } = await supabaseAdmin.from("projects").insert([projectData]).select().single();

      if (projectError) {
        console.error("Project creation failed:", projectError);
        return NextResponse.json(
          {
            success: false,
            message: "Gagal membuat project: " + projectError.message,
          },
          { status: 500 },
        );
      }

      // Insert project divisions (Many-to-Many)
      const projectDivisions = divisionIds.map((divisionId) => ({
        project_id: newProject.id,
        division_id: divisionId,
      }));

      const { error: divisionsError } = await supabaseAdmin.from("project_divisions").insert(projectDivisions);

      if (divisionsError) {
        console.error("Project divisions creation failed:", divisionsError);
        // Try to clean up the project
        await supabaseAdmin.from("projects").delete().eq("id", newProject.id);
        return NextResponse.json(
          {
            success: false,
            message: "Gagal menambahkan divisi ke project: " + divisionsError.message,
          },
          { status: 500 },
        );
      }

      // Insert project assignments (Specific Users) if userIds provided
      console.log("Checking userIds for assignments:", { userIds, isArray: Array.isArray(userIds), length: userIds?.length });
      
      if (userIds && Array.isArray(userIds) && userIds.length > 0) {
        console.log("Creating project assignments for users:", userIds);
        
        const projectAssignments = userIds.map((userId) => ({
          project_id: newProject.id,
          user_id: userId,
        }));

        console.log("Project assignments to insert:", projectAssignments);

        const { data: insertedAssignments, error: assignmentsError } = await supabaseAdmin
          .from("project_assignments")
          .insert(projectAssignments)
          .select();

        if (assignmentsError) {
          console.error("Project assignments creation failed:", assignmentsError);
          console.error("Assignment error details:", JSON.stringify(assignmentsError, null, 2));
          // Return error instead of just logging
          return NextResponse.json(
            {
              success: false,
              message: "Gagal menambahkan user assignments: " + assignmentsError.message,
            },
            { status: 500 },
          );
        }
        
        console.log("Project assignments created successfully:", insertedAssignments);
      } else {
        console.log("No userIds provided or userIds is empty - project will be accessible to all division members");
      }

      // Insert project_department_divisions for multi-department support
      // Get department_id for each division
      const { data: divisionsData, error: divisionsFetchError } = await supabaseAdmin.from("divisions").select("id, department_id").in("id", divisionIds);

      if (divisionsFetchError || !divisionsData) {
        console.error("Failed to fetch divisions data:", divisionsFetchError);
        await supabaseAdmin.from("projects").delete().eq("id", newProject.id);
        return NextResponse.json(
          {
            success: false,
            message: "Gagal mengambil data divisi",
          },
          { status: 500 },
        );
      }

      // Create project_department_divisions entries
      const projectDepartmentDivisions = divisionsData.map((division) => ({
        project_id: newProject.id,
        department_id: division.department_id,
        division_id: division.id,
      }));

      const { error: pddError } = await supabaseAdmin.from("project_department_divisions").insert(projectDepartmentDivisions);

      if (pddError) {
        console.error("Project department divisions creation failed:", pddError);
        // Continue anyway as this is supplementary data
      }

      // Get the complete project with divisions
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
        .eq("id", newProject.id)
        .single();

      if (fetchError) {
        console.error("Failed to fetch complete project:", fetchError);
        return NextResponse.json({ success: false, message: "Project dibuat tapi gagal mengambil data lengkap" }, { status: 500 });
      }

      // Fetch assignments separately using a direct query
      const { data: assignmentsData, error: assignmentsError } = await supabaseAdmin.from("project_assignments").select("user_id").eq("project_id", newProject.id);

      let assignedUsers: any[] = [];
      if (!assignmentsError && assignmentsData && assignmentsData.length > 0) {
        const userIdsArr = assignmentsData.map((a) => a.user_id);
        const { data: userData, error: userError } = await supabaseAdmin.from("users").select("id, name, email").in("id", userIdsArr);

        if (!userError && userData) {
          assignedUsers = userData;
        }
      }

      if (assignmentsError) {
        console.error("Error fetching project assignments after create:", assignmentsError);
      }

      // Transform the data
      const transformedProject = {
        ...completeProject,
        divisions: completeProject.project_divisions?.map((pd: any) => pd.divisions).filter(Boolean) || [],
        assignments: assignedUsers,
      };

      console.log("Project created successfully:", transformedProject);

      // Send notifications
      try {
        console.log('=== PROJECT CREATION NOTIFICATION START ===');
        
        // Get creator info
        const { data: creatorData } = await supabaseAdmin
          .from('users')
          .select('name, email')
          .eq('id', session.userId)
          .single();

        const createdBy = creatorData?.name || creatorData?.email || 'Admin';

        // Notify CEO about new project
        await sendNotification(
          NotificationTemplates.projectCreated(name.trim(), createdBy)
        );
        console.log('✅ CEO notification sent');

        // Send notification to assigned users
        if (userIds && Array.isArray(userIds) && userIds.length > 0) {
          for (const userId of userIds) {
            await sendNotification(
              NotificationTemplates.projectAssigned(name.trim(), userId)
            );
          }
          console.log(`✅ Notifications sent to ${userIds.length} assigned users`);
        }

        console.log('=== PROJECT CREATION NOTIFICATION END ===');
      } catch (notifError) {
        console.error("Failed to send notifications:", notifError);
        // Don't fail the request if notification fails
      }

      return NextResponse.json({
        success: true,
        message: `Project berhasil dibuat dengan ${departmentIds.length} departemen dan ${divisionIds.length} divisi!`,
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
