import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { supabaseAdmin } from "@/lib/supabase";

// Enable caching with 60 second revalidation
export const revalidate = 60;

/**
 * OPTIMIZED VERSION - Reduces 15+ queries to 3-4 queries
 * GET /api/dashboard/stats-optimized
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

    const isAdmin = ['ADMIN', 'GENERAL_AFFAIR', 'CEO'].includes(session.role);
    
    // For admin without specific user_id, show all reports
    // For non-admin or admin with user_id, show specific user reports
    const userId = targetUserId || (!isAdmin ? session.userId : null);

    // Get date range
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // OPTIMIZATION 1: Single query for all report stats
    let reportStatsQuery = supabaseAdmin
      .from('project_reports')
      .select('id, created_at, project_id, lokasi_kerja, kendala');
    
    // Filter by user_id only if specified (non-admin or admin viewing specific user)
    if (userId) {
      reportStatsQuery = reportStatsQuery.eq('user_id', userId);
    }
    
    const reportStatsPromise = reportStatsQuery;

    // OPTIMIZATION 2: Get user division and projects in parallel
    const userDataPromise = userId
      ? supabaseAdmin
          .from('users')
          .select('"divisionId"')
          .eq('id', userId)
          .single()
      : Promise.resolve({ data: null });

    // Execute in parallel
    const [reportStatsResult, userDataResult] = await Promise.all([
      reportStatsPromise,
      userDataPromise
    ]);

    const allReports = reportStatsResult.data || [];

    // Calculate all stats from single dataset
    const totalReports = allReports.length;
    const periodReports = allReports.filter(r => 
      new Date(r.created_at) >= startDate
    ).length;
    
    const todayReports = allReports.filter(r => 
      new Date(r.created_at) >= today
    ).length;

    const uniqueProjects = new Set(allReports.map(r => r.project_id));
    const totalProjectsWorked = uniqueProjects.size;

    // Today's progress (only for specific user view)
    const todayProgress = userId
      ? Math.min((todayReports / 3) * 100, 100)
      : 0;

    // Average reports per day (only for specific user view)
    let avgReportsPerDay = 0;
    if (userId && allReports.length > 0) {
      const sortedReports = [...allReports].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      const firstReportDate = new Date(sortedReports[0].created_at);
      const daysDiff = Math.ceil((now.getTime() - firstReportDate.getTime()) / (1000 * 60 * 60 * 24));
      avgReportsPerDay = daysDiff > 0 ? allReports.length / daysDiff : 0;
    }

    // Location breakdown (only for specific user view)
    const locationCounts: Record<string, number> = {
      'Remote': 0,
      'Kantor': 0,
      'Lokasi Proyek': 0
    };
    
    if (userId) {
      allReports.forEach(report => {
        locationCounts[report.lokasi_kerja] = (locationCounts[report.lokasi_kerja] || 0) + 1;
      });
    }

    const locationBreakdown = [
      { name: 'Remote', value: locationCounts['Remote'], color: '#3b82f6' },
      { name: 'Kantor', value: locationCounts['Kantor'], color: '#f97316' },
      { name: 'Lokasi Proyek', value: locationCounts['Lokasi Proyek'], color: '#10b981' }
    ];

    // Kendala stats
    const withKendala = allReports.filter(r => r.kendala && r.kendala.trim() !== '').length;
    const kendalaStats = {
      withKendala,
      withoutKendala: totalReports - withKendala,
      percentage: totalReports > 0 ? Math.round((withKendala / totalReports) * 100) : 0
    };

    // Trend data - optimized from in-memory data
    let trendData: { date: string; count: number }[] = [];
    
    if (period === 'day') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const count = allReports.filter(r => {
          const reportDate = new Date(r.created_at);
          return reportDate >= date && reportDate < nextDate;
        }).length;
        
        trendData.push({
          date: date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
          count
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

        const count = allReports.filter(r => {
          const reportDate = new Date(r.created_at);
          return reportDate >= weekStart && reportDate < weekEnd;
        }).length;
        
        trendData.push({
          date: `Minggu ${4 - i}`,
          count
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

        const count = allReports.filter(r => {
          const reportDate = new Date(r.created_at);
          return reportDate >= monthStart && reportDate < monthEnd;
        }).length;
        
        trendData.push({
          date: monthStart.toLocaleDateString('id-ID', { month: 'short' }),
          count
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

        const count = allReports.filter(r => {
          const reportDate = new Date(r.created_at);
          return reportDate >= yearStart && reportDate < yearEnd;
        }).length;
        
        trendData.push({
          date: yearStart.getFullYear().toString(),
          count
        });
      }
    }

    // OPTIMIZATION 3: Get active projects efficiently
    let activeProjects = 0;
    let activeProjectsList: any[] = [];

    if (userId) {
      const userData = userDataResult.data;
      
      if (userData && (userData as any).divisionId) {
        // Single query with joins
        const { data: projectData } = await supabaseAdmin
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
          .eq('division_id', (userData as any).divisionId)
          .eq('projects.isActive', true);

        if (projectData && projectData.length > 0) {
          const projectIds = projectData.map((pd: any) => pd.project_id);
          
          // Get assignments in single query
          const { data: assignments } = await supabaseAdmin
            .from('project_assignments')
            .select('project_id, user_id')
            .in('project_id', projectIds);

          const projectsWithAssignments = new Set(
            (assignments || []).map((a: any) => a.project_id)
          );
          
          const userAssignedProjects = new Set(
            (assignments || []).filter((a: any) => a.user_id === userId).map((a: any) => a.project_id)
          );

          activeProjectsList = projectData
            .filter((pd: any) => {
              const projectId = pd.project_id;
              const hasAssignments = projectsWithAssignments.has(projectId);
              const userIsAssigned = userAssignedProjects.has(projectId);
              
              return !hasAssignments || userIsAssigned;
            })
            .map((pd: any) => pd.projects);

          activeProjects = activeProjectsList.length;
        }
      }
    } else {
      const { count } = await supabaseAdmin
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('isActive', true);
      
      activeProjects = count || 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        totalReports,
        periodReports,
        totalProjectsWorked,
        activeProjects,
        activeProjectsList: userId ? activeProjectsList : [],
        todayProgress: userId ? Math.round(todayProgress) : null,
        avgReportsPerDay: userId ? Number(avgReportsPerDay.toFixed(2)) : null,
        locationBreakdown: userId ? locationBreakdown : [],
        kendalaStats: userId ? kendalaStats : null,
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
