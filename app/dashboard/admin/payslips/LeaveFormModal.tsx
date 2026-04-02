'use client'

import { useState, useEffect } from 'react'
import type { Employee } from '@/lib/payslip/types'
import type { EmployeeLeave } from '@/lib/leave/types'

interface LeaveFormModalProps {
  employee: Employee
  tahun: number
  onSuccess: () => void
  onCancel: () => void
}

const JATAH_CUTI = 12

export default function LeaveFormModal({ employee, tahun, onSuccess, onCancel }: LeaveFormModalProps) {
  const [existing, setExisting] = useState<EmployeeLeave | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [values, setValues] = useState({
    cuti_terpakai: '0',
    jumlah_sakit: '0',
    jumlah_izin: '0',
    jumlah_alpha: '0',
    catatan: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true)
      try {
        const res = await fetch(`/api/admin/leave?user_id=${employee.id}&tahun=${tahun}`)
        const json = await res.json()
        if (json.success && json.data) {
          const d: EmployeeLeave = json.data
          setExisting(d)
          setValues({
            cuti_terpakai: String(d.cuti_terpakai),
            jumlah_sakit: String(d.jumlah_sakit),
            jumlah_izin: String(d.jumlah_izin),
            jumlah_alpha: String(d.jumlah_alpha),
            catatan: d.catatan ?? '',
          })
        }
      } catch {
        // no data yet
      } finally {
        setLoadingData(false)
      }
    }
    fetchData()
  }, [employee.id, tahun])

  const sisaCuti = Math.max(JATAH_CUTI - (Number(values.cuti_terpakai) || 0), 0)

  const handleChange = (key: string, val: string) => {
    if (key !== 'catatan') {
      // only allow numbers
      if (val !== '' && !/^\d+$/.test(val)) return
    }
    setValues((prev) => ({ ...prev, [key]: val }))
    setErrors((prev) => { const next = { ...prev }; delete next[key]; return next })
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    const fields = ['cuti_terpakai', 'jumlah_sakit', 'jumlah_izin', 'jumlah_alpha'] as const
    for (const f of fields) {
      const n = Number(values[f])
      if (isNaN(n) || n < 0) errs[f] = 'Nilai tidak boleh negatif'
    }
    if (Number(values.cuti_terpakai) > JATAH_CUTI) {
      errs.cuti_terpakai = `Cuti terpakai tidak boleh melebihi jatah (${JATAH_CUTI})`
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: employee.id,
          tahun,
          cuti_terpakai: Number(values.cuti_terpakai),
          jumlah_sakit: Number(values.jumlah_sakit),
          jumlah_izin: Number(values.jumlah_izin),
          jumlah_alpha: Number(values.jumlah_alpha),
          catatan: values.catatan || null,
        }),
      })
      const json = await res.json()
      if (json.success) {
        onSuccess()
      } else {
        setErrors({ _form: json.message || 'Terjadi kesalahan' })
      }
    } catch {
      setErrors({ _form: 'Terjadi kesalahan jaringan' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Data Cuti</h2>
              <p className="text-sm text-slate-500">{employee.name || employee.email} — {tahun}</p>
            </div>
            <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Ringkasan Cuti */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-center">
              <p className="text-xs text-teal-600 font-medium mb-1">Jatah Cuti</p>
              <p className="text-2xl font-bold text-teal-700">{JATAH_CUTI}</p>
              <p className="text-xs text-teal-500">hari/tahun</p>
            </div>
            <div className={`border rounded-xl p-3 text-center ${sisaCuti === 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
              <p className={`text-xs font-medium mb-1 ${sisaCuti === 0 ? 'text-red-600' : 'text-green-600'}`}>Sisa Cuti</p>
              <p className={`text-2xl font-bold ${sisaCuti === 0 ? 'text-red-700' : 'text-green-700'}`}>{sisaCuti}</p>
              <p className={`text-xs ${sisaCuti === 0 ? 'text-red-500' : 'text-green-500'}`}>hari tersisa</p>
            </div>
          </div>

          {loadingData ? (
            <div className="text-center py-6 text-slate-400 text-sm">Memuat data...</div>
          ) : (
            <>
              {errors._form && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-700">
                  {errors._form}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                {[
                  { key: 'cuti_terpakai', label: 'Cuti Terpakai', hint: `Maks. ${JATAH_CUTI} hari` },
                  { key: 'jumlah_sakit', label: 'Jumlah Sakit', hint: 'hari' },
                  { key: 'jumlah_izin', label: 'Jumlah Izin', hint: 'hari' },
                  { key: 'jumlah_alpha', label: 'Jumlah Alpha', hint: 'hari' },
                ].map(({ key, label, hint }) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      {label} <span className="text-slate-400 font-normal">({hint})</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={values[key as keyof typeof values]}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${errors[key] ? 'border-red-300' : 'border-slate-200'}`}
                    />
                    {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
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
                    {loading ? 'Menyimpan...' : existing ? 'Simpan Perubahan' : 'Simpan'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
