import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

// GET - Get single project
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
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

    // Fetch project with divisions (avoiding complex relationship query that might fail)
    const { data: project, error: projectError } = await supabaseAdmin
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

    if (projectError) {
      console.error("Error fetching project:", projectError);
      return NextResponse.json(
        {
          success: false,
          message: "Gagal mengambil data project: " + projectError.message,
        },
        { status: 500 },
      );
    }

    if (!project) {
      return NextResponse.json({ success: false, message: "Project tidak ditemukan" }, { status: 404 });
    }

    // Fetch assignments separately using a direct query to avoid any join/relationship issues
    const { data: assignmentsData, error: assignmentsError } = await supabaseAdmin.from("project_assignments").select("user_id").eq("project_id", projectId);

    let assignedUsers: any[] = [];
    if (!assignmentsError && assignmentsData && assignmentsData.length > 0) {
      const userIds = assignmentsData.map((a) => a.user_id);
      const { data: userData, error: userError } = await supabaseAdmin.from("users").select("id, name, email").in("id", userIds);

      if (!userError && userData) {
        assignedUsers = userData;
      }
    }

    if (assignmentsError) {
      console.error("Error fetching project assignments:", assignmentsError);
    }

    // Transform the data
    const transformedProject = {
      ...project,
      divisions: project.project_divisions?.map((pd: any) => pd.divisions).filter(Boolean) || [],
      assignments: assignedUsers,
    };

    console.log("API - Transformed project:", JSON.stringify(transformedProject, null, 2));

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
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const projectId = params.id;

    const { name, tujuan, description, departmentIds, divisionIds, userIds, pic, prioritas, tanggalMulai, tanggalSelesai, lampiranFiles, status } = await request.json();

    console.log("Received update project request:", {
      projectId,
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

      const { data: updatedProject, error: projectError } = await supabaseAdmin.from("projects").update(projectData).eq("id", projectId).select().single();

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
        const { data: divisionsData, error: divisionsFetchError } = await supabaseAdmin.from("divisions").select("id, department_id").in("id", divisionIds);

        if (!divisionsFetchError && divisionsData) {
          // Create new project_department_divisions entries
          const projectDepartmentDivisions = divisionsData.map((division) => ({
            project_id: projectId,
            department_id: division.department_id,
            division_id: division.id,
          }));

          const { error: pddError } = await supabaseAdmin.from("project_department_divisions").insert(projectDepartmentDivisions);

          if (pddError) {
            console.error("Project department divisions update failed:", pddError);
            // Continue anyway as this is supplementary data
          }
        }
      }

      // Update project assignments (Specific Users)
      if (userIds !== undefined) {
        // Delete old assignments
        const { error: deleteError } = await supabaseAdmin.from("project_assignments").delete().eq("project_id", projectId);

        if (deleteError) {
          console.error("Failed to delete old assignments:", deleteError);
          return NextResponse.json(
            {
              success: false,
              message: "Gagal membersihkan data personel lama: " + deleteError.message,
            },
            { status: 500 },
          );
        }

        if (userIds && Array.isArray(userIds) && userIds.length > 0) {
          const projectAssignments = userIds.map((userId: string) => ({
            project_id: projectId,
            user_id: userId,
          }));

          const { error: assignmentsError } = await supabaseAdmin.from("project_assignments").insert(projectAssignments);

          if (assignmentsError) {
            console.error("Project assignments update failed:", assignmentsError);
            return NextResponse.json(
              {
                success: false,
                message: "Gagal menyimpan personel terpilih: " + assignmentsError.message + ". Pastikan tabel 'project_assignments' sudah dibuat di SQL Editor.",
              },
              { status: 500 },
            );
          }
        }
      }

      // Get the complete updated project with divisions
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

      // Fetch assignments separately using a direct query to avoid relationship issues
      const { data: assignmentsData, error: assignmentsError } = await supabaseAdmin.from("project_assignments").select("user_id").eq("project_id", projectId);

      let assignedUsers: any[] = [];
      if (!assignmentsError && assignmentsData && assignmentsData.length > 0) {
        const userIdsArr = assignmentsData.map((a) => a.user_id);
        const { data: userData, error: userError } = await supabaseAdmin.from("users").select("id, name, email").in("id", userIdsArr);

        if (!userError && userData) {
          assignedUsers = userData;
        }
      }

      if (assignmentsError) {
        console.error("Error fetching project assignments after update:", assignmentsError);
      }

      // Transform the data
      const transformedProject = {
        ...completeProject,
        divisions: completeProject.project_divisions?.map((pd: any) => pd.divisions).filter(Boolean) || [],
        assignments: assignedUsers,
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
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
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
