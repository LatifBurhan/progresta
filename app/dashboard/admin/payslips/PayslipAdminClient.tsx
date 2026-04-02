'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import type { Employee, Payslip } from '@/lib/payslip/types'
import type { EmployeeLeave } from '@/lib/leave/types'
import PayslipFormModal from './PayslipFormModal'
import BulkGenerateModal from './BulkGenerateModal'
import LeaveFormModal from './LeaveFormModal'

interface Department { id: string; name: string }
interface Division { id: string; name: string }

interface PayslipAdminClientProps {
  initialEmployees: Employee[]
  departments: Department[]
  divisions: Division[]
}

const BULAN_NAMES = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

const STATUS_BADGE: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-600',
  published: 'bg-blue-100 text-blue-700',
  acknowledged: 'bg-green-100 text-green-700',
}

export default function PayslipAdminClient({
  initialEmployees,
  departments,
  divisions,
}: PayslipAdminClientProps) {
  const now = new Date()
  const [bulan, setBulan] = useState(now.getMonth() + 1)
  const [tahun, setTahun] = useState(now.getFullYear())
  const [departemenId, setDepartemenId] = useState('')
  const [divisiId, setDivisiId] = useState('')
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [leaveMap, setLeaveMap] = useState<Map<string, EmployeeLeave>>(new Map())
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [formEmployee, setFormEmployee] = useState<Employee | null>(null)
  const [editPayslip, setEditPayslip] = useState<Payslip | null>(null)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [leaveEmployee, setLeaveEmployee] = useState<Employee | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchPayslips = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        bulan: String(bulan),
        tahun: String(tahun),
        ...(departemenId ? { departemen_id: departemenId } : {}),
        ...(divisiId ? { divisi_id: divisiId } : {}),
      })
      const [payslipRes, leaveRes] = await Promise.all([
        fetch(`/api/admin/payslips?${params}`),
        fetch(`/api/admin/leave?tahun=${tahun}`),
      ])
      const [payslipJson, leaveJson] = await Promise.all([payslipRes.json(), leaveRes.json()])
      if (payslipJson.success) setPayslips(payslipJson.data ?? [])
      if (leaveJson.success) {
        setLeaveMap(new Map((leaveJson.data ?? []).map((l: EmployeeLeave) => [l.user_id, l])))
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [bulan, tahun, departemenId, divisiId])

  useEffect(() => {
    fetchPayslips()
  }, [fetchPayslips])

  const payslipMap = new Map(payslips.map((p) => [p.user_id, p]))

  const filteredEmployees = initialEmployees

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredEmployees.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredEmployees.map((e) => e.id)))
    }
  }

  const handlePublishAll = async () => {
    if (!confirm(`Publish semua slip draft untuk ${BULAN_NAMES[bulan]} ${tahun}?`)) return
    setPublishing(true)
    try {
      const res = await fetch('/api/admin/payslips/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ periode_bulan: bulan, periode_tahun: tahun }),
      })
      const json = await res.json()
      if (json.success) {
        showToast(`Berhasil menerbitkan ${json.data.published_count} slip gaji`)
        fetchPayslips()
      } else {
        showToast(json.message || 'Gagal menerbitkan', 'error')
      }
    } catch {
      showToast('Terjadi kesalahan', 'error')
    } finally {
      setPublishing(false)
    }
  }

  const selectedEmployees = filteredEmployees.filter((e) => selectedIds.has(e.id))

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kelola Slip Gaji & Cuti</h1>
          <p className="text-sm text-slate-500 mt-1">Buat, edit, terbitkan slip gaji, dan kelola data cuti karyawan</p>
        </div>
        <Link
          href="/dashboard/admin/payslips/recap"
          className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          Lihat Rekap
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4">
        <div className="flex flex-wrap gap-3">
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
              <option value="">Semua Departemen</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Divisi</label>
            <select
              value={divisiId}
              onChange={(e) => setDivisiId(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Semua Divisi</option>
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handlePublishAll}
          disabled={publishing}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {publishing ? 'Menerbitkan...' : 'Publish Semua Draft'}
        </button>
        {selectedIds.size > 0 && (
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
          >
            Bulk Generate ({selectedIds.size} karyawan)
          </button>
        )}
        {selectedIds.size === 0 && (
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            Bulk Generate
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredEmployees.length && filteredEmployees.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status Slip</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Gaji Bersih</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Info Cuti</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-sm">Memuat data...</td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-sm">Tidak ada karyawan aktif</td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const ps = payslipMap.get(emp.id)
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(emp.id)}
                          onChange={() => toggleSelect(emp.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{emp.name || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-500">{emp.email}</td>
                      <td className="px-4 py-3">
                        {ps ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[ps.status]}`}>
                            {ps.status}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Belum dibuat</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {ps ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(Number(ps.gaji_bersih))) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const lv = leaveMap.get(emp.id)
                          if (!lv) return <span className="text-xs text-slate-400">-</span>
                          return (
                            <div className="flex flex-wrap gap-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-50 text-green-700 text-xs font-medium">
                                Sisa {lv.sisa_cuti}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-medium">
                                Sakit {lv.jumlah_sakit}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-50 text-yellow-700 text-xs font-medium">
                                Izin {lv.jumlah_izin}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 text-xs font-medium">
                                Alpha {lv.jumlah_alpha}
                              </span>
                            </div>
                          )
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setFormEmployee(emp); setEditPayslip(ps ?? null) }}
                            className="text-xs px-3 py-1.5 rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 font-medium transition-colors"
                          >
                            {ps ? 'Edit' : 'Buat Slip'}
                          </button>
                          <button
                            onClick={() => setLeaveEmployee(emp)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 font-medium transition-colors"
                          >
                            Cuti
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {formEmployee && (
        <PayslipFormModal
          employee={formEmployee}
          periode={{ bulan, tahun }}
          existingPayslip={editPayslip}
          onSuccess={() => { setFormEmployee(null); setEditPayslip(null); fetchPayslips() }}
          onCancel={() => { setFormEmployee(null); setEditPayslip(null) }}
        />
      )}

      {/* Bulk Generate Modal */}
      {showBulkModal && (
        <BulkGenerateModal
          selectedEmployees={selectedEmployees.length > 0 ? selectedEmployees : filteredEmployees}
          periode={{ bulan, tahun }}
          onSuccess={(count) => { setShowBulkModal(false); setSelectedIds(new Set()); fetchPayslips(); showToast(`Berhasil membuat ${count} slip gaji`) }}
          onCancel={() => setShowBulkModal(false)}
        />
      )}

      {/* Leave Modal */}
      {leaveEmployee && (
        <LeaveFormModal
          employee={leaveEmployee}
          tahun={tahun}
          onSuccess={() => { setLeaveEmployee(null); showToast('Data cuti berhasil disimpan'); fetchPayslips() }}
          onCancel={() => setLeaveEmployee(null)}
        />
      )}
    </div>
  )
}
