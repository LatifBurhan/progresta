'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import type { RecapData } from '@/lib/payslip/types'

interface Department { id: string; name: string }
interface Division { id: string; name: string }

interface PayslipRecapClientProps {
  departments: Department[]
  divisions: Division[]
}

const BULAN_NAMES = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

export default function PayslipRecapClient({ departments, divisions }: PayslipRecapClientProps) {
  const now = new Date()
  const [bulan, setBulan] = useState(now.getMonth() + 1)
  const [tahun, setTahun] = useState(now.getFullYear())
  const [departemenId, setDepartemenId] = useState('')
  const [divisiId, setDivisiId] = useState('')
  const [recap, setRecap] = useState<RecapData | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const fetchRecap = useCallback(async () => {
    setLoading(true)
    setSearched(true)
    try {
      const params = new URLSearchParams({
        bulan: String(bulan),
        tahun: String(tahun),
        ...(departemenId ? { departemen_id: departemenId } : {}),
        ...(divisiId ? { divisi_id: divisiId } : {}),
      })
      const res = await fetch(`/api/admin/payslips/recap?${params}`)
      const json = await res.json()
      if (json.success) setRecap(json.data)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [bulan, tahun, departemenId, divisiId])

  const exportCSV = () => {
    if (!recap || recap.detail.length === 0) return

    const headers = ['Nama', 'Email', 'Gaji Pokok', 'Lembur', 'Insentif', 'Tunjangan Pokok', 'Bonus KPI', 'Dinas Luar', 'Potongan BPJS', 'Potongan Pajak PPH21', 'Gaji Bersih', 'Status']
    const rows = recap.detail.map((p) => [
      p.users?.name || '',
      p.users?.email || '',
      p.gaji_pokok,
      p.lembur,
      p.insentif,
      p.tunjangan,
      (p as any).bonus_kpi || 0,
      p.dinas_luar,
      p.potongan_bpjs,
      p.potongan_pajak,
      p.gaji_bersih,
      p.status,
    ])

    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rekap-gaji-${BULAN_NAMES[bulan]}-${tahun}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Rekap Penggajian</h1>
          <p className="text-sm text-slate-500 mt-1">Ringkasan total pengeluaran gaji per periode</p>
        </div>
        <Link
          href="/dashboard/admin/payslips"
          className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
        >
          ← Kembali
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Bulan</label>
            <select
              value={bulan}
              onChange={(e) => setBulan(Number(e.target.value))}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {BULAN_NAMES.slice(1).map((name, i) => (
                <option key={i + 1} value={i + 1}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Tahun</label>
            <select
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {Array.from({ length: 6 }, (_, i) => now.getFullYear() - i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Departemen</label>
            <select
              value={departemenId}
              onChange={(e) => setDepartemenId(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Semua</option>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Divisi</label>
            <select
              value={divisiId}
              onChange={(e) => setDivisiId(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Semua</option>
              {divisions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <button
            onClick={fetchRecap}
            disabled={loading}
            className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Memuat...' : 'Tampilkan Rekap'}
          </button>
        </div>
      </div>

      {searched && !loading && recap && recap.jumlah_karyawan === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <p className="text-slate-400 text-sm">Belum ada data slip gaji untuk periode ini</p>
        </div>
      )}

      {recap && recap.jumlah_karyawan > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500 mb-1">Jumlah Karyawan</p>
              <p className="text-2xl font-bold text-slate-900">{recap.jumlah_karyawan}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500 mb-1">Total Gaji Pokok</p>
              <p className="text-lg font-bold text-slate-900">{formatRupiah(recap.total_gaji_pokok)}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-xs text-slate-500 mb-1">Total Potongan</p>
              <p className="text-lg font-bold text-red-600">{formatRupiah(recap.total_potongan_bpjs + recap.total_potongan_pajak)}</p>
            </div>
            <div className="bg-teal-50 rounded-2xl border border-teal-200 p-4">
              <p className="text-xs text-teal-600 mb-1">Total Gaji Bersih</p>
              <p className="text-lg font-bold text-teal-700">{formatRupiah(recap.total_gaji_bersih)}</p>
            </div>
          </div>

          {/* Detail breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {[
                { label: 'Lembur', val: recap.total_lembur },
                { label: 'Insentif', val: recap.total_insentif },
                { label: 'Tunjangan Pokok', val: recap.total_tunjangan },
                { label: 'Bonus KPI', val: (recap as any).total_bonus_kpi || 0 },
                { label: 'Dinas Luar', val: recap.total_dinas_luar },
                { label: 'Potongan BPJS', val: recap.total_potongan_bpjs },
                { label: 'Potongan Pajak PPH21', val: recap.total_potongan_pajak },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-slate-500">{item.label}</p>
                  <p className="font-semibold text-slate-800">{formatRupiah(item.val)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Export + Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-800">Detail Per Karyawan</h3>
              <button
                onClick={exportCSV}
                className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors"
              >
                Ekspor CSV
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Nama</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Gaji Pokok</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Lembur</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Potongan</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Gaji Bersih</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recap.detail.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">{p.users?.name || p.users?.email || '-'}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{formatRupiah(Number(p.gaji_pokok))}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{formatRupiah(Number(p.lembur))}</td>
                      <td className="px-4 py-3 text-right text-red-600">{formatRupiah(Number(p.potongan_bpjs) + Number(p.potongan_pajak))}</td>
                      <td className="px-4 py-3 text-right font-semibold text-teal-700">{formatRupiah(Number(p.gaji_bersih))}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${p.status === 'acknowledged' ? 'bg-green-100 text-green-700' : p.status === 'published' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
