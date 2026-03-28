import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { deserializeFotoUrls } from "@/lib/utils/foto-urls-parser";
import { canEditReport } from "@/lib/validations/report-validation";
import type { 
  ReportFilters, 
  ListReportsResponse, 
  ProjectReportWithDetails 
} from "@/types/report";

/**
 * GET /api/reports/list
 * 
 * Retrieves a list of progress reports with filtering and pagination.
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5
 * 
 * Authorization:
 * - Regular users see only their own reports
 * - Admin users (ADMIN, HRD, CEO) see all reports
 * 
 * Query Parameters:
 * - project_id?: string - Filter by specific project
 * - start_date?: string - Filter reports from this date (ISO format)
 * - end_date?: string - Filter reports until this date (ISO format)
 * - limit?: number - Number of reports per page (default: 20)
 * - offset?: number - Pagination offset (default: 0)
 * 
 * Response:
 * {
 *   success: boolean;
 *   data?: {
 *     reports: ProjectReportWithDetails[];
 *     total: number;
 *     has_more: boolean;
 *   };
 *   error?: string;
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Requirement 4.1, 5.1: Validate authentication
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const filters: ReportFilters = {
      project_id: searchParams.get('project_id') || undefined,
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0')
    };

    // Validate pagination parameters
    if (filters.limit && (filters.limit < 1 || filters.limit > 100)) {
      return NextResponse.json(
        { success: false, error: "Limit must be between 1 and 100" },
        { status: 400 }
      );
    }

    if (filters.offset && filters.offset < 0) {
      return NextResponse.json(
        { success: false, error: "Offset must be non-negative" },
        { status: 400 }
      );
    }

    // Check if user is admin
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', session.userId)
      .single();

    if (userError || !user) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const isAdmin = ['ADMIN', 'HRD', 'CEO'].includes(user.role);

    // Build query - get reports first
    // Requirement 4.5, 5.5: We'll fetch user and project names separately
    let query = supabaseAdmin
      .from('project_reports')
      .select('*', { count: 'exact' });

    // Requirement 4.1: Apply RLS - users see only their own reports
    // Requirement 5.1: Admins see all reports
    if (!isAdmin) {
      query = query.eq('user_id', session.userId);
    }

    // Requirement 4.2, 5.2: Apply project filter
    if (filters.project_id) {
      query = query.eq('project_id', filters.project_id);
    }

    // Requirement 10.5: Apply date range filters
    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date);
    }

    if (filters.end_date) {
      // Add one day to include the entire end date
      const endDate = new Date(filters.end_date);
      endDate.setDate(endDate.getDate() + 1);
      query = query.lt('created_at', endDate.toISOString());
    }

    // Requirement 4.4, 5.4: Sort by created_at DESC (newest first)
    query = query.order('created_at', { ascending: false });

    // Apply pagination
    query = query.range(
      filters.offset || 0,
      (filters.offset || 0) + (filters.limit || 20) - 1
    );

    const { data: reports, error: queryError, count } = await query;

    if (queryError) {
      console.error('Error fetching reports:', queryError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch reports: " + queryError.message },
        { status: 500 }
      );
    }

    // Fetch user and project names separately
    const userIds = [...new Set((reports || []).map((r: any) => r.user_id))];
    const projectIds = [...new Set((reports || []).map((r: any) => r.project_id))];

    // Fetch users
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id, name')
      .in('id', userIds);

    // Fetch projects
    const { data: projects } = await supabaseAdmin
      .from('projects')
      .select('id, name')
      .in('id', projectIds);

    // Create lookup maps
    const userMap = new Map((users || []).map((u: any) => [u.id, u.name]));
    const projectMap = new Map((projects || []).map((p: any) => [p.id, p.name]));

    // Transform reports to include computed fields
    const reportsWithDetails: ProjectReportWithDetails[] = (reports || []).map((report: any) => {
      // Deserialize foto_urls from TEXT[] to string[]
      const fotoUrls = deserializeFotoUrls(report.foto_urls);

      // Requirement 4.5, 5.5: Calculate can_edit flag (same day only)
      const can_edit = canEditReport(
        {
          id: report.id,
          user_id: report.user_id,
          project_id: report.project_id,
          lokasi_kerja: report.lokasi_kerja,
          pekerjaan_dikerjakan: report.pekerjaan_dikerjakan,
          kendala: report.kendala,
          rencana_kedepan: report.rencana_kedepan,
          foto_urls: fotoUrls,
          created_at: report.created_at,
          updated_at: report.updated_at
        },
        session.userId
      );

      // Requirement 4.5, 5.5: Calculate can_delete flag
      // Users can delete own reports, admins can delete any
      const can_delete = report.user_id === session.userId || isAdmin;

      return {
        id: report.id,
        user_id: report.user_id,
        user_name: userMap.get(report.user_id) || 'Unknown User',
        project_id: report.project_id,
        project_name: projectMap.get(report.project_id) || 'Unknown Project',
        lokasi_kerja: report.lokasi_kerja,
        pekerjaan_dikerjakan: report.pekerjaan_dikerjakan,
        kendala: report.kendala,
        rencana_kedepan: report.rencana_kedepan,
        foto_urls: fotoUrls,
        created_at: report.created_at,
        updated_at: report.updated_at,
        can_edit,
        can_delete
      };
    });

    // Calculate pagination metadata
    const total = count || 0;
    const has_more = (filters.offset || 0) + (filters.limit || 20) < total;

    // Return response
    const response: ListReportsResponse = {
      reports: reportsWithDetails,
      total,
      has_more
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error: any) {
    console.error("List reports error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
