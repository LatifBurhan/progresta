import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import { isPayslipManager } from '@/lib/payslip/roles'
import { supabaseAdmin } from '@/lib/supabase'
import PayslipRecapClient from './PayslipRecapClient'

export default async function PayslipRecapPage() {
  const session = await verifySession()
  if (!session) {
    redirect('/login')
  }

  if (!isPayslipManager(session.role)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-2xl font-bold text-slate-800 mb-2">403</p>
          <p className="text-slate-500">Akses ditolak. Halaman ini hanya untuk Pengelola.</p>
        </div>
      </div>
    )
  }

  const [departmentsRes, divisionsRes] = await Promise.all([
    supabaseAdmin.from('departments').select('id, name').order('name'),
    supabaseAdmin.from('divisions').select('id, name').order('name'),
  ])

  return (
    <PayslipRecapClient
      departments={departmentsRes.data ?? []}
      divisions={divisionsRes.data ?? []}
    />
  )
}
