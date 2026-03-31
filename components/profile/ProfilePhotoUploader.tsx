'use client'

import { useState, useRef, ChangeEvent } from 'react'
import { Camera, Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'

interface ProfilePhotoUploaderProps {
  currentPhotoUrl?: string | null
  onPhotoUpdate: (photoUrl: string | null) => void
  disabled?: boolean
}

export function ProfilePhotoUploader({
  currentPhotoUrl,
  onPhotoUpdate,
  disabled = false
}: ProfilePhotoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentPhotoUrl || null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!validTypes.includes(file.type)) {
      setError('Format file harus JPG, JPEG, atau PNG')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError('Ukuran file maksimal 5MB')
      return
    }

    setError(null)
    setUploading(true)

    try {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to server
      const formData = new FormData()
      formData.append('photo', file)

      const response = await fetch('/api/profile/photo/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Gagal upload foto')
      }

      // Update parent component
      onPhotoUpdate(result.photoUrl)
      setPreview(result.photoUrl)
    } catch (err: any) {
      setError(err.message || 'Gagal upload foto')
      setPreview(currentPhotoUrl || null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemovePhoto = async () => {
    if (!confirm('Hapus foto profil?')) return

    setUploading(true)
    setError(null)

    try {
      const response = await fetch('/api/profile/photo/remove', {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Gagal hapus foto')
      }

      setPreview(null)
      onPhotoUpdate(null)
    } catch (err: any) {
      setError(err.message || 'Gagal hapus foto')
    } finally {
      setUploading(false)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4">
        {/* Photo Preview */}
        <div className="relative">
          {preview ? (
            <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-blue-100 shadow-lg">
              <Image
                src={preview}
                alt="Profile"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-4xl font-black shadow-lg">
              <Camera className="w-12 h-12" />
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleButtonClick}
            disabled={disabled || uploading}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            {preview ? 'Ganti Foto' : 'Upload Foto'}
          </Button>

          {preview && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemovePhoto}
              disabled={disabled || uploading}
              className="gap-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              <X className="w-4 h-4" />
              Hapus
            </Button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-rose-600 text-center font-medium">
          {error}
        </p>
      )}

      {/* Help Text */}
      <p className="text-xs text-slate-400 text-center">
        Format: JPG, JPEG, PNG • Maksimal 5MB
      </p>
    </div>
  )
}
