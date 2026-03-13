import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import ReportForm from './ReportForm'
import { getCachedUserProjects, getCachedLastReport } from '@/lib/cache'

export default async function ReportPage() {
  const session = await verifySession()

  if (!session) {
    redirect('/login')
  }

  // Get user's division projects and last report for auto-context
  const [projects, lastReport] = await Promise.all([
    getCachedUserProjects(session.userId),
    getCachedLastReport(session.userId)
  ])

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
          projects={projects}
          lastReport={lastReport}
        />
      </div>
    </div>
  )
}