'use client'

import { useState } from 'react'
import { formatDurationFromInterval } from '@/lib/overtime/duration'

export interface OvertimeRequest {
  id: string
  session_id: string
  user_id: string
  location: string
  project_leader: string
  purpose: string
  duration: string
  proof_photo_url: string
  approval_status: 'pending' | 'approved'
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
  users?: { email: string; name?: string }
}

interface OvertimeHistoryProps {
  requests: OvertimeRequest[]
  onEdit: (request: OvertimeRequest) => void
}

function canEdit(request: OvertimeRequest): boolean {
  if (request.approval_status !== 'pending') return false
  const created = new Date(request.created_at).getTime()
  const now = Date.now()
  return now - created <= 24 * 60 * 60 * 1000
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export default function OvertimeHistory({ requests, onEdit }: OvertimeHistoryProps) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
        <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-slate-500 text-sm">Belum ada riwayat lembur</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-900">Riwayat Lembur</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {requests.map((req) => (
            <div key={req.id} className="p-4 sm:p-6 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-800">{formatDate(req.created_at)}</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      req.approval_status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {req.approval_status === 'approved' ? '✓ Disetujui' : '⏳ Menunggu'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm text-slate-600">
                    <div><span className="text-slate-400">Lokasi:</span> {req.location}</div>
                    <div><span className="text-slate-400">Project Leader:</span> {req.project_leader}</div>
                    <div className="sm:col-span-2"><span className="text-slate-400">Tujuan:</span> {req.purpose}</div>
                    <div><span className="text-slate-400">Durasi:</span> <span className="font-medium text-orange-600">{formatDurationFromInterval(req.duration)}</span></div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  {req.proof_photo_url && (
                    <button
                      onClick={() => setLightboxUrl(req.proof_photo_url)}
                      className="block w-16 h-16 rounded-xl overflow-hidden border border-slate-200 hover:border-orange-300 transition-colors"
                    >
                      <img src={req.proof_photo_url} alt="Bukti" className="w-full h-full object-cover" />
                    </button>
                  )}
                  {canEdit(req) && (
                    <button
                      onClick={() => onEdit(req)}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white text-sm"
            >
              ✕ Tutup
            </button>
            <img src={lightboxUrl} alt="Bukti Lembur" className="w-full rounded-xl shadow-2xl" />
          </div>
        </div>
      )}
    </>
  )
}
