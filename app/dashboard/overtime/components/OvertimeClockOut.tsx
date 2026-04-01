'use client'

import { useState, useEffect, useRef } from 'react'

interface ActiveSession {
  id: string
  start_time: string
  location: string
  project_leader: string
  purpose: string
}

interface OvertimeClockOutProps {
  session: ActiveSession
  onSuccess: (data: { requestId: string; duration: string; proofPhotoUrl: string }) => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

function formatLiveDuration(startTime: string): string {
  const start = new Date(startTime).getTime()
  const now = Date.now()
  const diffMs = now - start
  const totalSeconds = Math.floor(diffMs / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function formatStartTime(startTime: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(startTime))
}

export default function OvertimeClockOut({ session, onSuccess }: OvertimeClockOutProps) {
  const [duration, setDuration] = useState(formatLiveDuration(session.start_time))
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileError, setFileError] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(formatLiveDuration(session.start_time))
    }, 1000)
    return () => clearInterval(interval)
  }, [session.start_time])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('')
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setFileError('File harus berupa gambar (jpg, png, webp, dll)')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError('Ukuran file maksimal 10MB')
      return
    }

    setProofFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!proofFile) {
      setFileError('Foto bukti wajib diunggah')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('proofPhoto', proofFile)

      const res = await fetch('/api/overtime/clock-out', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Gagal mengakhiri sesi lembur')
        return
      }
      onSuccess(data.data)
    } catch {
      setErrorMessage('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Sesi Lembur Aktif</h2>
          <p className="text-sm text-slate-500">Selesaikan lembur dengan mengunggah foto bukti</p>
        </div>
      </div>

      {/* Live Duration */}
      <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl text-center">
        <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">Durasi Lembur</p>
        <p className="text-4xl font-bold text-orange-700 font-mono">{duration}</p>
      </div>

      {/* Session Info */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 bg-slate-50 rounded-xl">
          <p className="text-xs text-slate-500 mb-0.5">Lokasi</p>
          <p className="text-sm font-medium text-slate-800">{session.location}</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl">
          <p className="text-xs text-slate-500 mb-0.5">Project Leader</p>
          <p className="text-sm font-medium text-slate-800">{session.project_leader}</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl sm:col-span-2">
          <p className="text-xs text-slate-500 mb-0.5">Tujuan</p>
          <p className="text-sm font-medium text-slate-800">{session.purpose}</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl sm:col-span-2">
          <p className="text-xs text-slate-500 mb-0.5">Mulai</p>
          <p className="text-sm font-medium text-slate-800">{formatStartTime(session.start_time)}</p>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Foto Bukti Lembur <span className="text-red-500">*</span>
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors ${
              fileError ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-orange-300 hover:bg-orange-50/30'
            }`}
          >
            {previewUrl ? (
              <div className="relative">
                <img src={previewUrl} alt="Preview" className="w-full max-h-48 object-contain rounded-lg" />
                <p className="text-xs text-slate-500 text-center mt-2">Klik untuk ganti foto</p>
              </div>
            ) : (
              <div className="text-center py-4">
                <svg className="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-slate-600">Klik untuk unggah foto bukti</p>
                <p className="text-xs text-slate-400 mt-1">Format: JPG, PNG, WEBP (maks. 10MB)</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {fileError && <p className="mt-1 text-xs text-red-600">{fileError}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Mengakhiri...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              Selesai Lembur
            </>
          )}
        </button>
      </form>
    </div>
  )
}
