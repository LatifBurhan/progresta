export interface EmployeeLeave {
  id: string
  user_id: string
  created_by: string
  tahun: number
  jatah_cuti: number
  cuti_terpakai: number
  jumlah_sakit: number
  jumlah_izin: number
  jumlah_alpha: number
  sisa_cuti: number
  catatan: string | null
  created_at: string
  updated_at: string
}

export interface UpsertLeaveRequest {
  user_id: string
  tahun: number
  jatah_cuti?: number
  cuti_terpakai: number
  jumlah_sakit: number
  jumlah_izin: number
  jumlah_alpha: number
  catatan?: string
}
