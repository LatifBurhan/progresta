'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { Camera, User, Phone, Briefcase } from 'lucide-react'

type Profile = {
  id: string
  name: string | null
  fotoProfil: string | null
  phone: string | null
  position: string | null
} | null

export default function ProfileForm({ 
  profile, 
  userEmail,
  userRole,
  userStatus
}: { 
  profile: Profile
  userEmail: string
  userRole: string
  userStatus: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [previewImage, setPreviewImage] = useState(profile?.fotoProfil || '')
  
  // Form state
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    position: profile?.position || ''
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      setError('Tipe file tidak valid. Hanya JPEG, PNG, WebP, dan GIF yang diperbolehkan.')
      return
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran file melebihi 2MB.')
      return
    }

    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)

      const response = await fetch('/api/profile/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('Foto berhasil diupload!')
        setPreviewImage(result.url)
        router.refresh()
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError('Terjadi kesalahan saat upload foto.')
    }

    setUploading(false)
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('Profile berhasil diperbarui!')
        router.refresh()
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError('Terjadi kesalahan saat menyimpan profile.')
    }

    setLoading(false)
  }

  const handleDeletePhoto = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus foto profil?')) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/profile/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fotoProfil: null }),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('Foto profil berhasil dihapus!')
        setPreviewImage('')
        router.refresh()
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError('Terjadi kesalahan saat menghapus foto.')
    }

    setLoading(false)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'CEO': return 'bg-purple-100 text-purple-800'
      case 'GENERAL_AFFAIR': return 'bg-blue-100 text-blue-800'
      case 'PM': return 'bg-green-100 text-green-800'
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'KARYAWAN': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'INACTIVE': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-blue-500" />
          Informasi Profile
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-700 text-sm p-3 rounded-md">
              {success}
            </div>
          )}

          {/* Current Role & Status Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-3">Status Akun Saat Ini</h3>
            <div className="flex flex-wrap gap-3">
              <Badge className={`${getRoleColor(userRole)} px-3 py-1 font-medium`}>
                {userRole === 'CEO' && '👑'} 
                {userRole === 'GENERAL_AFFAIR' && '👥'} 
                {userRole === 'PM' && '📊'} 
                {userRole === 'ADMIN' && '⚙️'} 
                {userRole === 'KARYAWAN' && '👨‍💻'} 
                {' '}{userRole}
              </Badge>
              <Badge className={`${getStatusColor(userStatus)} px-3 py-1 font-medium`}>
                {userStatus === 'ACTIVE' && '✅'} 
                {userStatus === 'PENDING' && '⏳'} 
                {userStatus === 'INACTIVE' && '❌'} 
                {' '}{userStatus}
              </Badge>
            </div>
          </div>

          {/* Foto Profil Section */}
          <div className="flex flex-col items-center gap-4 py-6 border-b">
            <div className="relative">
              {previewImage ? (
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
                  <Image
                    src={previewImage}
                    alt="Profile"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-4 border-gray-200 shadow-lg">
                  <span className="text-4xl sm:text-6xl font-bold text-white">
                    {(formData.name || userEmail).charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            {/* Upload Button */}
            <div className="text-center">
              <label htmlFor="fileUpload" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Ganti Foto'}
              </label>
              <input
                id="fileUpload"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <p className="text-xs text-gray-500 mt-2">
                Format: JPEG, PNG, WebP, GIF. Maksimal 2MB.
              </p>
            </div>

            {/* Delete Photo Button */}
            {profile?.fotoProfil && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleDeletePhoto}
                disabled={loading || uploading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Hapus Foto
              </Button>
            )}
          </div>

          {/* Profile Form Fields */}
          <div className="space-y-4">
            {/* Email (Read-only) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input value={userEmail} disabled className="bg-gray-50" />
            </div>

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Masukkan nama lengkap Anda"
                className="w-full"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Nomor Telepon
              </label>
              <Input
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Contoh: +62 812-3456-7890"
                className="w-full"
              />
            </div>

            {/* Position */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Jabatan
              </label>
              <Input
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="Contoh: Senior Frontend Developer"
                className="w-full"
              />
            </div>
          </div>

          {/* Save Button */}
          <Button 
            onClick={handleSaveProfile}
            disabled={loading || uploading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {loading ? 'Menyimpan...' : 'Simpan Profile'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
