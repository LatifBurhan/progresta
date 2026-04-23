import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/reports/projects
 * 
 * Retrieves projects the user is involved in through their division or assignment.
 * 
 * Query Parameters:
 * - include_completed: 'true' to include all statuses, default only 'Aktif'
 * 
 * Requirements: 1.1, 1.2, 7.1, 7.2
 * 
 * Query Logic:
 * - Filter projects where isActive = true (or all statuses if include_completed=true)
 * - Filter projects where user's division is linked via project_divisions OR user is assigned
 * - Return projects with their associated divisions
 * 
 * Response Format:
 * {
 *   success: boolean;
 *   data?: Array<{
 *     id: string;
 *     name: string;
 *     description: string;
 *     status: string;
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

    // Check if we should include completed projects
    const searchParams = request.nextUrl.searchParams;
    const includeCompleted = searchParams.get('include_completed') === 'true';

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
    // 2. User is specifically assigned via project_assignments OR
    // 3. If no specific assignments exist for the project, user's division is linked via project_divisions
    
    // First, get projects where user is specifically assigned
    const { data: userAssignments, error: assignmentsError } = await supabaseAdmin
      .from('project_assignments')
      .select('project_id')
      .eq('user_id', session.userId);

    if (assignmentsError) {
      console.error('Error fetching user assignments:', assignmentsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch assignments: " + assignmentsError.message },
        { status: 500 }
      );
    }

    const assignedProjectIds = userAssignments?.map((a: any) => a.project_id) || [];

    // Get projects from user's division
    const queryBuilder = supabaseAdmin
      .from('project_divisions')
      .select(`
        project_id,
        projects!inner (
          id,
          name,
          description,
          status
        )
      `)
      .eq('division_id', user.divisionId);
    
    // Only filter by 'Aktif' status if not including completed projects
    if (!includeCompleted) {
      queryBuilder.eq('projects.status', 'Aktif');
    }
    
    const { data: projectDivisions, error: projectDivisionsError } = await queryBuilder;

    if (projectDivisionsError) {
      console.error('Error fetching project divisions:', projectDivisionsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch projects: " + projectDivisionsError.message },
        { status: 500 }
      );
    }

    const divisionProjectIds = projectDivisions?.map((pd: any) => pd.projects.id) || [];

    // For each division project, check if it has specific assignments
    // If it does, only include if user is assigned
    // If it doesn't, include it (all division members can access)
    const projectIdsToCheck = [...new Set([...divisionProjectIds])];
    
    if (projectIdsToCheck.length === 0 && assignedProjectIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // Get all assignments for these projects to determine which have specific assignments
    const { data: allAssignments, error: allAssignmentsError } = await supabaseAdmin
      .from('project_assignments')
      .select('project_id')
      .in('project_id', projectIdsToCheck);

    if (allAssignmentsError) {
      console.error('Error fetching all assignments:', allAssignmentsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch project assignments: " + allAssignmentsError.message },
        { status: 500 }
      );
    }

    // Projects that have specific assignments
    const projectsWithAssignments = [...new Set(allAssignments?.map((a: any) => a.project_id) || [])];

    // Filter logic:
    // - Include if user is specifically assigned (in assignedProjectIds)
    // - Include if project is in user's division AND has no specific assignments
    const projectIds = projectIdsToCheck.filter((projectId: string) => {
      const hasAssignments = projectsWithAssignments.includes(projectId);
      const userIsAssigned = assignedProjectIds.includes(projectId);
      
      if (hasAssignments) {
        // Project has specific assignments, only include if user is assigned
        return userIsAssigned;
      } else {
        // Project has no specific assignments, include for all division members
        return true;
      }
    });

    if (projectIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // Fetch complete project data with all divisions
    const projectsQueryBuilder = supabaseAdmin
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
      .in('id', projectIds);
    
    // Only filter by 'Aktif' status if not including completed projects
    if (!includeCompleted) {
      projectsQueryBuilder.eq('status', 'Aktif');
    }
    
    projectsQueryBuilder.order('created_at', { ascending: false });
    
    const { data: projects, error: projectsError } = await projectsQueryBuilder;

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch projects: " + projectsError.message },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const transformedProjects = (projects || []).map((p: any) => ({
      ...p,
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
