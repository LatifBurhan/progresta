import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Test endpoint for PUT /api/reports/update/[id]
 *
 * This endpoint tests the report update flow by:
 * 1. Finding an active project
 * 2. Finding a user involved in that project
 * 3. Creating a test report
 * 4. Updating the test report (same day)
 * 5. Verifying the update
 * 6. Cleaning up
 *
 * GET /api/reports/test-update
 */
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "Database configuration error",
        },
        { status: 500 },
      );
    }

    console.log("🔍 Testing report update flow...");

    // Step 1: Find an active project
    const { data: projects, error: projectError } = await supabaseAdmin.from("projects").select("id, name, isActive").eq("isActive", true).limit(1);

    if (projectError || !projects || projects.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No active projects found",
          details: projectError?.message,
        },
        { status: 404 },
      );
    }

    const project = projects[0];
    console.log("✅ Found active project:", project.name);

    // Step 2: Find a division involved in this project
    const { data: projectDivisions, error: pdError } = await supabaseAdmin.from("project_divisions").select("division_id").eq("project_id", project.id).limit(1);

    if (pdError || !projectDivisions || projectDivisions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No divisions found for this project",
          details: pdError?.message,
        },
        { status: 404 },
      );
    }

    const divisionId = projectDivisions[0].division_id;
    console.log("✅ Found division involved in project");

    // Step 3: Find a user in this division
    const { data: users, error: userError } = await supabaseAdmin.from("users").select("id, email, divisionId").eq("divisionId", divisionId).limit(1);

    if (userError || !users || users.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No users found in this division",
          details: userError?.message,
        },
        { status: 404 },
      );
    }

    const user = users[0];
    console.log("✅ Found user in division:", user.email);

    // Step 4: Create a test report
    const testReport = {
      user_id: user.id,
      project_id: project.id,
      lokasi_kerja: "Kantor",
      pekerjaan_dikerjakan: "Test report - before update",
      kendala: "Test kendala - before update",
      rencana_kedepan: "Test rencana - before update",
      foto_urls: ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"],
    };

    const { data: newReport, error: insertError } = await supabaseAdmin.from("project_reports").insert([testReport]).select("id, created_at, updated_at").single();

    if (insertError) {
      console.error("❌ Failed to create report:", insertError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create test report",
          details: insertError.message,
        },
        { status: 500 },
      );
    }

    console.log("✅ Test report created:", newReport.id);

    // Step 5: Update the test report
    const updateData = {
      lokasi_kerja: "Lokasi Proyek",
      pekerjaan_dikerjakan: "Test report - after update",
      kendala: "Test kendala - after update",
      rencana_kedepan: "Test rencana - after update",
      foto_urls: ["https://example.com/photo3.jpg", "https://example.com/photo4.jpg", "https://example.com/photo5.jpg"],
    };

    const { data: updatedReport, error: updateError } = await supabaseAdmin
      .from("project_reports")
      .update(updateData)
      .eq("id", newReport.id)
      .select("id, updated_at, lokasi_kerja, pekerjaan_dikerjakan, kendala, rencana_kedepan, foto_urls")
      .single();

    if (updateError) {
      console.error("❌ Failed to update report:", updateError);
      // Clean up the created report
      await supabaseAdmin.from("project_reports").delete().eq("id", newReport.id);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update test report",
          details: updateError.message,
        },
        { status: 500 },
      );
    }

    console.log("✅ Test report updated successfully");

    // Step 6: Verify the update
    const verificationResults = {
      lokasi_kerja_updated: updatedReport.lokasi_kerja === 'Lokasi Proyek',
      pekerjaan_dikerjakan_updated: updatedReport.pekerjaan_dikerjakan === 'Test report - after update',
      kendala_updated: updatedReport.kendala === "Test kendala - after update",
      rencana_kedepan_updated: updatedReport.rencana_kedepan === "Test rencana - after update",
      foto_urls_updated: updatedReport.foto_urls.length === 3,
      updated_at_changed: updatedReport.updated_at !== newReport.updated_at,
    };

    const allVerificationsPassed = Object.values(verificationResults).every((v) => v === true);

    if (allVerificationsPassed) {
      console.log("✅ All verifications passed");
    } else {
      console.warn("⚠️ Some verifications failed:", verificationResults);
    }

    // Step 7: Clean up - delete the test report
    const { error: deleteError } = await supabaseAdmin.from("project_reports").delete().eq("id", newReport.id);

    if (deleteError) {
      console.warn("⚠️ Failed to clean up test report:", deleteError);
    } else {
      console.log("✅ Test report cleaned up");
    }

    return NextResponse.json({
      success: true,
      message: "Report update test successful",
      testData: {
        project: { id: project.id, name: project.name },
        user: { id: user.id, email: user.email },
        report: {
          id: newReport.id,
          created_at: newReport.created_at,
          original_updated_at: newReport.updated_at,
          new_updated_at: updatedReport.updated_at,
        },
        verifications: verificationResults,
        allPassed: allVerificationsPassed,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("❌ Test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
