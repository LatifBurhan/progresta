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

    let userRole: string;

    if (currentUserError || !currentUser) {
      // Fallback to Supabase Auth when user not found in database
      console.log('[INFO] User not found in database, attempting fallback to Supabase Auth...');
      
      try {
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(
          session.userId
        );

        if (authError || !authUser || !authUser.user) {
          console.log('[ERROR] User not found in Auth:', authError?.message || 'No user data');
          return NextResponse.json(
            { success: false, error: "User not found in database or authentication system" },
            { status: 404 }
          );
        }

        // Try to get role from user_metadata, if not available, default to ADMIN
        userRole = authUser.user.user_metadata?.role || 'ADMIN';
        console.log('[SUCCESS] Using role from Supabase Auth:', userRole);

        // Auto-create user in database for future requests
        try {
          const { error: insertError } = await supabaseAdmin
            .from('users')
            .insert({
              id: authUser.user.id,
              email: authUser.user.email,
              role: userRole,
              status: 'ACTIVE',
              divisionId: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            });

          if (insertError) {
            // Check if error is duplicate key (user already exists)
            if (insertError.code === '23505') {
              console.log('[INFO] User already exists in database, skipping insert');
            } else {
              console.log('[WARN] Failed to auto-create user in database:', insertError.message);
            }
            // Continue anyway, user can still access via Auth
          } else {
            console.log('[SUCCESS] Auto-created user in database:', authUser.user.id);
          }
        } catch (insertErr: any) {
          console.log('[WARN] Error auto-creating user:', insertErr.message);
          // Continue anyway
        }
      } catch (fallbackError: any) {
        console.log('[ERROR] Fallback to Auth failed:', fallbackError.message);
        return NextResponse.json(
          { success: false, error: "User not found" },
          { status: 404 }
        );
      }
    } else {
      // User found in database, use existing flow
      userRole = currentUser.role;
      console.log('[INFO] Using role from database:', userRole);
    }

    // Check if user is admin
    const isAdmin = ['ADMIN', 'HRD', 'CEO'].includes(userRole);

    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Admin access required. Your role: " + userRole },
        { status: 403 }
      );
    }

    // Get all users - only select columns that exist
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .order('email', { ascending: true });

    if (usersError) {
      console.log('[ERROR] Error fetching users:', usersError.message);
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
    console.log('[ERROR] Dashboard users error:', error.message);
    return NextResponse.json(
      { success: false, error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
