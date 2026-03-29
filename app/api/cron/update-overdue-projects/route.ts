import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * POST /api/cron/update-overdue-projects
 * 
 * Cron job endpoint to automatically update overdue projects.
 * Updates project status from "Aktif" to "Ditunda" when tanggal_selesai has passed.
 * 
 * Security:
 * - Protected by CRON_SECRET environment variable
 * - Should only be called by Vercel Cron or authorized services
 * 
 * Schedule: Daily at 00:00 UTC (configured in vercel.json)
 * 
 * Response Format:
 * {
 *   success: boolean;
 *   updated_count: number;
 *   updated_project_ids: string[];
 *   timestamp: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security (skip in development mode)
    if (process.env.NODE_ENV !== 'development') {
      const authHeader = request.headers.get('authorization');
      const cronSecret = process.env.CRON_SECRET;

      if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: "Database configuration error" },
        { status: 500 }
      );
    }

    // Call the database function to update overdue projects
    const { data, error } = await supabaseAdmin
      .rpc('update_overdue_projects');

    if (error) {
      console.error('Error updating overdue projects:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: "Failed to update overdue projects: " + error.message 
        },
        { status: 500 }
      );
    }

    // Extract results
    const result = data?.[0] || { updated_count: 0, updated_project_ids: [] };

    console.log(`[CRON] Updated ${result.updated_count} overdue projects:`, result.updated_project_ids);

    return NextResponse.json({
      success: true,
      updated_count: result.updated_count,
      updated_project_ids: result.updated_project_ids || [],
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}

// Allow GET for manual testing (only in development)
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { success: false, error: "GET method only available in development" },
      { status: 403 }
    );
  }

  // In development, allow manual trigger without auth
  return POST(request);
}
