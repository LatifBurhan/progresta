import { supabaseAdmin } from '@/lib/supabase'
import type { Payslip, PayslipWithEmployee, Employee, RecapData } from './types'
import { hitungTotalRekap } from './calculator'

export interface GetPayslipsByUserOptions {
  limit?: number
  offset?: number
}

/** Ambil slip gaji milik karyawan (hanya published/acknowledged), urut terbaru */
export async function getPayslipsByUser(
  userId: string,
  options: GetPayslipsByUserOptions = {}
): Promise<Payslip[]> {
  const { limit = 50, offset = 0 } = options

  const { data, error } = await supabaseAdmin
    .from('payslips')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['published', 'acknowledged'])
    .order('periode_tahun', { ascending: false })
    .order('periode_bulan', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error
  return (data ?? []) as Payslip[]
}

/** Ambil satu slip gaji by id */
export async function getPayslipById(id: string): Promise<Payslip | null> {
  const { data, error } = await supabaseAdmin
    .from('payslips')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data as Payslip | null
}

export interface GetPayslipsForAdminOptions {
  departemen_id?: string
  divisi_id?: string
  limit?: number
  offset?: number
}

/** Ambil semua slip gaji untuk admin dengan join ke users, filter departemen/divisi */
export async function getPayslipsForAdmin(
  bulan: number,
  tahun: number,
  options: GetPayslipsForAdminOptions = {}
): Promise<PayslipWithEmployee[]> {
  const { departemen_id, divisi_id, limit = 200, offset = 0 } = options

  let query = supabaseAdmin
    .from('payslips')
    .select('*, users!payslips_user_id_fkey(id, name, email, employee_status)')
    .eq('periode_bulan', bulan)
    .eq('periode_tahun', tahun)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (departemen_id) {
    // Filter via user_departments join
    const { data: userIds } = await supabaseAdmin
      .from('user_departments')
      .select('user_id')
      .eq('department_id', departemen_id)
    const ids = (userIds ?? []).map((r: any) => r.user_id)
    if (ids.length === 0) return []
    query = query.in('user_id', ids)
  }

  if (divisi_id) {
    const { data: userIds } = await supabaseAdmin
      .from('user_divisions')
      .select('user_id')
      .eq('division_id', divisi_id)
    const ids = (userIds ?? []).map((r: any) => r.user_id)
    if (ids.length === 0) return []
    query = query.in('user_id', ids)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as PayslipWithEmployee[]
}

export interface GetEmployeesForPeriodeOptions {
  departemen_id?: string
  divisi_id?: string
}

/** Ambil daftar karyawan aktif dengan status slip gaji per periode */
export async function getEmployeesForPeriode(
  bulan: number,
  tahun: number,
  options: GetEmployeesForPeriodeOptions = {}
): Promise<{ employee: Employee; payslip: Payslip | null }[]> {
  const { departemen_id, divisi_id } = options

  let userQuery = supabaseAdmin
    .from('users')
    .select('id, name, email, role, employee_status')
    .eq('status', 'ACTIVE')

  if (departemen_id) {
    const { data: userIds } = await supabaseAdmin
      .from('user_departments')
      .select('user_id')
      .eq('department_id', departemen_id)
    const ids = (userIds ?? []).map((r: any) => r.user_id)
    if (ids.length === 0) return []
    userQuery = userQuery.in('id', ids)
  }

  if (divisi_id) {
    const { data: userIds } = await supabaseAdmin
      .from('user_divisions')
      .select('user_id')
      .eq('division_id', divisi_id)
    const ids = (userIds ?? []).map((r: any) => r.user_id)
    if (ids.length === 0) return []
    userQuery = userQuery.in('id', ids)
  }

  const { data: employees, error: empError } = await userQuery
  if (empError) throw empError

  if (!employees || employees.length === 0) return []

  const employeeIds = employees.map((e: any) => e.id)

  const { data: payslips, error: psError } = await supabaseAdmin
    .from('payslips')
    .select('*')
    .eq('periode_bulan', bulan)
    .eq('periode_tahun', tahun)
    .in('user_id', employeeIds)

  if (psError) throw psError

  const payslipMap = new Map<string, Payslip>()
  for (const p of payslips ?? []) {
    payslipMap.set(p.user_id, p as Payslip)
  }

  return employees.map((emp: any) => ({
    employee: emp as Employee,
    payslip: payslipMap.get(emp.id) ?? null,
  }))
}

export interface GetRecapDataOptions {
  departemen_id?: string
  divisi_id?: string
}

/** Ambil data rekap dengan aggregasi */
export async function getRecapData(
  bulan: number,
  tahun: number,
  options: GetRecapDataOptions = {}
): Promise<RecapData> {
  const payslips = await getPayslipsForAdmin(bulan, tahun, options)

  const totals = hitungTotalRekap(payslips as any)

  return {
    jumlah_karyawan: payslips.length,
    ...totals,
    detail: payslips,
  }
}
