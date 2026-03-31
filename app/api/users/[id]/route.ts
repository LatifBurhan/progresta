import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/users/[id]
 * 
 * Get user details by ID
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

    const userId = params.id;

    // Get user data - select all profile fields
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, phone, role, status, employee_status, address, "fotoProfil", "createdAt"')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { success: false, error: "User not found: " + (userError?.message || 'Unknown error') },
        { status: 404 }
      );
    }

    // Try to get divisionId separately
    const { data: userWithDivision } = await supabaseAdmin
      .from('users')
      .select('"divisionId"')
      .eq('id', userId)
      .single();

    const divisionId = userWithDivision?.divisionId;

    // Get division data if user has divisionId
    let divisionData = null;
    if (divisionId) {
      const { data: division } = await supabaseAdmin
        .from('divisions')
        .select('id, name, description, color')
        .eq('id', divisionId)
        .single();
      
      divisionData = division;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        divisionId: divisionId,
        divisions: divisionData
      }
    });

  } catch (error: any) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
