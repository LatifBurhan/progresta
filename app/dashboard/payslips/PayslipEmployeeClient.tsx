"use client";

import { useState, useEffect } from 'react'
import type { Payslip } from '@/lib/payslip/types'
import type { EmployeeLeave } from '@/lib/leave/types'
import { 
  ChevronDown, 
  Download, 
  CheckCircle2, 
  Clock, 
  Info, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  Calendar,
  Building2,
  Stethoscope,
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

  // Sync state if initialPayslips prop changes
  useEffect(() => {
    setPayslips(initialPayslips)
  }, [initialPayslips])

  // Fetch data cuti untuk semua tahun yang ada di slip gaji
  useEffect(() => {
    const uniqueTahun = [...new Set(payslips.map((p) => p.periode_tahun))]
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
  }, [payslips])

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
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed top-24 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl animate-in slide-in-from-right-10 duration-300",
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'
        )}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <AlertCircle className="w-5 h-5 text-rose-500" />}
          <span className="font-semibold text-sm">{toast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <Wallet className="w-5 h-5" />
            </div>
            Payslip Center
          </h1>
          <p className="text-xs font-semibold text-slate-400 mt-1.5 uppercase tracking-[0.2em] ml-1">E-Slip Gaji Al-Wustho</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Records</p>
          <p className="text-base font-bold text-slate-900 leading-none">{payslips.length} Slips</p>
        </div>
      </div>

      {payslips.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Belum ada slip gaji</h3>
          <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto">Riwayat slip gaji elektronik Anda akan ditampilkan di sini setelah diterbitkan oleh HRD.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {payslips.map((p) => (
            <div key={p.id} className={cn(
              "group bg-white rounded-3xl border-2 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-lg",
              expandedId === p.id ? "border-blue-500 shadow-blue-100/30" : "border-slate-50 hover:border-slate-200"
            )}>
              {/* Main Card Header */}
              <div 
                onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                className="w-full flex flex-col sm:flex-row sm:items-center justify-between px-5 sm:px-6 py-4 cursor-pointer select-none"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all duration-500 shadow-md",
                    expandedId === p.id ? "bg-blue-600 text-white shadow-blue-200" : "bg-slate-50 text-slate-400 group-hover:bg-white group-hover:shadow-slate-100 group-hover:text-blue-600"
                  )}>
                    <Calendar className="w-4 h-4 mb-0.5" />
                    <span className="text-[9px] font-bold uppercase leading-none">{p.periode_tahun}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                      {BULAN_NAMES[p.periode_bulan]} {p.periode_tahun}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-base font-semibold text-slate-500 leading-none">{formatRupiah(Number(p.gaji_bersih))}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3 sm:mt-0 ml-auto sm:ml-0">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5",
                    p.status === 'acknowledged' 
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                      : "bg-blue-50 text-blue-600 border border-blue-100"
                  )}>
                    {p.status === 'acknowledged' ? (
                      <><CheckCircle2 className="w-3 h-3" /> Diterima</>
                    ) : (
                      <><Clock className="w-3 h-3 animate-pulse" /> Baru</>
                    )}
                  </div>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500",
                    expandedId === p.id ? "bg-blue-50 text-blue-600 rotate-180" : "bg-slate-50 text-slate-400"
                  )}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Detailed Content */}
              {expandedId === p.id && (
                <div className="px-5 sm:px-8 pb-8 space-y-6 animate-in slide-in-from-top-4 duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-5 border-t border-slate-100">
                    {/* Left Column: Earnings */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <TrendingUp className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Pendapatan / Earnings</h4>
                      </div>
                      <div className="bg-slate-50/50 rounded-2xl p-4 space-y-3 border border-slate-100">
                        {[
                          { label: 'Gaji Pokok', val: p.gaji_pokok, icon: <Wallet className="w-3 h-3" /> },
                          { label: 'Uang Lembur', val: p.lembur, icon: <Clock className="w-3 h-3" /> },
                          { label: 'Insentif Performa', val: p.insentif, icon: <Sparkles className="w-3 h-3 text-amber-500" /> },
                          { label: 'Tunjangan Jabatan', val: p.tunjangan, icon: <Building2 className="w-3 h-3 text-indigo-500" /> },
                          { label: 'Dinas Luar Kota', val: p.dinas_luar, icon: <TrendingUp className="w-3 h-3 text-emerald-500" /> },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between group/row">
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-md bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover/row:text-emerald-500 group-hover/row:border-emerald-100 transition-colors shadow-sm">
                                {item.icon}
                              </div>
                              <span className="text-xs font-semibold text-slate-600">{item.label}</span>
                            </div>
                            <span className="text-xs font-bold text-slate-900">{formatRupiah(Number(item.val))}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right Column: Deductions */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                          <TrendingDown className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Potongan / Deductions</h4>
                      </div>
                      <div className="bg-slate-50/50 rounded-2xl p-4 space-y-3 border border-slate-100">
                        {[
                          { label: 'Iuran BPJS (Kes/TK)', val: p.potongan_bpjs, icon: <Stethoscope className="w-3 h-3" /> },
                          { label: 'Pajak Penghasilan (PPh)', val: p.potongan_pajak, icon: <TrendingDown className="w-3 h-3" /> },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between group/row">
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-md bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover/row:text-rose-500 group-hover/row:border-rose-100 transition-colors shadow-sm">
                                {item.icon}
                              </div>
                              <span className="text-xs font-semibold text-slate-600">{item.label}</span>
                            </div>
                            <span className="text-xs font-bold text-rose-600">({formatRupiah(Number(item.val))})</span>
                          </div>
                        ))}
                        <div className="pt-1.5 italic text-[9px] text-slate-400 flex gap-2 items-start">
                          <Info className="w-2.5 h-2.5 mt-0.5 shrink-0" />
                          <span>Potongan sudah disesuaikan dengan peraturan perusahaan.</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary & Net Pay */}
                  <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[100px] -mr-32 -mt-32 rounded-full" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 blur-[60px] -ml-16 -mb-16 rounded-full" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300">Total Take Home Pay</span>
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter text-white drop-shadow-sm">
                          {formatRupiah(Number(p.gaji_bersih))}
                        </h2>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl">
                          <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg">
                            <Wallet className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest leading-none mb-1">Gaji Bersih</p>
                            <p className="text-xs font-bold leading-none">{formatRupiah(Number(p.gaji_bersih))}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Leave Info & Notes Section */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Attendance/Leave Info */}
                    <div className="md:col-span-7 bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm">
                      {(() => {
                        const lv = leaveMap.get(p.periode_tahun)
                        const sisa = lv?.sisa_cuti ?? 0
                        const sakit = lv?.jumlah_sakit ?? 0
                        const izin = lv?.jumlah_izin ?? 0
                        const alpha = lv?.jumlah_alpha ?? 0
                        return (
                          <div className="space-y-5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">
                                <Calendar className="w-4 h-4 text-indigo-500" /> Presensi & Cuti {p.periode_tahun}
                              </div>
                              <HelpCircle className="w-4 h-4 text-slate-300 cursor-help" />
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                              {[
                                { label: 'Sisa Cuti', val: sisa, bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
                                { label: 'Sakit', val: sakit, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
                                { label: 'Izin', val: izin, bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
                                { label: 'Alpha', val: alpha, bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-100' },
                              ].map((item) => (
                                <div key={item.label} className={cn("p-3 rounded-2xl border text-center transition-transform hover:scale-105", item.bg, item.border)}>
                                  <p className={cn("text-xl font-black leading-none mb-1.5", item.text)}>{item.val}</p>
                                  <p className={cn("text-[9px] font-black uppercase tracking-widest", item.text)}>{item.label}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })()}
                    </div>

                    {/* HRD Notes */}
                    <div className="md:col-span-5 bg-amber-50/50 border border-amber-100 rounded-[2.5rem] p-6 flex flex-col">
                      <div className="flex items-center gap-2 text-amber-600 font-black text-[10px] uppercase tracking-[0.2em] mb-3">
                        <FileText className="w-4 h-4" /> Catatan HRD
                      </div>
                      <p className="text-xs font-bold text-amber-800 leading-relaxed flex-1">
                        {p.catatan || 'Tidak ada catatan tambahan untuk periode ini. Tetap semangat dan jaga performa kerja!'}
                      </p>
                    </div>
                  </div>

                  {/* Timestamps & Actions */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100">
                    <div className="flex flex-col gap-1.5">
                      {p.published_at && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          Diterbitkan: {new Date(p.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      )}
                      {p.acknowledged_at && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Dikonfirmasi: {new Date(p.acknowledged_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      {p.status === 'published' && (
                        <button
                          onClick={() => handleAcknowledge(p.id)}
                          disabled={acknowledging === p.id}
                          className="flex-1 md:flex-none px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-200 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {acknowledging === p.id ? 'Memproses...' : <><CheckCircle2 className="w-4 h-4" /> Konfirmasi Terima</>}
                        </button>
                      )}
                      {p.status === 'acknowledged' && (
                        <div className="flex-1 md:flex-none px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-emerald-100">
                          <CheckCircle2 className="w-4 h-4" /> Dikonfirmasi
                        </div>
                      )}
                      <button
                        onClick={() => handleDownloadPDF(p.id)}
                        className="flex-1 md:flex-none px-6 py-3 bg-white hover:bg-slate-50 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest border border-slate-200 shadow-sm transition-all flex items-center justify-center gap-2"
                      >
                        <Download className="w-4 h-4" /> PDF
                      </button>
                    </div>
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
