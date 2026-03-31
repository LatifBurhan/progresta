import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * GET /api/dashboard/stats
 * 
 * Retrieves dashboard statistics for the current user or all users (for admin)
 * 
 * Query Parameters:
 * - period: 'day' | 'week' | 'month' | 'year' (default: 'day')
 * - user_id: string (optional, admin only - to get stats for specific user)
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

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'day';
    const targetUserId = searchParams.get('user_id');

    // Check if user is admin
    const isAdmin = ['ADMIN', 'GENERAL_AFFAIR', 'CEO'].includes(session.role);

    // Determine which user's stats to fetch
    const userId = (isAdmin && targetUserId) ? targetUserId : session.userId;

    // Get date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    }

    // 1. Total Reports (all time or for specific user)
    let totalReportsQuery = supabaseAdmin
      .from('project_reports')
      .select('id', { count: 'exact', head: true });

    if (!isAdmin || targetUserId) {
      totalReportsQuery = totalReportsQuery.eq('user_id', userId);
    }

    const { count: totalReports } = await totalReportsQuery;

    // 2. Reports in current period
    let periodReportsQuery = supabaseAdmin
      .from('project_reports')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    if (!isAdmin || targetUserId) {
      periodReportsQuery = periodReportsQuery.eq('user_id', userId);
    }

    const { count: periodReports } = await periodReportsQuery;

    // 3. Total Projects Worked On (projects with at least one report)
    let projectsQuery = supabaseAdmin
      .from('project_reports')
      .select('project_id');

    if (!isAdmin || targetUserId) {
      projectsQuery = projectsQuery.eq('user_id', userId);
    }

    const { data: reportProjects } = await projectsQuery;
    const uniqueProjects = new Set((reportProjects || []).map((r: any) => r.project_id));
    const totalProjectsWorked = uniqueProjects.size;

    // 4. Active Projects User is Involved In (via division)
    let activeProjects = 0;
    let activeProjectsList: any[] = [];

    if (!isAdmin || targetUserId) {
      // Get user's division
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('"divisionId"')
        .eq('id', userId)
        .single();

      if (user && (user as any).divisionId) {
        // Get active projects for this division
        const { data: projectDivisions } = await supabaseAdmin
          .from('project_divisions')
          .select(`
            project_id,
            projects!inner (
              id,
              name,
              description,
              isActive
            )
          `)
          .eq('division_id', (user as any).divisionId)
          .eq('projects.isActive', true);

        activeProjects = projectDivisions?.length || 0;
        activeProjectsList = (projectDivisions || []).map((pd: any) => pd.projects);
      }
    } else {
      // For admin overview, count all active projects
      const { count } = await supabaseAdmin
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('isActive', true);
      
      activeProjects = count || 0;
    }

    // 5. Today's Progress (for individual user only)
    let todayProgress = 0;
    if (!isAdmin || targetUserId) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: todayReports } = await supabaseAdmin
        .from('project_reports')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', today.toISOString());

      // 3 reports per day = 100%
      todayProgress = Math.min(((todayReports || 0) / 3) * 100, 100);
    }

    // 6. Average Reports per Day (all time)
    let avgReportsPerDay = 0;
    if (!isAdmin || targetUserId) {
      const { data: allReports } = await supabaseAdmin
        .from('project_reports')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (allReports && allReports.length > 0) {
        const firstReportDate = new Date(allReports[0].created_at);
        const today = new Date();
        const daysDiff = Math.ceil((today.getTime() - firstReportDate.getTime()) / (1000 * 60 * 60 * 24));
        avgReportsPerDay = daysDiff > 0 ? allReports.length / daysDiff : 0;
      }
    }

    // 7. Location Breakdown
    let locationBreakdown: { name: string; value: number; color: string }[] = [];
    if (!isAdmin || targetUserId) {
      const { data: locationData } = await supabaseAdmin
        .from('project_reports')
        .select('lokasi_kerja')
        .eq('user_id', userId);

      const locationCounts: Record<string, number> = {
        'WFA': 0,
        'Al-Wustho': 0,
        'Client Site': 0
      };

      (locationData || []).forEach((report: any) => {
        locationCounts[report.lokasi_kerja] = (locationCounts[report.lokasi_kerja] || 0) + 1;
      });

      locationBreakdown = [
        { name: 'WFA', value: locationCounts['WFA'], color: '#3b82f6' },
        { name: 'Al-Wustho', value: locationCounts['Al-Wustho'], color: '#f97316' },
        { name: 'Client Site', value: locationCounts['Client Site'], color: '#10b981' }
      ];
    }

    // 8. Kendala Statistics
    let kendalaStats = { withKendala: 0, withoutKendala: 0, percentage: 0 };
    if (!isAdmin || targetUserId) {
      const { data: allReportsKendala } = await supabaseAdmin
        .from('project_reports')
        .select('kendala')
        .eq('user_id', userId);

      const withKendala = (allReportsKendala || []).filter((r: any) => r.kendala && r.kendala.trim() !== '').length;
      const total = allReportsKendala?.length || 0;
      
      kendalaStats = {
        withKendala,
        withoutKendala: total - withKendala,
        percentage: total > 0 ? Math.round((withKendala / total) * 100) : 0
      };
    }

    // 9. Trend Data for Chart (last 7 days, 4 weeks, 12 months, or 12 months for year)
    let trendData: { date: string; count: number }[] = [];
    
    if (period === 'day') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        let query = supabaseAdmin
          .from('project_reports')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', date.toISOString())
          .lt('created_at', nextDate.toISOString());

        if (!isAdmin || targetUserId) {
          query = query.eq('user_id', userId);
        }

        const { count } = await query;
        
        trendData.push({
          date: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
          count: count || 0
        });
      }
    } else if (period === 'week') {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7) - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        let query = supabaseAdmin
          .from('project_reports')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', weekStart.toISOString())
          .lt('created_at', weekEnd.toISOString());

        if (!isAdmin || targetUserId) {
          query = query.eq('user_id', userId);
        }

        const { count } = await query;
        
        trendData.push({
          date: `Minggu ${4 - i}`,
          count: count || 0
        });
      }
    } else if (period === 'month') {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const monthStart = new Date();
        monthStart.setMonth(monthStart.getMonth() - i);
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        let query = supabaseAdmin
          .from('project_reports')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', monthStart.toISOString())
          .lt('created_at', monthEnd.toISOString());

        if (!isAdmin || targetUserId) {
          query = query.eq('user_id', userId);
        }

        const { count } = await query;
        
        trendData.push({
          date: monthStart.toLocaleDateString('id-ID', { month: 'short' }),
          count: count || 0
        });
      }
    } else if (period === 'year') {
      // Last 5 years
      for (let i = 4; i >= 0; i--) {
        const yearStart = new Date();
        yearStart.setFullYear(yearStart.getFullYear() - i);
        yearStart.setMonth(0);
        yearStart.setDate(1);
        yearStart.setHours(0, 0, 0, 0);
        
        const yearEnd = new Date(yearStart);
        yearEnd.setFullYear(yearEnd.getFullYear() + 1);

        let query = supabaseAdmin
          .from('project_reports')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', yearStart.toISOString())
          .lt('created_at', yearEnd.toISOString());

        if (!isAdmin || targetUserId) {
          query = query.eq('user_id', userId);
        }

        const { count } = await query;
        
        trendData.push({
          date: yearStart.getFullYear().toString(),
          count: count || 0
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalReports: totalReports || 0,
        periodReports: periodReports || 0,
        totalProjectsWorked,
        activeProjects,
        activeProjectsList: (!isAdmin || targetUserId) ? activeProjectsList : [],
        todayProgress: (!isAdmin || targetUserId) ? Math.round(todayProgress) : null,
        avgReportsPerDay: (!isAdmin || targetUserId) ? Number(avgReportsPerDay.toFixed(2)) : null,
        locationBreakdown: (!isAdmin || targetUserId) ? locationBreakdown : [],
        kendalaStats: (!isAdmin || targetUserId) ? kendalaStats : null,
        trendData,
        period
      }
    });

  } catch (error: any) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}
