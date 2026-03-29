import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { deserializeFotoUrls } from "@/lib/utils/foto-urls-parser";

/**
 * GET /api/reports/[id]
 * 
 * Retrieves a single progress report by ID.
 * User must be authenticated and either:
 * - The report creator, OR
 * - Have admin role (ADMIN, HRD, CEO)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
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

    // Fetch report
    const { data: report, error: fetchError } = await supabaseAdmin
      .from('project_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (fetchError || !report) {
      console.error('Error fetching report:', fetchError);
      return NextResponse.json(
        { success: false, error: "Report not found" },
        { status: 404 }
      );
    }

    // Check authorization
    const isCreator = report.user_id === session.userId;
    const adminRoles = ['ADMIN', 'HRD', 'CEO'];
    const isAdmin = adminRoles.includes(session.role);

    if (!isCreator && !isAdmin) {
      return NextResponse.json(
        { success: false, error: "You are not authorized to view this report" },
        { status: 403 }
      );
    }

    // Deserialize foto_urls
    const fotoUrls = deserializeFotoUrls(report.foto_urls);

    return NextResponse.json({
      success: true,
      data: {
        ...report,
        foto_urls: fotoUrls
      }
    });

  } catch (error: any) {
    console.error("Get report error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}