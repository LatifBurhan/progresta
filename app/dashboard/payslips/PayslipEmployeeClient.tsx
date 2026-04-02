'use client'

import { useState, useEffect } from 'react'
import type { Payslip } from '@/lib/payslip/types'
import type { EmployeeLeave } from '@/lib/leave/types'

interface PayslipEmployeeClientProps {
  initialPayslips: Payslip[]
}

const BULAN_NAMES = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(n))
}

export default function PayslipEmployeeClient({ initialPayslips }: PayslipEmployeeClientProps) {
  const [payslips, setPayslips] = useState<Payslip[]>(initialPayslips)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [acknowledging, setAcknowledging] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [leaveMap, setLeaveMap] = useState<Map<number, EmployeeLeave>>(new Map())

  // Fetch data cuti untuk semua tahun yang ada di slip gaji
  useEffect(() => {
    const uniqueTahun = [...new Set(initialPayslips.map((p) => p.periode_tahun))]
    if (uniqueTahun.length === 0) return

    Promise.all(
      uniqueTahun.map((tahun) =>
        fetch(`/api/leave?tahun=${tahun}`).then((r) => r.json())
      )
    ).then((results) => {
      const map = new Map<number, EmployeeLeave>()
      results.forEach((json, i) => {
        if (json.success && json.data) {
          map.set(uniqueTahun[i], json.data)
        }
      })
      setLeaveMap(map)
    }).catch(() => {})
  }, [initialPayslips])

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAcknowledge = async (id: string) => {
    if (!confirm('Konfirmasi bahwa Anda telah menerima slip gaji ini?')) return
    setAcknowledging(id)
    try {
      const res = await fetch(`/api/payslips/${id}/acknowledge`, { method: 'POST' })
      const json = await res.json()
      if (json.success) {
        setPayslips((prev) =>
          prev.map((p) =>
            p.id === id
              ? { ...p, status: 'acknowledged', acknowledged_at: json.data.acknowledged_at }
              : p
          )
        )
        showToast('Slip gaji berhasil dikonfirmasi')
      } else {
        showToast(json.error?.message || json.message || 'Gagal mengkonfirmasi', 'error')
      }
    } catch {
      showToast('Terjadi kesalahan jaringan', 'error')
    } finally {
      setAcknowledging(null)
    }
  }

  const handleDownloadPDF = (id: string) => {
    window.open(`/api/payslips/${id}/pdf`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Slip Gaji</h1>
        <p className="text-sm text-slate-500 mt-1">Riwayat slip gaji Anda</p>
      </div>

      {payslips.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-slate-500 font-medium">Belum ada slip gaji</p>
          <p className="text-slate-400 text-sm mt-1">Slip gaji Anda akan muncul di sini setelah diterbitkan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payslips.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              {/* Header row */}
              <button
                onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {BULAN_NAMES[p.periode_bulan]} {p.periode_tahun}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5">{formatRupiah(Number(p.gaji_bersih))}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${p.status === 'acknowledged' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                    {p.status === 'acknowledged' ? 'Sudah Dikonfirmasi' : 'Diterbitkan'}
                  </span>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform ${expandedId === p.id ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {/* Expanded detail */}
              {expandedId === p.id && (
                <div className="border-t border-slate-100 px-5 py-4 space-y-4">
                  {/* Komponen gaji */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pendapatan</p>
                      {[
                        { label: 'Gaji Pokok', val: p.gaji_pokok },
                        { label: 'Lembur', val: p.lembur },
                        { label: 'Insentif', val: p.insentif },
                        { label: 'Tunjangan', val: p.tunjangan },
                        { label: 'Dinas Luar', val: p.dinas_luar },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between">
                          <span className="text-slate-500">{item.label}</span>
                          <span className="font-medium text-slate-800">{formatRupiah(Number(item.val))}</span>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Potongan</p>
                      {[
                        { label: 'BPJS', val: p.potongan_bpjs },
                        { label: 'Pajak', val: p.potongan_pajak },
                      ].map((item) => (
                        <div key={item.label} className="flex justify-between">
                          <span className="text-slate-500">{item.label}</span>
                          <span className="font-medium text-red-600">{formatRupiah(Number(item.val))}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gaji bersih */}
                  <div className="bg-teal-50 rounded-xl p-3 flex justify-between items-center">
                    <span className="font-semibold text-teal-800">Gaji Bersih</span>
                    <span className="text-xl font-bold text-teal-700">{formatRupiah(Number(p.gaji_bersih))}</span>
                  </div>

                  {/* Info Cuti */}
                  {(() => {
                    const lv = leaveMap.get(p.periode_tahun)
                    const sisa = lv?.sisa_cuti ?? 0
                    const sakit = lv?.jumlah_sakit ?? 0
                    const izin = lv?.jumlah_izin ?? 0
                    const alpha = lv?.jumlah_alpha ?? 0
                    return (
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Info Cuti {p.periode_tahun}</p>
                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div className="bg-green-50 border border-green-100 rounded-lg p-2">
                            <p className="text-lg font-bold text-green-700">{sisa}</p>
                            <p className="text-[10px] text-green-600 font-medium">Sisa Cuti</p>
                          </div>
                          <div className="bg-blue-50 border border-blue-100 rounded-lg p-2">
                            <p className="text-lg font-bold text-blue-700">{sakit}</p>
                            <p className="text-[10px] text-blue-600 font-medium">Sakit</p>
                          </div>
                          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-2">
                            <p className="text-lg font-bold text-yellow-700">{izin}</p>
                            <p className="text-[10px] text-yellow-600 font-medium">Izin</p>
                          </div>
                          <div className="bg-red-50 border border-red-100 rounded-lg p-2">
                            <p className="text-lg font-bold text-red-700">{alpha}</p>
                            <p className="text-[10px] text-red-600 font-medium">Alpha</p>
                          </div>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Catatan */}
                  {p.catatan && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                      <strong>Catatan:</strong> {p.catatan}
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="text-xs text-slate-400 space-y-1">
                    {p.published_at && (
                      <p>Diterbitkan: {new Date(p.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    )}
                    {p.acknowledged_at && (
                      <p>Dikonfirmasi: {new Date(p.acknowledged_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                    {p.status === 'published' && (
                      <button
                        onClick={() => handleAcknowledge(p.id)}
                        disabled={acknowledging === p.id}
                        className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        {acknowledging === p.id ? 'Mengkonfirmasi...' : 'Konfirmasi Terima'}
                      </button>
                    )}
                    {p.status === 'acknowledged' && (
                      <div className="flex-1 px-4 py-2.5 bg-green-50 text-green-700 rounded-xl text-sm font-medium text-center border border-green-200">
                        ✓ Sudah Dikonfirmasi
                      </div>
                    )}
                    <button
                      onClick={() => handleDownloadPDF(p.id)}
                      className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Unduh PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
