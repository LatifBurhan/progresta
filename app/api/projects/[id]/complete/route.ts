import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * PATCH /api/projects/[id]/complete
 * 
 * Toggles the completion status of a project.
 * Only the project creator can toggle completion status.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const projectId = params.id;
    const body = await request.json();
    const { isCompleted } = body;

    if (typeof isCompleted !== 'boolean') {
      return NextResponse.json(
        { success: false, error: "isCompleted must be a boolean" },
        { status: 400 }
      );
    }

    // Check if project exists and get creator
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id, "createdBy"')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    // Check if current user is the creator
    if (project.createdBy !== session.userId) {
      return NextResponse.json(
        { success: false, error: "Only the project creator can change completion status" },
        { status: 403 }
      );
    }

    // Update completion status
    const { data: updatedProject, error: updateError } = await supabaseAdmin
      .from('projects')
      .update({ isCompleted })
      .eq('id', projectId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating project:', updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update project: " + updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedProject
    });

  } catch (error: any) {
    console.error("Update project completion error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
