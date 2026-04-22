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
  start_photo_url: string | null
  proof_photo_url: string
  approval_status: 'pending' | 'approved'
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
  users?: { email: string; name?: string }
  overtime_sessions?: {
    clock_in_lat: number | null
    clock_in_lng: number | null
    clock_out_lat: number | null
    clock_out_lng: number | null
  }
}

interface OvertimeHistoryProps {
  requests: OvertimeRequest[]
  onEdit: (request: OvertimeRequest) => void
  onDelete?: (requestId: string) => void
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

export default function OvertimeHistory({ requests, onEdit, onDelete }: OvertimeHistoryProps) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ open: boolean; request: OvertimeRequest | null }>({ open: false, request: null })
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (requestId: string) => {
    setDeletingId(requestId)
    try {
      const res = await fetch(`/api/overtime/delete?requestId=${requestId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (data.success) {
        if (onDelete) onDelete(requestId)
        setDeleteConfirmModal({ open: false, request: null })
      } else {
        alert(data.message || 'Gagal menghapus lembur')
      }
    } catch (error) {
      alert('Terjadi kesalahan saat menghapus lembur')
    } finally {
      setDeletingId(null)
    }
  }

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
                  <div className="flex gap-2">
                    {req.start_photo_url && (
                      <button
                        onClick={() => setLightboxUrl(req.start_photo_url!)}
                        className="block w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-slate-200 hover:border-blue-300 transition-all shadow-sm"
                        title="Foto Awal"
                      >
                        <img src={req.start_photo_url} alt="Awal" className="w-full h-full object-cover" />
                      </button>
                    )}
                    {req.proof_photo_url && (
                      <button
                        onClick={() => setLightboxUrl(req.proof_photo_url)}
                        className="block w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-slate-200 hover:border-orange-300 transition-all shadow-sm"
                        title="Foto Selesai"
                      >
                        <img src={req.proof_photo_url} alt="Selesai" className="w-full h-full object-cover" />
                      </button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {canEdit(req) && (
                      <button
                        onClick={() => onEdit(req)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => setDeleteConfirmModal({ open: true, request: req })}
                        className="text-xs font-medium text-rose-600 hover:text-rose-700 px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors"
                        title="Hapus Lembur"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal.open && deleteConfirmModal.request && (
        <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setDeleteConfirmModal({ open: false, request: null })}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Hapus Lembur?</h3>
                <p className="text-sm text-slate-500">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-6 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tanggal:</span>
                <span className="font-semibold text-slate-900">{formatDate(deleteConfirmModal.request.created_at)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Lokasi:</span>
                <span className="font-semibold text-slate-900">{deleteConfirmModal.request.location}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Durasi:</span>
                <span className="font-semibold text-orange-600">{formatDurationFromInterval(deleteConfirmModal.request.duration)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Status:</span>
                <span className={`font-semibold ${deleteConfirmModal.request.approval_status === 'approved' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {deleteConfirmModal.request.approval_status === 'approved' ? 'Disetujui' : 'Menunggu'}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmModal({ open: false, request: null })}
                disabled={deletingId === deleteConfirmModal.request.id}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmModal.request!.id)}
                disabled={deletingId === deleteConfirmModal.request.id}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingId === deleteConfirmModal.request.id ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Menghapus...
                  </>
                ) : (
                  'Ya, Hapus'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
