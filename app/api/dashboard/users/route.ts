import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/dashboard/users
 * 
 * Retrieves list of all users with their basic stats (admin only)
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

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: "Database configuration error" },
        { status: 500 }
      );
    }

    // Get current user's role from database
    const { data: currentUser, error: currentUserError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', session.userId)
      .single();

    if (currentUserError || !currentUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is admin
    const isAdmin = ['ADMIN', 'HRD', 'CEO'].includes(currentUser.role);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required. Your role: " + currentUser.role },
        { status: 403 }
      );
    }

    // Get all users - only select columns that exist
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .order('email', { ascending: true });

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch users: " + usersError.message },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // Get report counts for each user
    const userIds = users.map((u: any) => u.id);
    
    const { data: reportCounts } = await supabaseAdmin
      .from('project_reports')
      .select('user_id')
      .in('user_id', userIds);

    // Count reports per user
    const reportCountMap = new Map<string, number>();
    (reportCounts || []).forEach((r: any) => {
      reportCountMap.set(r.user_id, (reportCountMap.get(r.user_id) || 0) + 1);
    });

    // Get today's report counts
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todayReports } = await supabaseAdmin
      .from('project_reports')
      .select('user_id')
      .in('user_id', userIds)
      .gte('created_at', today.toISOString());

    const todayCountMap = new Map<string, number>();
    (todayReports || []).forEach((r: any) => {
      todayCountMap.set(r.user_id, (todayCountMap.get(r.user_id) || 0) + 1);
    });

    // Combine data - without division and photo for now
    const usersWithStats = users.map((user: any) => {
      const totalReports = reportCountMap.get(user.id) || 0;
      const todayReportsCount = todayCountMap.get(user.id) || 0;
      const todayProgress = Math.min((todayReportsCount / 3) * 100, 100);

      return {
        id: user.id,
        name: user.email?.split('@')[0] || 'Unknown',
        email: user.email || 'No email',
        role: user.role || 'KARYAWAN',
        fotoProfil: null,
        divisionName: '-',
        totalReports,
        todayReports: todayReportsCount,
        todayProgress: Math.round(todayProgress)
      };
    });

    return NextResponse.json({
      success: true,
      data: usersWithStats
    });

  } catch (error: any) {
    console.error("Dashboard users error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
