import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Test endpoint to debug project_reports insert issues
 */
export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const results: any = {
      step1_session: { success: true, userId: session.userId },
      step2_supabaseAdmin: { exists: !!supabaseAdmin },
      step3_serviceRoleKey: { 
        configured: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
      },
      step4_rlsStatus: null,
      step5_policies: null,
      step6_grants: null,
      step7_testInsert: null
    };

    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        error: "supabaseAdmin not configured",
        results
      });
    }

    // Check RLS status
    const { data: rlsData, error: rlsError } = await supabaseAdmin
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .eq('schemaname', 'public')
      .eq('tablename', 'project_reports')
      .single();

    results.step4_rlsStatus = {
      success: !rlsError,
      data: rlsData,
      error: rlsError?.message
    };

    // Check policies
    const { data: policiesData, error: policiesError } = await supabaseAdmin
      .from('pg_policies')
      .select('policyname, roles, cmd')
      .eq('tablename', 'project_reports');

    results.step5_policies = {
      success: !policiesError,
      count: policiesData?.length || 0,
      data: policiesData,
      error: policiesError?.message
    };

    // Skip grants check (not critical for test)
    results.step6_grants = {
      success: true,
      data: null,
      error: 'Skipped - not critical'
    };

    // Try test insert
    const testData = {
      user_id: session.userId,
      project_id: '00000000-0000-0000-0000-000000000001', // Fake UUID for test
      lokasi_kerja: 'Kantor',
      pekerjaan_dikerjakan: 'TEST INSERT - DELETE ME',
      foto_urls: ['https://example.com/test.jpg']
    };

    const { data: insertData, error: insertError } = await supabaseAdmin
      .from('project_reports')
      .insert([testData])
      .select('id')
      .single();

    results.step7_testInsert = {
      success: !insertError,
      data: insertData,
      error: insertError ? {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint
      } : null
    };

    // If insert succeeded, delete the test record
    if (insertData?.id) {
      await supabaseAdmin
        .from('project_reports')
        .delete()
        .eq('id', insertData.id);
    }

    return NextResponse.json({
      success: true,
      message: "Debug test completed",
      results
    });

  } catch (error: any) {
    console.error("Test error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Test failed: " + error.message,
        stack: error.stack
      },
      { status: 500 }
    );
  }
}
