import type { UpsertPayslipRequest, BulkGenerateRequest, PublishPayslipsRequest } from './types'

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

const NUMERIC_FIELDS = [
  'gaji_pokok',
  'lembur',
  'insentif',
  'tunjangan',
  'dinas_luar',
  'potongan_bpjs',
  'potongan_pajak',
] as const

/** Validasi request buat/update slip gaji */
export function validateUpsertPayslip(body: any): ValidationResult {
  const errors: Record<string, string> = {}

  if (!body.user_id || typeof body.user_id !== 'string' || body.user_id.trim() === '') {
    errors.user_id = 'user_id wajib diisi'
  }

  const bulan = Number(body.periode_bulan)
  if (!body.periode_bulan || isNaN(bulan) || bulan < 1 || bulan > 12) {
    errors.periode_bulan = 'Periode bulan harus antara 1-12'
  }

  const tahun = Number(body.periode_tahun)
  if (!body.periode_tahun || isNaN(tahun) || tahun < 2020) {
    errors.periode_tahun = 'Periode tahun harus >= 2020'
  }

  const requiredNumeric = ['gaji_pokok', 'lembur', 'insentif', 'tunjangan', 'dinas_luar'] as const
  for (const field of requiredNumeric) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      errors[field] = `${field.replace('_', ' ')} wajib diisi`
    } else {
      const val = Number(body[field])
      if (isNaN(val)) {
        errors[field] = `${field.replace('_', ' ')} harus berupa angka`
      } else if (val < 0) {
        errors[field] = 'Nilai komponen gaji tidak boleh negatif'
      }
    }
  }

  const optionalNumeric = ['potongan_bpjs', 'potongan_pajak'] as const
  for (const field of optionalNumeric) {
    if (body[field] !== undefined && body[field] !== null && body[field] !== '') {
      const val = Number(body[field])
      if (isNaN(val)) {
        errors[field] = `${field.replace('_', ' ')} harus berupa angka`
      } else if (val < 0) {
        errors[field] = 'Nilai komponen gaji tidak boleh negatif'
      }
    }
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

/** Validasi request bulk generate */
export function validateBulkGenerate(body: any): ValidationResult {
  const errors: Record<string, string> = {}

  if (!Array.isArray(body.user_ids) || body.user_ids.length === 0) {
    errors.user_ids = 'user_ids harus berupa array yang tidak kosong'
  }

  const bulan = Number(body.periode_bulan)
  if (!body.periode_bulan || isNaN(bulan) || bulan < 1 || bulan > 12) {
    errors.periode_bulan = 'Periode bulan harus antara 1-12'
  }

  const tahun = Number(body.periode_tahun)
  if (!body.periode_tahun || isNaN(tahun) || tahun < 2020) {
    errors.periode_tahun = 'Periode tahun harus >= 2020'
  }

  const requiredNumeric = ['gaji_pokok', 'lembur', 'insentif', 'tunjangan', 'dinas_luar'] as const
  for (const field of requiredNumeric) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      errors[field] = `${field.replace('_', ' ')} wajib diisi`
    } else {
      const val = Number(body[field])
      if (isNaN(val)) {
        errors[field] = `${field.replace('_', ' ')} harus berupa angka`
      } else if (val < 0) {
        errors[field] = 'Nilai komponen gaji tidak boleh negatif'
      }
    }
  }

  const optionalNumeric = ['potongan_bpjs', 'potongan_pajak'] as const
  for (const field of optionalNumeric) {
    if (body[field] !== undefined && body[field] !== null && body[field] !== '') {
      const val = Number(body[field])
      if (isNaN(val)) {
        errors[field] = `${field.replace('_', ' ')} harus berupa angka`
      } else if (val < 0) {
        errors[field] = 'Nilai komponen gaji tidak boleh negatif'
      }
    }
  }

  return { valid: Object.keys(errors).length === 0, errors }
}

/** Validasi request publish */
export function validatePublishRequest(body: any): ValidationResult {
  const errors: Record<string, string> = {}

  const hasIds = Array.isArray(body.payslip_ids) && body.payslip_ids.length > 0
  const hasPeriode = body.periode_bulan !== undefined && body.periode_tahun !== undefined

  if (!hasIds && !hasPeriode) {
    errors.request = 'Harus menyertakan payslip_ids atau periode_bulan + periode_tahun'
  }

  if (hasPeriode) {
    const bulan = Number(body.periode_bulan)
    if (isNaN(bulan) || bulan < 1 || bulan > 12) {
      errors.periode_bulan = 'Periode bulan harus antara 1-12'
    }
    const tahun = Number(body.periode_tahun)
    if (isNaN(tahun) || tahun < 2020) {
      errors.periode_tahun = 'Periode tahun harus >= 2020'
    }
  }

  return { valid: Object.keys(errors).length === 0, errors }
}
