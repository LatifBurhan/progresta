import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    // Verify user has admin access
    const session = await verifySession()
    
    if (!session || !['ADMIN', 'HRD', 'PM', 'CEO'].includes(session.role)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, error: 'Database configuration error' },
        { status: 500 }
      )
    }

    const { projectId } = await params

    // Fetch project details
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id, name, description, status')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    // Fetch all reports for this project
    const { data: reports, error: reportsError } = await supabaseAdmin
      .from('project_reports')
      .select(`
        id,
        user_id,
        project_id,
        lokasi_kerja,
        pekerjaan_dikerjakan,
        kendala,
        rencana_kedepan,
        foto_urls,
        created_at,
        updated_at
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (reportsError) {
      console.error('[ERROR] Failed to fetch reports:', reportsError.message)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch reports: ' + reportsError.message },
        { status: 500 }
      )
    }

    // Get user info from Supabase Auth for each report
    const transformedReports = await Promise.all(
      (reports || []).map(async (report: any) => {
        // Try to get user from database first
        const { data: dbUser } = await supabaseAdmin
          .from('users')
          .select('id, email, role')
          .eq('id', report.user_id)
          .single()

        let userInfo = {
          id: report.user_id,
          email: dbUser?.email || 'Unknown',
          name: dbUser?.email?.split('@')[0] || 'Unknown',
          fotoProfil: null
        }

        // If user not in database, try Supabase Auth
        if (!dbUser) {
          try {
            const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(report.user_id)
            if (authUser?.user) {
              userInfo = {
                id: authUser.user.id,
                email: authUser.user.email || 'Unknown',
                name: authUser.user.user_metadata?.name || authUser.user.email?.split('@')[0] || 'Unknown',
                fotoProfil: authUser.user.user_metadata?.fotoProfil || null
              }
            }
          } catch (authError) {
            console.error('[WARN] Failed to fetch user from Auth:', authError)
          }
        }

        return {
          id: report.id,
          user_id: report.user_id,
          project_id: report.project_id,
          lokasi_kerja: report.lokasi_kerja,
          pekerjaan_dikerjakan: report.pekerjaan_dikerjakan,
          kendala: report.kendala,
          rencana_kedepan: report.rencana_kedepan,
          foto_urls: report.foto_urls,
          created_at: report.created_at,
          updated_at: report.updated_at,
          user: userInfo
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        reports: transformedReports
      }
    })
  } catch (error) {
    console.error('Error in project-reports/[projectId] API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
