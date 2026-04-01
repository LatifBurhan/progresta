'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatDurationFromInterval } from '@/lib/overtime/duration'
import type { OvertimeRequest } from '../components/OvertimeHistory'

interface AdminRequest extends OvertimeRequest {
  users?: { email: string; name?: string }
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

function getTodayJakarta(): string {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
}

export default function OvertimeAdminClient() {
  const [requests, setRequests] = useState<AdminRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [approvingId, setApprovingId] = useState<string | null>(null)

  // Filters
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all')

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ all: 'true' })
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)
      if (statusFilter !== 'all') params.set('approvalStatus', statusFilter)

      const res = await fetch(`/api/overtime/requests?${params}`)
      const data = await res.json()
      if (data.success) setRequests(data.data || [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo, statusFilter])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleApprovalToggle = async (req: AdminRequest) => {
    setApprovingId(req.id)
    try {
      const newApproved = req.approval_status !== 'approved'
      const res = await fetch('/api/overtime/approve', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: req.id, approved: newApproved }),
      })
      const data = await res.json()
      if (data.success) {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === req.id
              ? { ...r, approval_status: data.data.approvalStatus }
              : r
          )
        )
      }
    } catch {
      // silently fail
    } finally {
      setApprovingId(null)
    }
  }

  // Today's recap
  const todayStr = new Date().toISOString().split('T')[0]
  const todayRequests = requests.filter((r) => r.created_at.startsWith(todayStr))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manajemen Lembur</h1>
        <p className="text-sm text-slate-500 mt-1">Kelola dan setujui permintaan lembur karyawan</p>
      </div>

      {/* Daily Recap */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-1">Rekap Hari Ini</h2>
        <p className="text-xs text-slate-500 mb-4">{getTodayJakarta()}</p>
        {todayRequests.length === 0 ? (
          <p className="text-sm text-slate-400">Belum ada lembur hari ini</p>
        ) : (
          <div className="space-y-2">
            {todayRequests.map((req) => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-slate-800">{req.users?.name || req.users?.email || 'Karyawan'}</p>
                  <p className="text-xs text-slate-500">{formatDurationFromInterval(req.duration)}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  req.approval_status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {req.approval_status === 'approved' ? 'Disetujui' : 'Menunggu'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Dari Tanggal</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'approved')}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="all">Semua</option>
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
            </select>
          </div>
          <button
            onClick={() => { setDateFrom(''); setDateTo(''); setStatusFilter('all') }}
            className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Daftar Lembur</h3>
          <button
            onClick={fetchRequests}
            disabled={loading}
            className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50 flex items-center gap-1"
          >
            <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <svg className="w-6 h-6 animate-spin text-slate-400 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">Tidak ada data lembur</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Karyawan</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lokasi</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Project Leader</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tujuan</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Durasi</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Bukti</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Setujui</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-slate-800 font-medium">
                      {req.users?.name || req.users?.email || '-'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(req.created_at)}</td>
                    <td className="px-4 py-3 text-slate-600">{req.location}</td>
                    <td className="px-4 py-3 text-slate-600">{req.project_leader}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate" title={req.purpose}>{req.purpose}</td>
                    <td className="px-4 py-3 text-orange-600 font-medium whitespace-nowrap">{formatDurationFromInterval(req.duration)}</td>
                    <td className="px-4 py-3">
                      {req.proof_photo_url ? (
                        <a href={req.proof_photo_url} target="_blank" rel="noopener noreferrer">
                          <img src={req.proof_photo_url} alt="Bukti" className="w-10 h-10 rounded-lg object-cover border border-slate-200 hover:border-orange-300 transition-colors" />
                        </a>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={req.approval_status === 'approved'}
                          onChange={() => handleApprovalToggle(req)}
                          disabled={approvingId === req.id}
                          className="w-4 h-4 rounded accent-green-600 cursor-pointer"
                        />
                        <span className={`text-xs font-semibold ${
                          req.approval_status === 'approved' ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {approvingId === req.id ? '...' : req.approval_status === 'approved' ? 'Disetujui' : 'Menunggu'}
                        </span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
