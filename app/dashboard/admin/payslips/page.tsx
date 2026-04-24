import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import { isPayslipManager } from '@/lib/payslip/roles'
import { supabaseAdmin } from '@/lib/supabase'
import { getAdminDepartment } from '@/lib/payslip/department'
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

  // Get admin's department (null if unrestricted role like GENERAL_AFFAIR, CEO, ADMIN)
  const adminDepartmentId = await getAdminDepartment(session.userId, session.role)

  // Fetch employees - filter by admin's department
  let employeesQuery = supabaseAdmin
    .from('users')
    .select('id, name, email, role, employee_status')
    .eq('status', 'ACTIVE')

  if (adminDepartmentId) {
    // Only show employees from admin's department
    const { data: userIds } = await supabaseAdmin
      .from('user_departments')
      .select('user_id')
      .eq('department_id', adminDepartmentId)
    
    const ids = (userIds ?? []).map((r: any) => r.user_id)
    if (ids.length > 0) {
      employeesQuery = employeesQuery.in('id', ids)
    } else {
      // No employees in this department
      employeesQuery = employeesQuery.eq('id', '00000000-0000-0000-0000-000000000000') // Return empty
    }
  }

  const { data: employees } = await employeesQuery.order('name')

  // Fetch all departments and divisions
  const [departmentsRes, divisionsRes] = await Promise.all([
    supabaseAdmin.from('departments').select('id, name').order('name'),
    supabaseAdmin.from('divisions').select('id, name').order('name'),
  ])

  const departments = departmentsRes.data ?? []
  const divisions = divisionsRes.data ?? []

  return (
    <PayslipAdminClient
      initialEmployees={employees ?? []}
      departments={departments}
      divisions={divisions}
      adminDepartmentId={adminDepartmentId}
    />
  )
}
