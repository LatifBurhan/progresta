import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { deletePhotosByUrls } from "@/lib/storage/photo-upload";
import { deserializeFotoUrls } from "@/lib/utils/foto-urls-parser";

/**
 * DELETE /api/reports/delete/[id]
 * 
 * Deletes a progress report and its associated photos from storage.
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4
 * 
 * Authorization:
 * - User must be authenticated
 * - User must be the report creator OR
 * - User must have role ADMIN, HRD, or CEO
 * 
 * Process:
 * 1. Validate authentication
 * 2. Retrieve report to verify ownership and get foto_urls
 * 3. Validate user is creator OR user is admin
 * 4. Delete all photos from storage
 * 5. Delete record from database
 * 6. Return success response
 * 
 * Response:
 * {
 *   success: boolean;
 *   error?: string;
 * }
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    // Requirement 3.1, 3.2: Validate authentication
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

    const reportId = params.id;

    // Requirement 3.3: Retrieve report to get foto_urls
    const { data: report, error: fetchError } = await supabaseAdmin
      .from('project_reports')
      .select('id, user_id, foto_urls')
      .eq('id', reportId)
      .single();

    if (fetchError || !report) {
      console.error('Error fetching report:', fetchError);
      return NextResponse.json(
        { success: false, error: "Report not found" },
        { status: 404 }
      );
    }

    // Requirement 3.1, 3.2: Validate user is creator OR user is admin
    const isCreator = report.user_id === session.userId;
    const adminRoles = ['ADMIN', 'HRD', 'CEO'];
    const isAdmin = adminRoles.includes(session.role);

    if (!isCreator && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "You are not authorized to delete this report" },
        { status: 403 }
      );
    }

    // Requirement 3.3: Delete all photos from storage
    try {
      const fotoUrls = deserializeFotoUrls(report.foto_urls);
      
      if (fotoUrls.length > 0) {
        await deletePhotosByUrls(fotoUrls);
        console.log(`Deleted ${fotoUrls.length} photos from storage for report ${reportId}`);
      }
    } catch (storageError) {
      console.error('Error deleting photos from storage:', storageError);
      // Continue with database deletion even if storage deletion fails
      // This prevents orphaned database records
    }

    // Requirement 3.4: Delete record from database
    const { error: deleteError } = await supabaseAdmin
      .from('project_reports')
      .delete()
      .eq('id', reportId);

    if (deleteError) {
      console.error('Error deleting report from database:', deleteError);
      return NextResponse.json(
        { success: false, error: "Failed to delete report: " + deleteError.message },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true
    });

  } catch (error: any) {
    console.error("Delete report error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
