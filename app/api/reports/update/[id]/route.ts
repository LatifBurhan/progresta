import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";
import { validateReportForm } from "@/lib/validations/report-validation";
import { canEditReport } from "@/lib/validations/report-validation";
import { serializeFotoUrls } from "@/lib/utils/foto-urls-parser";
import type { UpdateReportRequest, UpdateReportResponse } from "@/types/report";

/**
 * PUT /api/reports/update/[id]
 * 
 * Updates an existing progress report.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 * 
 * Validation:
 * - User must be authenticated
 * - User must be the report creator
 * - Current date must equal report creation date (same-day edit only)
 * - If project_id is changed, must reference an active project
 * - If project_id is changed, user must be involved in the new project
 * - lokasi_kerja must be one of: 'Kantor', 'Lokasi Proyek', 'Remote'
 * - pekerjaan_dikerjakan is required
 * - foto_urls must contain 1-5 valid URLs
 * 
 * Request Body:
 * {
 *   project_id?: string;
 *   lokasi_kerja?: 'Kantor' | 'Lokasi Proyek' | 'Remote';
 *   pekerjaan_dikerjakan?: string;
 *   kendala?: string;
 *   rencana_kedepan?: string;
 *   foto_urls?: string[];
 * }
 * 
 * Response:
 * {
 *   success: boolean;
 *   data?: {
 *     id: string;
 *     updated_at: string;
 *   };
 *   error?: string;
 *   details?: Record<string, string>;
 * }
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    // Requirement 2.1: Validate authentication
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

    // Fetch existing report
    const { data: existingReport, error: fetchError } = await supabaseAdmin
      .from('project_reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (fetchError || !existingReport) {
      console.error('Error fetching report:', fetchError);
      return NextResponse.json(
        { success: false, error: "Report not found" },
        { status: 404 }
      );
    }

    // Requirement 2.1: Validate user is report creator
    if (existingReport.user_id !== session.userId) {
      return NextResponse.json(
        { success: false, error: "You are not authorized to edit this report" },
        { status: 403 }
      );
    }

    // Requirement 2.2: Validate same-day edit
    if (!canEditReport(existingReport, session.userId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Reports can only be edited on the same day they were created" 
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body: Partial<UpdateReportRequest> = await request.json();

    // Merge with existing data for validation
    const mergedData = {
      project_id: body.project_id ?? existingReport.project_id,
      lokasi_kerja: body.lokasi_kerja ?? existingReport.lokasi_kerja,
      pekerjaan_dikerjakan: body.pekerjaan_dikerjakan ?? existingReport.pekerjaan_dikerjakan,
      kendala: body.kendala !== undefined ? body.kendala : existingReport.kendala,
      rencana_kedepan: body.rencana_kedepan !== undefined ? body.rencana_kedepan : existingReport.rencana_kedepan,
      foto_urls: body.foto_urls ?? existingReport.foto_urls,
      period: body.period ?? existingReport.period
    };

    // Requirement 2.4: Validate request body (same rules as create)
    const validationErrors = validateReportForm(mergedData);
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

    // Validate lokasi_kerja if provided
    if (body.lokasi_kerja) {
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
    }

    // Validate foto_urls count (1-5)
    if (!mergedData.foto_urls || mergedData.foto_urls.length < 1 || mergedData.foto_urls.length > 5) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid foto_urls count",
          details: { foto_urls: "Must contain 1-5 photo URLs" }
        },
        { status: 400 }
      );
    }

    // If project_id is being changed, validate the new project
    if (body.project_id && body.project_id !== existingReport.project_id) {
      // Validate project is active
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

      // Validate user-project relationship via project_divisions
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('"divisionId"')
        .eq('id', session.userId)
        .single();

      if (userError || !user) {
        console.error('Error fetching user:', userError);
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }

      const userDivisionId = (user as any).divisionId;
      
      if (!userDivisionId) {
        return NextResponse.json(
          { success: false, error: "User has no division assigned" },
          { status: 400 }
        );
      }

      // Check if user's division is involved in the new project
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
    }

    // Prepare update data
    const updateData: any = {};
    
    if (body.project_id !== undefined) {
      updateData.project_id = body.project_id;
    }
    if (body.lokasi_kerja !== undefined) {
      updateData.lokasi_kerja = body.lokasi_kerja;
    }
    if (body.pekerjaan_dikerjakan !== undefined) {
      updateData.pekerjaan_dikerjakan = body.pekerjaan_dikerjakan;
    }
    if (body.kendala !== undefined) {
      updateData.kendala = body.kendala || null;
    }
    if (body.rencana_kedepan !== undefined) {
      updateData.rencana_kedepan = body.rencana_kedepan || null;
    }
    if (body.foto_urls !== undefined) {
      updateData.foto_urls = serializeFotoUrls(body.foto_urls);
    }

    // Requirement 2.5: Update record in database (updated_at will be auto-updated by trigger)
    const { data: updatedReport, error: updateError } = await supabaseAdmin
      .from('project_reports')
      .update(updateData)
      .eq('id', reportId)
      .select('id, updated_at')
      .single();

    if (updateError) {
      console.error('Error updating report:', updateError);
      return NextResponse.json(
        { success: false, error: "Failed to update report: " + updateError.message },
        { status: 500 }
      );
    }

    // Requirement 2.5: Return success response with updated_at timestamp
    return NextResponse.json({
      success: true,
      data: {
        id: updatedReport.id,
        updated_at: updatedReport.updated_at
      } as UpdateReportResponse
    });

  } catch (error: any) {
    console.error("Update report error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
