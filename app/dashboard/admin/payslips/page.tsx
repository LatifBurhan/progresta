import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import { isPayslipManager } from '@/lib/payslip/roles'
import { supabaseAdmin } from '@/lib/supabase'
import PayslipAdminClient from './PayslipAdminClient'

export default async function PayslipAdminPage() {
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

  // Fetch data awal di server
  const [employeesRes, departmentsRes, divisionsRes] = await Promise.all([
    supabaseAdmin
      .from('users')
      .select('id, name, email, role, employee_status')
      .eq('status', 'ACTIVE')
      .order('name'),
    supabaseAdmin.from('departments').select('id, name').order('name'),
    supabaseAdmin.from('divisions').select('id, name').order('name'),
  ])

  const employees = employeesRes.data ?? []
  const departments = departmentsRes.data ?? []
  const divisions = divisionsRes.data ?? []

  return (
    <PayslipAdminClient
      initialEmployees={employees}
      departments={departments}
      divisions={divisions}
    />
  )
}
