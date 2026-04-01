import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import { isGeneralAffair } from '@/lib/overtime/roles'
import OvertimeAdminClient from './OvertimeAdminClient'

export default async function OvertimeAdminPage() {
  const session = await verifySession()
  if (!session) {
    redirect('/login')
  }

  if (!isGeneralAffair(session.role)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-800 mb-2">403</p>
          <p className="text-slate-500">Akses ditolak. Halaman ini hanya untuk HRD.</p>
        </div>
      </div>
    )
  }

  return <OvertimeAdminClient />
}
