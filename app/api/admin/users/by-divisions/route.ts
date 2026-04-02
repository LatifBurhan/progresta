import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/admin/users/by-divisions?divisionIds=id1,id2
 * 
 * Mengambil daftar user berdasarkan beberapa divisionId
 */
export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();

    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const divisionIdsStr = searchParams.get("divisionIds");

    if (!divisionIdsStr) {
      return NextResponse.json({ success: true, users: [] });
    }

    const divisionIds = divisionIdsStr.split(",");

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, message: "Database configuration error" }, { status: 500 });
    }

    const { data: users, error } = await supabaseAdmin
      .from("users")
      .select("id, email, name, role, divisionId")
      .in("divisionId", divisionIds)
      .eq("status", "ACTIVE")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching users by divisions:", error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      users: users || []
    });

  } catch (error: any) {
    console.error("Internal server error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
