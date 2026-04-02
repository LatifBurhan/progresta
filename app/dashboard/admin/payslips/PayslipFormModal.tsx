'use client'

import { useState, useEffect } from 'react'
import type { Employee, Payslip } from '@/lib/payslip/types'
import { hitungGajiBersih } from '@/lib/payslip/calculator'

interface PayslipFormModalProps {
  employee: Employee
  periode: { bulan: number; tahun: number }
  existingPayslip?: Payslip | null
  onSuccess: () => void
  onCancel: () => void
}

const BULAN_NAMES = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const FIELDS = [
  { key: 'gaji_pokok', label: 'Gaji Pokok', required: true },
  { key: 'lembur', label: 'Lembur', required: true },
  { key: 'insentif', label: 'Insentif', required: true },
  { key: 'tunjangan', label: 'Tunjangan', required: true },
  { key: 'dinas_luar', label: 'Dinas Luar', required: true },
  { key: 'potongan_bpjs', label: 'Potongan BPJS', required: false },
  { key: 'potongan_pajak', label: 'Potongan Pajak', required: false },
] as const

type FieldKey = typeof FIELDS[number]['key']

type FormValues = Record<FieldKey, string> & { catatan: string }

const formatThousands = (val: string) => {
  const num = val.replace(/\D/g, '')
  if (!num) return ''
  return Number(num).toLocaleString('id-ID')
}

const parseRaw = (val: string) => val.replace(/\./g, '')

export default function PayslipFormModal({
  employee,
  periode,
  existingPayslip,
  onSuccess,
  onCancel,
}: PayslipFormModalProps) {
  const [values, setValues] = useState<FormValues>({
    gaji_pokok: existingPayslip ? formatThousands(String(existingPayslip.gaji_pokok)) : '',
    lembur: existingPayslip ? formatThousands(String(existingPayslip.lembur)) : '',
    insentif: existingPayslip ? formatThousands(String(existingPayslip.insentif)) : '',
    tunjangan: existingPayslip ? formatThousands(String(existingPayslip.tunjangan)) : '',
    dinas_luar: existingPayslip ? formatThousands(String(existingPayslip.dinas_luar)) : '',
    potongan_bpjs: existingPayslip ? formatThousands(String(existingPayslip.potongan_bpjs)) : '0',
    potongan_pajak: existingPayslip ? formatThousands(String(existingPayslip.potongan_pajak)) : '0',
    catatan: existingPayslip?.catatan ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [gajiBersihPreview, setGajiBersihPreview] = useState(0)

  useEffect(() => {
    const komponen = {
      gaji_pokok: Number(parseRaw(values.gaji_pokok)) || 0,
      lembur: Number(parseRaw(values.lembur)) || 0,
      insentif: Number(parseRaw(values.insentif)) || 0,
      tunjangan: Number(parseRaw(values.tunjangan)) || 0,
      dinas_luar: Number(parseRaw(values.dinas_luar)) || 0,
      potongan_bpjs: Number(parseRaw(values.potongan_bpjs)) || 0,
      potongan_pajak: Number(parseRaw(values.potongan_pajak)) || 0,
    }
    setGajiBersihPreview(hitungGajiBersih(komponen))
  }, [values])

  const handleChange = (key: string, val: string) => {
    const formatted = key !== 'catatan' ? formatThousands(val) : val
    setValues((prev) => ({ ...prev, [key]: formatted }))
    setErrors((prev) => { const next = { ...prev }; delete next[key]; return next })
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    for (const f of FIELDS) {
      if (f.required && (!values[f.key] || values[f.key].trim() === '')) {
        errs[f.key] = `${f.label} wajib diisi`
      } else if (values[f.key] !== '' && Number(parseRaw(values[f.key])) < 0) {
        errs[f.key] = 'Nilai tidak boleh negatif'
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const payload = {
        user_id: employee.id,
        periode_bulan: periode.bulan,
        periode_tahun: periode.tahun,
        gaji_pokok: Number(parseRaw(values.gaji_pokok)),
        lembur: Number(parseRaw(values.lembur)),
        insentif: Number(parseRaw(values.insentif)),
        tunjangan: Number(parseRaw(values.tunjangan)),
        dinas_luar: Number(parseRaw(values.dinas_luar)),
        potongan_bpjs: Number(parseRaw(values.potongan_bpjs)) || 0,
        potongan_pajak: Number(parseRaw(values.potongan_pajak)) || 0,
        catatan: values.catatan || null,
      }

      const url = existingPayslip
        ? `/api/admin/payslips/${existingPayslip.id}`
        : '/api/admin/payslips'
      const method = existingPayslip ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()

      if (json.success) {
        onSuccess()
      } else {
        if (json.error?.details) {
          setErrors(json.error.details)
        } else {
          setErrors({ _form: json.error?.message || json.message || 'Terjadi kesalahan' })
        }
      }
    } catch {
      setErrors({ _form: 'Terjadi kesalahan jaringan' })
    } finally {
      setLoading(false)
    }
  }

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(n))

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {existingPayslip ? 'Edit Slip Gaji' : 'Buat Slip Gaji'}
              </h2>
              <p className="text-sm text-slate-500">
                {employee.name || employee.email} — {BULAN_NAMES[periode.bulan]} {periode.tahun}
              </p>
            </div>
            <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Gaji Bersih Preview */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-4">
            <p className="text-xs text-teal-600 font-medium uppercase tracking-wider mb-1">Preview Gaji Bersih</p>
            <p className="text-2xl font-bold text-teal-700">{formatRupiah(gajiBersihPreview)}</p>
          </div>

          {errors._form && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700">
              {errors._form}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {FIELDS.map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  {f.label} {f.required && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={values[f.key]}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  placeholder="0"
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors[f.key] ? 'border-red-300' : 'border-slate-200'}`}
                />
                {errors[f.key] && <p className="text-xs text-red-500 mt-1">{errors[f.key]}</p>}
              </div>
            ))}

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Catatan</label>
              <textarea
                value={values.catatan}
                onChange={(e) => handleChange('catatan', e.target.value)}
                rows={2}
                placeholder="Catatan opsional..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Menyimpan...' : existingPayslip ? 'Simpan Perubahan' : 'Buat Slip Gaji'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
