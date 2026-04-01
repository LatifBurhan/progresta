'use client'

import { useState, useEffect } from 'react'
import type { Employee } from '@/lib/payslip/types'
import { hitungGajiBersih } from '@/lib/payslip/calculator'

interface BulkGenerateModalProps {
  selectedEmployees: Employee[]
  periode: { bulan: number; tahun: number }
  onSuccess: (count: number) => void
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

export default function BulkGenerateModal({
  selectedEmployees,
  periode,
  onSuccess,
  onCancel,
}: BulkGenerateModalProps) {
  const [values, setValues] = useState<Record<FieldKey | 'catatan', string>>({
    gaji_pokok: '',
    lembur: '0',
    insentif: '0',
    tunjangan: '0',
    dinas_luar: '0',
    potongan_bpjs: '0',
    potongan_pajak: '0',
    catatan: '',
  })
  const [overwrite, setOverwrite] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ created: number; skipped: number; overwritten: number } | null>(null)
  const [gajiBersihPreview, setGajiBersihPreview] = useState(0)

  useEffect(() => {
    setGajiBersihPreview(hitungGajiBersih({
      gaji_pokok: Number(values.gaji_pokok) || 0,
      lembur: Number(values.lembur) || 0,
      insentif: Number(values.insentif) || 0,
      tunjangan: Number(values.tunjangan) || 0,
      dinas_luar: Number(values.dinas_luar) || 0,
      potongan_bpjs: Number(values.potongan_bpjs) || 0,
      potongan_pajak: Number(values.potongan_pajak) || 0,
    }))
  }, [values])

  const handleChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }))
    setErrors((prev) => { const next = { ...prev }; delete next[key]; return next })
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    for (const f of FIELDS) {
      if (f.required && (!values[f.key] || values[f.key].trim() === '')) {
        errs[f.key] = `${f.label} wajib diisi`
      } else if (values[f.key] !== '' && Number(values[f.key]) < 0) {
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
      const res = await fetch('/api/admin/payslips/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_ids: selectedEmployees.map((e) => e.id),
          periode_bulan: periode.bulan,
          periode_tahun: periode.tahun,
          gaji_pokok: Number(values.gaji_pokok),
          lembur: Number(values.lembur) || 0,
          insentif: Number(values.insentif) || 0,
          tunjangan: Number(values.tunjangan) || 0,
          dinas_luar: Number(values.dinas_luar) || 0,
          potongan_bpjs: Number(values.potongan_bpjs) || 0,
          potongan_pajak: Number(values.potongan_pajak) || 0,
          catatan: values.catatan || null,
          overwrite,
        }),
      })
      const json = await res.json()
      if (json.success) {
        setResult(json.data)
        setTimeout(() => onSuccess(json.data.created + json.data.overwritten), 1500)
      } else {
        setErrors({ _form: json.error?.message || json.message || 'Terjadi kesalahan' })
      }
    } catch {
      setErrors({ _form: 'Terjadi kesalahan jaringan' })
    } finally {
      setLoading(false)
    }
  }

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Bulk Generate Slip Gaji</h2>
              <p className="text-sm text-slate-500">
                {selectedEmployees.length} karyawan — {BULAN_NAMES[periode.bulan]} {periode.tahun}
              </p>
            </div>
            <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Karyawan terpilih */}
          <div className="bg-slate-50 rounded-xl p-3 mb-4 max-h-28 overflow-y-auto">
            <p className="text-xs font-medium text-slate-500 mb-2">Karyawan Terpilih:</p>
            <div className="flex flex-wrap gap-1.5">
              {selectedEmployees.map((e) => (
                <span key={e.id} className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700">
                  {e.name || e.email}
                </span>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 mb-4">
            <p className="text-xs text-teal-600 font-medium mb-1">Preview Gaji Bersih</p>
            <p className="text-xl font-bold text-teal-700">{formatRupiah(gajiBersihPreview)}</p>
          </div>

          {result ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
              <p className="font-semibold text-green-800 mb-2">Berhasil!</p>
              <p className="text-green-700">Dibuat: {result.created}</p>
              <p className="text-green-700">Dilewati: {result.skipped}</p>
              <p className="text-green-700">Ditimpa: {result.overwritten}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              {errors._form && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                  {errors._form}
                </div>
              )}

              {FIELDS.map((f) => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
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

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={overwrite}
                  onChange={(e) => setOverwrite(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-slate-600">Timpa slip yang sudah ada</span>
              </label>

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
                  {loading ? 'Memproses...' : `Generate ${selectedEmployees.length} Slip`}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
