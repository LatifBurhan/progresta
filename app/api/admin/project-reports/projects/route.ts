import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    // Verify user has admin access
    const session = await verifySession()
    
    if (!session || !['ADMIN', 'GENERAL_AFFAIR', 'PM', 'CEO'].includes(session.role)) {
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

    // Query projects first
    const { data: projects, error } = await supabaseAdmin
      .from('projects')
      .select('id, name, description, status, prioritas, tanggal_mulai, tanggal_selesai, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[ERROR] Failed to fetch projects:', error.message)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch projects: ' + error.message },
        { status: 500 }
      )
    }

    // Transform data and add report counts + departments
    const projectsWithCounts = await Promise.all(
      (projects || []).map(async (project: any) => {
        // Get report count for this project
        const { count, error: countError } = await supabaseAdmin!
          .from('project_reports')
          .select('id', { count: 'exact', head: true })
          .eq('project_id', project.id)

        if (countError) {
          console.error('[WARN] Error counting reports for project', project.id, ':', countError.message)
        }

        // Get departments for this project via project_department_divisions
        const { data: projectDepts } = await supabaseAdmin!
          .from('project_department_divisions')
          .select(`
            departments (
              id,
              name,
              color
            )
          `)
          .eq('project_id', project.id)

        // Extract unique departments
        const departmentMap = new Map()
        if (projectDepts) {
          projectDepts.forEach((pdd: any) => {
            if (pdd.departments) {
              departmentMap.set(pdd.departments.id, pdd.departments)
            }
          })
        }

        return {
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          prioritas: project.prioritas,
          tanggal_mulai: project.tanggal_mulai,
          tanggal_selesai: project.tanggal_selesai,
          departments: Array.from(departmentMap.values()),
          reportCount: count || 0
        }
      })
    )

    return NextResponse.json({ 
      success: true, 
      data: projectsWithCounts 
    })
  } catch (error) {
    console.error('Error in project-reports/projects API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
