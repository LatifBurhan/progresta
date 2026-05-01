import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

// Enable caching with 60 second revalidation
export const revalidate = 60;

/**
 * OPTIMIZED VERSION - Eliminates N+1 queries
 * GET /api/admin/project-activity-optimized
 */
export async function GET(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    if (!['ADMIN', 'CEO', 'GENERAL_AFFAIR', 'PM'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'

    const daysAgo = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    // OPTIMIZATION: Get all data in 2 queries instead of N+1
    
    // Query 1: Get all projects
    const { data: projects, error: projectsError } = await supabaseAdmin
      .from('projects')
      .select(`
        id,
        name,
        pic,
        status,
        prioritas,
        tanggal_mulai,
        tanggal_selesai
      `)
      .in('status', ['Aktif', 'Selesai', 'Ditunda'])
      .order('name')

    if (projectsError) {
      console.error('Error fetching projects:', projectsError)
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch projects'
      }, { status: 500 })
    }

    if (!projects || projects.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          projects: [],
          summary: {
            veryActive: 0,
            active: 0,
            lowActive: 0,
            stagnant: 0,
            totalProjects: 0,
            stagnantProjects: []
          },
          period: daysAgo
        }
      })
    }

    const projectIds = projects.map(p => p.id)

    // Query 2: Get ALL reports for ALL projects in single query
    const { data: allReports } = await supabaseAdmin
      .from('project_reports')
      .select('id, project_id, created_at, kendala')
      .in('project_id', projectIds)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    // Query 3: Get last reports for each project (for stagnant detection)
    const { data: lastReports } = await supabaseAdmin
      .from('project_reports')
      .select('project_id, created_at')
      .in('project_id', projectIds)
      .order('created_at', { ascending: false })

    // Process data in memory (much faster than N queries)
    const reportsByProject = new Map<string, any[]>()
    const lastReportByProject = new Map<string, string>()

    // Group reports by project
    allReports?.forEach(report => {
      if (!reportsByProject.has(report.project_id)) {
        reportsByProject.set(report.project_id, [])
      }
      reportsByProject.get(report.project_id)!.push(report)
    })

    // Get last report date for each project
    lastReports?.forEach(report => {
      if (!lastReportByProject.has(report.project_id)) {
        lastReportByProject.set(report.project_id, report.created_at)
      }
    })

    // Calculate stats for each project
    const projectsWithActivity = projects.map(project => {
      const projectReports = reportsByProject.get(project.id) || []
      const reportCount = projectReports.length
      
      const kendalaCount = projectReports.filter(r => 
        r.kendala && r.kendala.trim() !== ''
      ).length

      const lastReportDate = lastReportByProject.get(project.id) || null
      
      const daysSinceLastReport = lastReportDate 
        ? Math.floor((Date.now() - new Date(lastReportDate).getTime()) / (1000 * 60 * 60 * 24))
        : 999

      // Determine activity level
      let activityLevel = 'stagnant'
      if (reportCount >= 30) activityLevel = 'very_active'
      else if (reportCount >= 15) activityLevel = 'active'
      else if (reportCount >= 5) activityLevel = 'low_active'

      const isStagnant = daysSinceLastReport > 7 && project.status === 'Aktif'

      return {
        ...project,
        reportCount,
        kendalaCount,
        lastReportDate,
        daysSinceLastReport,
        activityLevel,
        isStagnant
      }
    })

    // Calculate summary
    const summary = {
      veryActive: projectsWithActivity.filter(p => p.activityLevel === 'very_active').length,
      active: projectsWithActivity.filter(p => p.activityLevel === 'active').length,
      lowActive: projectsWithActivity.filter(p => p.activityLevel === 'low_active').length,
      stagnant: projectsWithActivity.filter(p => p.activityLevel === 'stagnant').length,
      totalProjects: projectsWithActivity.length,
      stagnantProjects: projectsWithActivity.filter(p => p.isStagnant)
    }

    return NextResponse.json({
      success: true,
      data: {
        projects: projectsWithActivity,
        summary,
        period: daysAgo
      }
    })

  } catch (error: any) {
    console.error('Project activity error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error: ' + error.message
    }, { status: 500 })
  }
}
