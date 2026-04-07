import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Only admin roles can access
    if (!['ADMIN', 'CEO', 'GENERAL_AFFAIR', 'PM'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // days

    const daysAgo = parseInt(period)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)

    // Get all active projects with report counts
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

    // Get report counts for each project
    const projectsWithActivity = await Promise.all(
      (projects || []).map(async (project) => {
        // Count reports in period
        const { count: reportCount } = await supabaseAdmin
          .from('project_reports')
          .select('id', { count: 'exact', head: true })
          .eq('project_id', project.id)
          .gte('created_at', startDate.toISOString())

        // Get last report date
        const { data: lastReport } = await supabaseAdmin
          .from('project_reports')
          .select('created_at')
          .eq('project_id', project.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        // Count reports with kendala
        const { count: kendalaCount } = await supabaseAdmin
          .from('project_reports')
          .select('id', { count: 'exact', head: true })
          .eq('project_id', project.id)
          .gte('created_at', startDate.toISOString())
          .not('kendala', 'is', null)
          .neq('kendala', '')

        // Determine activity level
        const count = reportCount || 0
        let activityLevel = 'stagnant'
        if (count >= 30) activityLevel = 'very_active'
        else if (count >= 15) activityLevel = 'active'
        else if (count >= 5) activityLevel = 'low_active'

        // Check if stagnant (no report > 7 days)
        const daysSinceLastReport = lastReport 
          ? Math.floor((Date.now() - new Date(lastReport.created_at).getTime()) / (1000 * 60 * 60 * 24))
          : 999

        return {
          ...project,
          reportCount: count,
          kendalaCount: kendalaCount || 0,
          lastReportDate: lastReport?.created_at || null,
          daysSinceLastReport,
          activityLevel,
          isStagnant: daysSinceLastReport > 7 && project.status === 'Aktif'
        }
      })
    )

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
