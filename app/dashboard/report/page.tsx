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
    const { data: userData } = await supabaseAdmin
      .from('users')
      .select('divisionId')
      .eq('id', session.userId)
      .single()

    const userDivisionId = userData?.divisionId

    const { data: allProjects } = await supabaseAdmin
      .from('projects')
      .select(`
        id,
        name,
        status,
        isActive,
        divisionId,
        project_divisions (
          division_id
        )
      `)
      .order('name', { ascending: true })

    availableProjects = (allProjects || [])
      .filter((project: any) => {
        const isActive = project.isActive === true || project.status === 'Aktif'
        if (!isActive || !userDivisionId) return false

        const involvedByLegacy = project.divisionId === userDivisionId
        const involvedByManyToMany = (project.project_divisions || []).some(
          (pd: any) => pd.division_id === userDivisionId
        )

        return involvedByLegacy || involvedByManyToMany
      })
      .map((project: any) => ({
        id: project.id,
        name: project.name
      }))

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
