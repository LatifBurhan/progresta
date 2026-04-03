'use client'

import { useState, useRef } from 'react'

interface OvertimeClockInProps {
  onSuccess: (sessionId: string, startTime: string) => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export default function OvertimeClockIn({ onSuccess }: OvertimeClockInProps) {
  const [location, setLocation] = useState('')
  const [projectLeader, setProjectLeader] = useState('')
  const [purpose, setPurpose] = useState('')
  const [startFile, setStartFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!location.trim()) newErrors.location = 'Lokasi lembur wajib diisi'
    if (!projectLeader.trim()) newErrors.projectLeader = 'Nama project leader wajib diisi'
    if (!purpose.trim()) newErrors.purpose = 'Tujuan lembur wajib diisi'
    if (!startFile) newErrors.photo = 'Foto awal wajib diunggah'
    return newErrors
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrors((prev) => ({ ...prev, photo: '' }))
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({ ...prev, photo: 'File harus berupa gambar (jpg, png, webp, dll)' }))
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({ ...prev, photo: 'Ukuran file maksimal 10MB' }))
      return
    }

    setStartFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
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
      const formData = new FormData()
      formData.append('location', location.trim())
      formData.append('projectLeader', projectLeader.trim())
      formData.append('purpose', purpose.trim())
      if (startFile) {
        formData.append('startPhoto', startFile)
      }

      const res = await fetch('/api/overtime/clock-in', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setErrorMessage(data.message || 'Gagal memulai sesi lembur')
        return
      }
      onSuccess(data.data.sessionId, data.data.startTime)
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
          <h2 className="text-lg font-semibold text-slate-900">Mulai Lembur</h2>
          <p className="text-sm text-slate-500">Isi data dan unggah foto untuk memulai</p>
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
            Foto Awal Lembur <span className="text-red-500">*</span>
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors ${
              errors.photo ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-orange-300 hover:bg-orange-50/30'
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
                <p className="text-sm text-slate-600 font-medium">Ambil/Unggah Foto Kondisi Awal</p>
                <p className="text-xs text-slate-400 mt-1">Wajib menyertakan foto sebelum mulai</p>
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
          {errors.photo && <p className="mt-1 text-xs text-red-600">{errors.photo}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Lokasi Lembur <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => { setLocation(e.target.value); setErrors((prev) => ({ ...prev, location: '' })) }}
            placeholder="Contoh: Kantor Pusat, Lantai 3"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
              errors.location ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          />
          {errors.location && <p className="mt-1 text-xs text-red-600">{errors.location}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Nama Project Leader <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={projectLeader}
            onChange={(e) => { setProjectLeader(e.target.value); setErrors((prev) => ({ ...prev, projectLeader: '' })) }}
            placeholder="Nama project leader"
            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20 ${
              errors.projectLeader ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          />
          {errors.projectLeader && <p className="mt-1 text-xs text-red-600">{errors.projectLeader}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Tujuan Lembur <span className="text-red-500">*</span>
          </label>
          <textarea
            value={purpose}
            onChange={(e) => { setPurpose(e.target.value); setErrors((prev) => ({ ...prev, purpose: '' })) }}
            placeholder="Jelaskan tujuan lembur..."
            rows={3}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-none ${
              errors.purpose ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          />
          {errors.purpose && <p className="mt-1 text-xs text-red-600">{errors.purpose}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-orange-100 active:scale-[0.98]"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Memulai...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0" />
              </svg>
              Mulai Sesi Lembur
            </>
          )}
        </button>
      </form>
    </div>
  )
}
