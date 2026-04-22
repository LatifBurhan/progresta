export type PayslipStatus = 'draft' | 'published' | 'acknowledged'

export interface Payslip {
  id: string
  user_id: string
  created_by: string
  periode_bulan: number
  periode_tahun: number
  gaji_pokok: number
  lembur: number
  insentif: number
  tunjangan: number
  bonus_kpi: number
  dinas_luar: number
  potongan_bpjs: number
  potongan_pajak: number
  gaji_bersih: number
  status: PayslipStatus
  catatan: string | null
  published_at: string | null
  acknowledged_at: string | null
  created_at: string
  updated_at: string
}

export interface PayslipWithEmployee extends Payslip {
  users: {
    id: string
    name: string | null
    email: string
    employee_status: string | null
  }
}

export interface Employee {
  id: string
  name: string | null
  email: string
  role: string
  employee_status: string | null
}

export interface UpsertPayslipRequest {
  user_id: string
  periode_bulan: number
  periode_tahun: number
  gaji_pokok: number
  lembur: number
  insentif: number
  tunjangan: number
  bonus_kpi?: number
  dinas_luar: number
  potongan_bpjs?: number
  potongan_pajak?: number
  catatan?: string
}

export interface BulkGenerateRequest {
  user_ids: string[]
  periode_bulan: number
  periode_tahun: number
  gaji_pokok: number
  lembur: number
  insentif: number
  tunjangan: number
  bonus_kpi?: number
  dinas_luar: number
  potongan_bpjs?: number
  potongan_pajak?: number
  catatan?: string
  overwrite?: boolean
}

export interface PublishPayslipsRequest {
  payslip_ids?: string[]
  periode_bulan?: number
  periode_tahun?: number
}

export interface RecapData {
  jumlah_karyawan: number
  total_gaji_pokok: number
  total_lembur: number
  total_insentif: number
  total_tunjangan: number
  total_bonus_kpi: number
  total_dinas_luar: number
  total_potongan_bpjs: number
  total_potongan_pajak: number
  total_gaji_bersih: number
  detail: PayslipWithEmployee[]
}

export interface RecapTotals {
  total_gaji_pokok: number
  total_lembur: number
  total_insentif: number
  total_tunjangan: number
  total_bonus_kpi: number
  total_dinas_luar: number
  total_potongan_bpjs: number
  total_potongan_pajak: number
  total_gaji_bersih: number
}

export interface PayslipKomponen {
  gaji_pokok: number
  lembur: number
  insentif: number
  tunjangan: number
  bonus_kpi?: number
  dinas_luar: number
  potongan_bpjs: number
  potongan_pajak: number
}
