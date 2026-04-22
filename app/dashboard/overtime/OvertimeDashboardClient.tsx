'use client'

import { useState, useCallback, useEffect } from 'react'
import OvertimeClockIn from './components/OvertimeClockIn'
import OvertimeClockOut from './components/OvertimeClockOut'
import OvertimeHistory, { type OvertimeRequest } from './components/OvertimeHistory'
import OvertimeEditForm from './components/OvertimeEditForm'

interface ActiveSession {
  id: string
  start_time: string
  location: string
  project_leader: string
  purpose: string
}

interface OvertimeDashboardClientProps {
  initialSession: ActiveSession | null
}

export default function OvertimeDashboardClient({ initialSession }: OvertimeDashboardClientProps) {
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(initialSession)
  const [requests, setRequests] = useState<OvertimeRequest[]>([])
  const [requestsLoaded, setRequestsLoaded] = useState(false)
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [editingRequest, setEditingRequest] = useState<OvertimeRequest | null>(null)

  const fetchRequests = useCallback(async () => {
    setLoadingRequests(true)
    try {
      const res = await fetch('/api/overtime/requests')
      const data = await res.json()
      if (data.success) {
        setRequests(data.data || [])
      }
    } catch {
      // silently fail
    } finally {
      setLoadingRequests(false)
      setRequestsLoaded(true)
    }
  }, [])

  // Load history on mount
  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const handleClockInSuccess = (sessionId: string, startTime: string) => {
    // We need the full session data — refetch active session
    fetch('/api/overtime/sessions/active')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data) setActiveSession(d.data)
      })
  }

  const handleClockOutSuccess = () => {
    setActiveSession(null)
    fetchRequests()
  }

  const handleEditSuccess = () => {
    setEditingRequest(null)
    fetchRequests()
  }

  const handleDeleteSuccess = (requestId: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== requestId))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lembur</h1>
        <p className="text-sm text-slate-500 mt-1">Kelola sesi lembur dan lihat riwayat pengajuan</p>
      </div>

      {/* Clock In / Clock Out */}
      {activeSession ? (
        <OvertimeClockOut
          session={activeSession}
          onSuccess={handleClockOutSuccess}
        />
      ) : (
        <OvertimeClockIn onSuccess={handleClockInSuccess} />
      )}

      {/* Edit Modal */}
      {editingRequest && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg">
            <OvertimeEditForm
              request={editingRequest}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditingRequest(null)}
            />
          </div>
        </div>
      )}

      {/* History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-800">Riwayat Lembur</h2>
          <button
            onClick={fetchRequests}
            disabled={loadingRequests}
            className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50 flex items-center gap-1"
          >
            <svg className={`w-3.5 h-3.5 ${loadingRequests ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {loadingRequests && !requestsLoaded ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <svg className="w-6 h-6 animate-spin text-slate-400 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : (
          <OvertimeHistory requests={requests} onEdit={setEditingRequest} onDelete={handleDeleteSuccess} />
        )}
      </div>
    </div>
  )
}
