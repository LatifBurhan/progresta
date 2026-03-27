import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "Database configuration error",
        },
        { status: 500 },
      );
    }

    // Fetch projects with divisions (Many-to-Many)
    const { data: projects, error: projectsError } = await supabaseAdmin
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
      .order('created_at', { ascending: false })

    if (projectsError) {
      console.error('Error fetching projects:', projectsError)
      return NextResponse.json({
        success: false,
        message: 'Gagal mengambil data projects: ' + projectsError.message
      }, { status: 500 })
    }

    // Transform the data
    const transformedProjects = (projects || []).map((p: any) => ({
      ...p,
      // Fallback for old data mapping
      tanggal_mulai: p.tanggal_mulai || p.startDate,
      tanggal_selesai: p.tanggal_selesai || p.endDate,
      status: p.status || (p.isActive ? 'Aktif' : 'Non-Aktif'),
      divisions: p.project_divisions?.map((pd: any) => pd.divisions).filter(Boolean) || []
    }));

    console.log(`Fetched ${transformedProjects.length} projects`);
    transformedProjects.forEach((p: any) => {
      console.log(`Project "${p.name}" has ${p.divisions?.length || 0} divisions`);
    });

    return NextResponse.json({
      success: true,
      projects: transformedProjects,
    });
  } catch (error: any) {
    console.error("Get projects error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error: " + error.message,
      },
      { status: 500 },
    );
  }
}
