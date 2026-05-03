import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Cron job to delete expired notifications (older than 3 days)
 * 
 * Setup in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup-notifications",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 * 
 * Or call manually for testing
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security (optional but recommended)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: "Database configuration error" },
        { status: 500 }
      );
    }

    // Delete notifications older than 3 days
    const { data, error } = await supabaseAdmin
      .from("notifications")
      .delete()
      .lt("expires_at", new Date().toISOString())
      .select("id");

    if (error) {
      console.error("Failed to cleanup notifications:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to cleanup notifications: " + error.message,
        },
        { status: 500 }
      );
    }

    const deletedCount = data?.length || 0;

    console.log(`Cleanup completed: ${deletedCount} expired notifications deleted`);

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${deletedCount} expired notifications`,
      deletedCount,
    });
  } catch (error: any) {
    console.error("Cleanup notifications error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error: " + error.message,
      },
      { status: 500 }
    );
  }
}

// Allow POST as well for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
