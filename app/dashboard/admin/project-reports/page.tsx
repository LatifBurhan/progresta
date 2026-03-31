import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import ProjectReportsListClient from './ProjectReportsListClient'

export default async function ProjectReportsPage() {
  // Verify user has admin access
  const session = await verifySession()
  
  if (!session || !['ADMIN', 'HRD', 'PM', 'CEO'].includes(session.role)) {
    redirect('/dashboard')
  }

  if (!supabaseAdmin) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Database configuration error</p>
        </div>
      </div>
    )
  }

  // Fetch projects first
  const { data: projects, error: projectsError } = await supabaseAdmin
    .from('projects')
    .select('id, name, description, status, prioritas, tanggal_mulai, tanggal_selesai, created_at')
    .order('created_at', { ascending: false })

  if (projectsError) {
    console.error('[ERROR] Failed to fetch projects:', projectsError.message)
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold mb-2">Failed to load projects</p>
          <p className="text-sm text-red-700">{projectsError.message}</p>
        </div>
      </div>
    )
  }

  // Fetch departments
  const { data: departments, error: departmentsError } = await supabaseAdmin
    .from('departments')
    .select('id, name, color, isActive')
    .eq('isActive', true)
    .order('name')

  if (departmentsError) {
    console.error('[ERROR] Failed to fetch departments:', departmentsError.message)
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-semibold mb-2">Failed to load departments</p>
          <p className="text-sm text-red-700">{departmentsError.message}</p>
        </div>
      </div>
    )
  }

  // Transform projects and add report counts + departments
  const projectsWithCounts = await Promise.all(
    (projects || []).map(async (project: any) => {
      // Get report count
      const { count } = await supabaseAdmin
        .from('project_reports')
        .select('id', { count: 'exact', head: true })
        .eq('project_id', project.id)

      // Get departments for this project via project_department_divisions
      const { data: projectDepts } = await supabaseAdmin
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

  return (
    <div className="p-6">
      <ProjectReportsListClient 
        projects={projectsWithCounts} 
        departments={departments || []}
      />
    </div>
  )
}
