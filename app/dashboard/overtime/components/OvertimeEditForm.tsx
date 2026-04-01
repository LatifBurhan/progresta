'use client'

import { useState, useEffect, useRef } from 'react'
import type { OvertimeRequest } from './OvertimeHistory'

interface OvertimeEditFormProps {
  request: OvertimeRequest
  onSuccess: () => void
  onCancel: () => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024

function getTimeRemaining(createdAt: string): string {
  const deadline = new Date(createdAt).getTime() + 24 * 60 * 60 * 1000
  const remaining = deadline - Date.now()
  if (remaining <= 0) return 'Waktu edit habis'
  const hours = Math.floor(remaining / (1000 * 60 * 60))
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}j ${minutes}m tersisa`
}

function isEditAllowed(request: OvertimeRequest): boolean {
  if (request.approval_status !== 'pending') return false
  const created = new Date(request.created_at).getTime()
  return Date.now() - created <= 24 * 60 * 60 * 1000
}

export default function OvertimeEditForm({ request, onSuccess, onCancel }: OvertimeEditFormProps) {
  const [location, setLocation] = useState(request.location)
  const [projectLeader, setProjectLeader] = useState(request.project_leader)
  const [purpose, setPurpose] = useState(request.purpose)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [fileError, setFileError] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(request.created_at))
  const fileInputRef = useRef<HTMLInputElement>(null)

  const allowed = isEditAllowed(request)

  useEffect(() => {
    if (!allowed) return
    const interval = setInterval(() => {
      setTimeRemaining(getTimeRemaining(request.created_at))
    }, 60000)
    return () => clearInterval(interval)
  }, [request.created_at, allowed])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('')
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setFileError('File harus berupa gambar')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError('Ukuran file maksimal 10MB')
      return
    }
    setProofFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!location.trim()) newErrors.location = 'Lokasi wajib diisi'
    if (!projectLeader.trim()) newErrors.projectLeader = 'Nama project leader wajib diisi'
    if (!purpose.trim()) newErrors.purpose = 'Tujuan wajib diisi'
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})

    setLoading(true)
    try {
      let body: FormData | string
      let headers: Record<string, string> = {}

      if (proofFile) {
        const fd = new FormData()
        fd.append('location', location.trim())
        fd.append('projectLeader', projectLeader.trim())
        fd.append('purpose', purpose.trim())
        fd.append('proofPhoto', proofFile)
        body = fd
      } else {
        body = JSON.stringify({ location: location.trim(), projectLeader: projectLeader.trim(), purpose: purpose.trim() })
        headers['Content-Type'] = 'application/json'
      }

      const res = await fetch(`/api/overtime/requests/${request.id}`, {
        method: 'PUT',
        headers,
        body,
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Gagal memperbarui permintaan lembur')
        return
      }
      onSuccess()
    } catch {
      setErrorMessage('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const isDisabled = !allowed || loading

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900">Edit Permintaan Lembur</h3>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Status banner */}
      {!allowed && (
        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600">
          {request.approval_status === 'approved'
            ? '✓ Permintaan ini sudah disetujui dan tidak dapat diedit.'
            : '⏰ Waktu edit 24 jam telah habis.'}
        </div>
      )}

      {allowed && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0" />
          </svg>
          {timeRemaining}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Lokasi Lembur</label>
          <input
            type="text"
            value={location}
            onChange={(e) => { setLocation(e.target.value); setErrors((p) => ({ ...p, location: '' })) }}
            disabled={isDisabled}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:bg-slate-50 disabled:text-slate-400 ${
              errors.location ? 'border-red-300 bg-red-50' : 'border-slate-200'
            }`}
          />
          {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Project Leader</label>
          <input
            type="text"
            value={projectLeader}
            onChange={(e) => { setProjectLeader(e.target.value); setErrors((p) => ({ ...p, projectLeader: '' })) }}
            disabled={isDisabled}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20 disabled:bg-slate-50 disabled:text-slate-400 ${
              errors.projectLeader ? 'border-red-300 bg-red-50' : 'border-slate-200'
            }`}
          />
          {errors.projectLeader && <p className="mt-1 text-xs text-red-600">{errors.projectLeader}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Tujuan Lembur</label>
          <textarea
            value={purpose}
            onChange={(e) => { setPurpose(e.target.value); setErrors((p) => ({ ...p, purpose: '' })) }}
            disabled={isDisabled}
            rows={3}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-none disabled:bg-slate-50 disabled:text-slate-400 ${
              errors.purpose ? 'border-red-300 bg-red-50' : 'border-slate-200'
            }`}
          />
          {errors.purpose && <p className="mt-1 text-xs text-red-600">{errors.purpose}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Ganti Foto Bukti (opsional)</label>
          <div
            onClick={() => !isDisabled && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 transition-colors ${
              isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-orange-300 hover:bg-orange-50/30'
            } ${fileError ? 'border-red-300 bg-red-50' : 'border-slate-200'}`}
          >
            {previewUrl ? (
              <div>
                <img src={previewUrl} alt="Preview baru" className="w-full max-h-40 object-contain rounded-lg" />
                <p className="text-xs text-slate-500 text-center mt-2">Klik untuk ganti</p>
              </div>
            ) : request.proof_photo_url ? (
              <div>
                <img src={request.proof_photo_url} alt="Foto saat ini" className="w-full max-h-40 object-contain rounded-lg" />
                <p className="text-xs text-slate-500 text-center mt-2">Foto saat ini — klik untuk ganti</p>
              </div>
            ) : (
              <div className="text-center py-3">
                <p className="text-sm text-slate-500">Klik untuk unggah foto baru</p>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          {fileError && <p className="mt-1 text-xs text-red-600">{fileError}</p>}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 border border-slate-200 text-slate-600 font-medium rounded-xl hover:bg-slate-50 transition-colors text-sm"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isDisabled}
            className="flex-1 py-2.5 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Menyimpan...
              </>
            ) : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  )
}
