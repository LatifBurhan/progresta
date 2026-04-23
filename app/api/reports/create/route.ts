import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { validateReportForm } from "@/lib/validations/report-validation";
import { serializeFotoUrls } from "@/lib/utils/foto-urls-parser";
import type { CreateReportRequest, CreateReportResponse } from "@/types/report";

/**
 * POST /api/reports/create
 * 
 * Creates a new progress report for a project.
 * 
 * Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.11, 7.3, 7.4, 7.5
 * 
 * Validation:
 * - User must be authenticated
 * - project_id must reference an active project
 * - User must be involved in the project via project_divisions
 * - lokasi_kerja must be one of: 'Kantor', 'Lokasi Proyek', 'Remote'
 * - pekerjaan_dikerjakan is required
 * - foto_urls must contain 1-5 valid URLs
 * 
 * Request Body:
 * {
 *   project_id: string;
 *   lokasi_kerja: 'Kantor' | 'Lokasi Proyek' | 'Remote';
 *   pekerjaan_dikerjakan: string;
 *   kendala?: string;
 *   rencana_kedepan?: string;
 *   foto_urls: string[];
 * }
 * 
 * Response:
 * {
 *   success: boolean;
 *   data?: {
 *     id: string;
 *     created_at: string;
 *   };
 *   error?: string;
 *   details?: Record<string, string>;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Requirement 7.3: Validate authentication
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

    // Parse request body
    const body: CreateReportRequest = await request.json();

    // Requirement 7.3: Validate request body (required fields)
    const validationErrors = validateReportForm(body);
    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationErrors
        },
        { status: 400 }
      );
    }

    // Requirement 7.5: Validate lokasi_kerja values
    const validLokasiKerja = ['Kantor', 'Lokasi Proyek', 'Remote'];
    if (!validLokasiKerja.includes(body.lokasi_kerja)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid lokasi_kerja value",
          details: { lokasi_kerja: "Must be one of: Kantor, Lokasi Proyek, Remote" }
        },
        { status: 400 }
      );
    }

    // Requirement 7.5: Validate foto_urls count (0-5, foto opsional)
    if (body.foto_urls && body.foto_urls.length > 5) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid foto_urls count",
          details: { foto_urls: "Maximum 5 photos allowed" }
        },
        { status: 400 }
      );
    }

    // Requirement 7.5: Validate project is active
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id, name, status')
      .eq('id', body.project_id)
      .single();

    if (projectError || !project) {
      console.error('Error fetching project:', projectError);
      return NextResponse.json(
        { success: false, error: "Project not found" },
        { status: 404 }
      );
    }

    if (project.status !== 'Aktif') {
      return NextResponse.json(
        { success: false, error: "Project is not active" },
        { status: 400 }
      );
    }

    // Requirement 7.4: Validate user-project relationship via project_assignments or project_divisions
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

    const userDivisionId = user.divisionId;
    
    if (!userDivisionId) {
      return NextResponse.json(
        { success: false, error: "User has no division assigned" },
        { status: 400 }
      );
    }

    // First check if user is specifically assigned to this project
    const { data: userAssignment, error: assignmentError } = await supabaseAdmin
      .from('project_assignments')
      .select('id')
      .eq('project_id', body.project_id)
      .eq('user_id', session.userId)
      .maybeSingle();

    if (assignmentError) {
      console.error('Error checking project assignment:', assignmentError);
      return NextResponse.json(
        { success: false, error: "Failed to verify project access" },
        { status: 500 }
      );
    }

    // If user is specifically assigned, allow access
    if (userAssignment) {
      // User is assigned, proceed with report creation
    } else {
      // Check if user's division is involved in the project
      const { data: projectDivision, error: pdError } = await supabaseAdmin
        .from('project_divisions')
        .select('id')
        .eq('project_id', body.project_id)
        .eq('division_id', userDivisionId)
        .maybeSingle();

      if (pdError) {
        console.error('Error checking project division:', pdError);
        return NextResponse.json(
          { success: false, error: "Failed to verify project access" },
          { status: 500 }
        );
      }

      if (!projectDivision) {
        return NextResponse.json(
          { success: false, error: "You are not authorized to report on this project" },
          { status: 403 }
        );
      }

      // Check if this project has specific assignments
      const { data: projectAssignments, error: paError } = await supabaseAdmin
        .from('project_assignments')
        .select('id')
        .eq('project_id', body.project_id)
        .limit(1);

      if (paError) {
        console.error('Error checking project assignments:', paError);
        return NextResponse.json(
          { success: false, error: "Failed to verify project access" },
          { status: 500 }
        );
      }

      // If project has specific assignments but user is not assigned, deny access
      if (projectAssignments && projectAssignments.length > 0) {
        return NextResponse.json(
          { success: false, error: "You are not assigned to this project" },
          { status: 403 }
        );
      }
    }

    // User has access to the project, continue with report creation

    // Requirement 7.5: Serialize foto_urls for database storage (empty array if no photos)
    const serializedFotoUrls = serializeFotoUrls(body.foto_urls || []);

    // Requirement 7.5: Insert record to database
    // After Supabase restart, PostgREST should have reloaded schema cache
    const { data: newReport, error: insertError } = await supabaseAdmin
      .from('project_reports')
      .insert([{
        user_id: session.userId,
        project_id: body.project_id,
        period: body.period,
        lokasi_kerja: body.lokasi_kerja,
        pekerjaan_dikerjakan: body.pekerjaan_dikerjakan,
        kendala: body.kendala || null,
        rencana_kedepan: body.rencana_kedepan || null,
        foto_urls: serializedFotoUrls
      }])
      .select('id, created_at')
      .single();

    if (insertError) {
      console.error('Error creating report:', insertError);
      return NextResponse.json(
        { success: false, error: "Failed to create report: " + insertError.message },
        { status: 500 }
      );
    }

    // Requirement 7.5: Return success response with report id
    return NextResponse.json({
      success: true,
      data: {
        id: newReport.id,
        created_at: newReport.created_at
      } as CreateReportResponse
    });

  } catch (error: any) {
    console.error("Create report error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
