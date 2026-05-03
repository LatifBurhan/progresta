import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { sendNotification, NotificationTemplates } from "@/lib/notifications";

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

      // Get old project status BEFORE update (for notification comparison)
      const { data: oldProjectData } = await supabaseAdmin
        .from('projects')
        .select('status')
        .eq('id', projectId)
        .single();

      const oldStatus = oldProjectData?.status;
      console.log('📌 Old project status before update:', oldStatus);

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
      // Get old assignments first before updating
      const { data: oldAssignments } = await supabaseAdmin
        .from("project_assignments")
        .select("user_id")
        .eq("project_id", projectId);

      const oldUserIds = oldAssignments?.map(a => a.user_id) || [];

      console.log('📋 Assignment update logic:');
      console.log('  Old assignments from DB:', oldUserIds);
      console.log('  New userIds from request:', userIds);
      console.log('  userIds is undefined?', userIds === undefined);

      if (userIds !== undefined) {
        console.log('  ⚠️ userIds is defined, will update assignments');
        
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

        console.log('  ✅ Old assignments deleted');

        if (userIds && Array.isArray(userIds) && userIds.length > 0) {
          console.log('  ✅ Inserting new assignments:', userIds);
          
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
          
          console.log('  ✅ New assignments inserted');
        } else {
          console.log('  ⚠️ userIds is empty array, no new assignments to insert');
        }
      } else {
        console.log('  ℹ️ userIds is undefined, keeping existing assignments');
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

      // Send notifications for project updates
      try {
        console.log('=== NOTIFICATION DEBUG START ===');
        console.log('Status from request:', status);
        console.log('Old user IDs:', oldUserIds);
        console.log('New user IDs:', userIds);
        console.log('Assigned users:', assignedUsers);
        
        const newUserIds = userIds || [];

        // Find newly assigned users
        const newlyAssignedUsers = newUserIds.filter((id: string) => !oldUserIds.includes(id));

        console.log('Newly assigned users:', newlyAssignedUsers);

        // Send notification to newly assigned users
        if (newlyAssignedUsers.length > 0) {
          console.log(`Sending notifications to ${newlyAssignedUsers.length} newly assigned users...`);
          for (const userId of newlyAssignedUsers) {
            await sendNotification(
              NotificationTemplates.projectAssigned(name.trim(), userId)
            );
          }
          console.log(`✅ Notifications sent to ${newlyAssignedUsers.length} newly assigned users`);
        } else {
          console.log('No newly assigned users to notify');
        }

        const statusChanged = status && oldStatus && status !== oldStatus;

        console.log('Status change detection:');
        console.log('  Old status:', oldStatus);
        console.log('  New status:', status);
        console.log('  Status changed?', statusChanged);

        // If status changed, notify all assigned users
        if (statusChanged) {
          const allAssignedUserIds = assignedUsers.map(u => u.id);
          console.log('All assigned user IDs for status notification:', allAssignedUserIds);
          
          if (allAssignedUserIds.length > 0) {
            console.log(`Sending status change notification to ${allAssignedUserIds.length} users...`);
            
            // Determine priority based on status
            let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
            if (status === 'Dibatalkan') priority = 'high';
            else if (status === 'Selesai') priority = 'medium';
            else if (status === 'Ditunda') priority = 'high';
            else if (status === 'Non-Aktif') priority = 'medium';
            
            await sendNotification({
              type: 'project_status_changed',
              title: 'Status Project Berubah',
              message: `Project "${name.trim()}" statusnya berubah dari ${oldStatus} menjadi ${status}`,
              priority: priority,
              userIds: allAssignedUserIds,
              actionUrl: '/dashboard/admin/projects',
              data: { projectName: name.trim(), oldStatus, newStatus: status }
            });
            
            console.log(`✅ Status change notification sent to ${allAssignedUserIds.length} users`);
          } else {
            console.log('⚠️ No assigned users to notify about status change');
            console.log('💡 Tip: Tambahkan user di "Personel Terpilih" saat edit project');
          }
        } else {
          console.log('Status not changed, skipping status notification');
        }
        
        console.log('=== NOTIFICATION DEBUG END ===');
      } catch (notifError) {
        console.error("Failed to send notifications:", notifError);
        console.error("Notification error stack:", notifError);
        // Don't fail the request if notification fails
      }

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

      // Get project details and assigned users BEFORE deletion
      const { data: projectData } = await supabaseAdmin
        .from('projects')
        .select('name')
        .eq('id', projectId)
        .single();

      const projectName = projectData?.name || 'Project';

      // Get assigned users
      const { data: assignmentsData } = await supabaseAdmin
        .from('project_assignments')
        .select('user_id')
        .eq('project_id', projectId);

      const assignedUserIds = assignmentsData?.map(a => a.user_id) || [];

      // Get user info for notification
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('name, email')
        .eq('id', session.userId)
        .single();

      const deletedBy = userData?.name || userData?.email || 'Admin';

      // Delete from project_divisions first (if exists)
      await supabaseAdmin.from("project_divisions").delete().eq("project_id", projectId);

      // Delete from project_assignments
      await supabaseAdmin.from("project_assignments").delete().eq("project_id", projectId);

      // Delete from project_department_divisions
      await supabaseAdmin.from("project_department_divisions").delete().eq("project_id", projectId);

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

      // Send notifications after successful deletion
      try {
        console.log('=== PROJECT DELETION NOTIFICATION START ===');
        console.log('Project name:', projectName);
        console.log('Deleted by:', deletedBy);
        console.log('Assigned users:', assignedUserIds);

        // Notify CEO about project deletion
        await sendNotification(
          NotificationTemplates.projectDeleted(projectName, deletedBy)
        );
        console.log('✅ CEO notification sent');

        // Notify assigned staff members
        if (assignedUserIds.length > 0) {
          await sendNotification(
            NotificationTemplates.projectDeletedStaff(projectName, assignedUserIds)
          );
          console.log(`✅ Staff notifications sent to ${assignedUserIds.length} users`);
        }

        console.log('=== PROJECT DELETION NOTIFICATION END ===');
      } catch (notifError) {
        console.error("Failed to send deletion notifications:", notifError);
        // Don't fail the request if notification fails
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
