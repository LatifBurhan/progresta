import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { DashboardClient } from '../../DashboardClient'

export default async function AdminOverviewPage() {
  const session = await verifySession()

  if (!session) {
    redirect('/login')
  }

  // Check if user is admin
  const isAdmin = ['ADMIN', 'GENERAL_AFFAIR', 'CEO'].includes(session.role)

  if (!isAdmin) {
    redirect('/dashboard')
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Statistik keseluruhan dari semua karyawan</p>
      </div>
      <DashboardClient userRole={session.role} userName="Admin" />
    </div>
  )
}
