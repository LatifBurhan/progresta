'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Edit, Eye, EyeOff } from 'lucide-react'

interface UserData {
  id: string
  email: string
  role: string
  status: string
  createdAt: string
  divisionId: string | null
  profile: {
    name: string | null
    fotoProfil: string | null
    phone: string | null
    position: string | null
  } | null
  division?: {
    name: string
    color: string | null
  } | null
}

interface Division {
  id: string
  name: string
  color: string | null
}

interface EditUserModalProps {
  open: boolean
  user: UserData | null
  divisions: Division[]
  onClose: () => void
  onSuccess: (updatedUser: UserData) => void
}

export default function EditUserModal({ 
  open, 
  user, 
  divisions, 
  onClose, 
  onSuccess 
}: EditUserModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    position: '',
    role: 'KARYAWAN',
    divisionId: '',
    password: '',
    changePassword: false
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        name: user.profile?.name || '',
        phone: user.profile?.phone || '',
        position: user.profile?.position || '',
        role: user.role,
        divisionId: user.divisionId || '',
        password: '',
        changePassword: false
      })
    }
  }, [user])

  if (!open || !user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.name || !formData.divisionId) {
      setError('Email, nama, dan divisi wajib diisi')
      return
    }

    if (formData.changePassword && formData.password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }

    setLoading(true)
    setError('')

    try {
      const updateData: any = {
        userId: user.id,
        email: formData.email,
        name: formData.name,
        phone: formData.phone || null,
        position: formData.position || null,
        role: formData.role,
        divisionId: formData.divisionId
      }

      if (formData.changePassword && formData.password) {
        updateData.password = formData.password
      }

      const response = await fetch('/api/admin/users/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      const result = await response.json()

      if (result.success) {
        onSuccess(result.user)
        onClose()
        alert('User berhasil diupdate!')
      } else {
        setError(result.message || 'Gagal mengupdate user')
      }
    } catch (error) {
      setError('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    { value: 'KARYAWAN', label: '👨‍💻 Karyawan', description: 'Akses standar untuk pelaporan' },
    { value: 'PM', label: '📊 Project Manager', description: 'Monitoring project dan tim' },
    { value: 'HRD', label: '👥 HRD', description: 'Manajemen karyawan dan approval' },
    { value: 'CEO', label: '👑 CEO', description: 'Akses penuh ke semua data' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Edit User: {user.profile?.name || user.email}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Email */}
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="user@company.com"
                  required
                />
              </div>

              {/* Name */}
              <div>
                <Label htmlFor="name">Nama Lengkap *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nama lengkap karyawan"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone */}
              <div>
                <Label htmlFor="phone">No. Telepon</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              {/* Position */}
              <div>
                <Label htmlFor="position">Posisi/Jabatan</Label>
                <Input
                  id="position"
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="Frontend Developer, Marketing, dll"
                />
              </div>
            </div>

            {/* Password Change */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="changePassword"
                  checked={formData.changePassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, changePassword: e.target.checked, password: '' }))}
                />
                <Label htmlFor="changePassword" className="text-sm font-medium">
                  Ubah Password
                </Label>
              </div>
              
              {formData.changePassword && (
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Password baru (minimal 6 karakter)"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <Label>Role *</Label>
              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                {roles.map((role) => (
                  <label
                    key={role.value}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.role === role.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium text-sm">{role.label}</div>
                      <div className="text-xs text-gray-500">{role.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Division Selection */}
            <div>
              <Label htmlFor="division">Divisi *</Label>
              <select
                id="division"
                value={formData.divisionId}
                onChange={(e) => setFormData(prev => ({ ...prev, divisionId: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Pilih Divisi</option>
                {divisions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}