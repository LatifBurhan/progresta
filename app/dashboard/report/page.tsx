import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import ReportForm from './ReportForm'
import { getCachedLastReport } from '@/lib/cache'
import { supabaseAdmin } from '@/lib/supabase'

export default async function ReportPage() {
  const session = await verifySession()

  if (!session) {
    redirect('/login')
  }

  // Get user's last report for auto-context
  const lastReport = await getCachedLastReport(session.userId)
  let availableProjects: Array<{ id: string; name: string }> = []
  let initialHistory: any[] = []

  if (supabaseAdmin) {
    // Fetch available projects using the fixed API logic
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('divisionId')
      .eq('id', session.userId)
      .single()

    const userDivisionId = userData?.divisionId

    if (userDivisionId) {
      // Get projects where user is specifically assigned
      const { data: userAssignments } = await supabaseAdmin
        .from('project_assignments')
        .select('project_id')
        .eq('user_id', session.userId)

      const assignedProjectIds = userAssignments?.map((a: any) => a.project_id) || []

      // Get projects from user's division
      const { data: projectDivisions } = await supabaseAdmin
        .from('project_divisions')
        .select(`
          project_id,
          projects!inner (
            id,
            name,
            status
          )
        `)
        .eq('division_id', userDivisionId)
        .eq('projects.status', 'Aktif')

      const divisionProjectIds = projectDivisions?.map((pd: any) => pd.project_id) || []

      // Get all assignments for division projects to determine which have specific assignments
      const { data: allAssignments } = await supabaseAdmin
        .from('project_assignments')
        .select('project_id')
        .in('project_id', divisionProjectIds)

      const projectsWithAssignments = [...new Set(allAssignments?.map((a: any) => a.project_id) || [])]

      // Filter projects based on assignment logic
      const accessibleProjectIds = divisionProjectIds.filter((projectId: string) => {
        const hasAssignments = projectsWithAssignments.includes(projectId)
        const userIsAssigned = assignedProjectIds.includes(projectId)
        
        if (hasAssignments) {
          // Project has specific assignments, only include if user is assigned
          return userIsAssigned
        } else {
          // Project has no specific assignments, include for all division members
          return true
        }
      })

      // Fetch complete project data
      if (accessibleProjectIds.length > 0) {
        const { data: allProjects } = await supabaseAdmin
          .from('projects')
          .select('id, name')
          .in('id', accessibleProjectIds)
          .eq('status', 'Aktif')
          .order('name', { ascending: true })

        availableProjects = (allProjects || []).map((project: any) => ({
          id: project.id,
          name: project.name
        }))
      }
    }

    const { data: historyData } = await supabaseAdmin
      .from('reports')
      .select(`
        id,
        reportDate,
        reportTime,
        period,
        hasIssue,
        issueDesc,
        totalHours,
        report_details (
          id,
          projectId,
          task,
          progress,
          evidence,
          hoursSpent,
          projects (
            id,
            name
          )
        )
      `)
      .eq('userId', session.userId)
      .order('reportTime', { ascending: false })
      .limit(100)

    initialHistory = historyData || []
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            📝 Laporan Progres
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Laporkan progres kerja setiap 2 jam
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        <ReportForm 
          userId={session.userId}
          lastReport={lastReport}
          availableProjects={availableProjects}
          initialHistory={initialHistory}
        />
      </div>
    </div>
  )
}
