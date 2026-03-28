import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/reports/projects
 * 
 * Retrieves active projects the user is involved in through their division.
 * 
 * Requirements: 1.1, 1.2, 7.1, 7.2
 * 
 * Query Logic:
 * - Filter projects where isActive = true
 * - Filter projects where user's division is linked via project_divisions
 * - Return projects with their associated divisions
 * 
 * Response Format:
 * {
 *   success: boolean;
 *   data?: Array<{
 *     id: string;
 *     name: string;
 *     description: string;
 *     isActive: boolean;
 *     divisions: Array<{
 *       id: string;
 *       name: string;
 *       color: string;
 *     }>;
 *   }>;
 *   error?: string;
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify user session
    const session = await verifySession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: "Database configuration error" },
        { status: 500 }
      );
    }

    // Get user's division
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('divisionId')
      .eq('id', session.userId)
      .single();

    if (userError || !user) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (!user.divisionId) {
      return NextResponse.json(
        { success: false, error: "User has no division assigned" },
        { status: 400 }
      );
    }

    // Query projects where:
    // 1. isActive = true
    // 2. User's division is linked via project_divisions
    const { data: projectDivisions, error: projectDivisionsError } = await supabaseAdmin
      .from('project_divisions')
      .select(`
        project_id,
        projects!inner (
          id,
          name,
          description,
          isActive
        )
      `)
      .eq('division_id', user.divisionId)
      .eq('projects.isActive', true);

    if (projectDivisionsError) {
      console.error('Error fetching project divisions:', projectDivisionsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch projects: " + projectDivisionsError.message },
        { status: 500 }
      );
    }

    // Extract unique projects
    const projectIds = [...new Set(projectDivisions?.map((pd: any) => pd.projects.id) || [])];

    if (projectIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // Fetch complete project data with all divisions
    const { data: projects, error: projectsError } = await supabaseAdmin
      .from('projects')
      .select(`
        id,
        name,
        description,
        isActive,
        createdBy,
        urgency,
        isCompleted,
        project_divisions (
          division_id,
          divisions (
            id,
            name,
            color
          )
        )
      `)
      .in('id', projectIds)
      .eq('isActive', true)
      .order('name', { ascending: true });

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch projects: " + projectsError.message },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const transformedProjects = (projects || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      isActive: p.isActive,
      createdBy: p.createdBy || null,
      urgency: p.urgency || 'low',
      isCompleted: p.isCompleted || false,
      divisions: p.project_divisions?.map((pd: any) => pd.divisions).filter(Boolean) || []
    }));

    return NextResponse.json({
      success: true,
      data: transformedProjects
    });

  } catch (error: any) {
    console.error("Get projects error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
