'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Edit } from 'lucide-react'

interface Division {
  id: string
  name: string
  description: string | null
  color: string | null
  createdAt: string
  updatedAt: string
  isActive: boolean
  userCount: number
  projectCount: number
}

interface EditDivisionModalProps {
  open: boolean
  division: Division | null
  onClose: () => void
  onSuccess: (updatedDivision: Division) => void
}

export default function EditDivisionModal({ 
  open, 
  division,
  onClose, 
  onSuccess 
}: EditDivisionModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (division) {
      setFormData({
        name: division.name,
        description: division.description || '',
        color: division.color || '#3B82F6'
      })
    }
  }, [division])

  if (!open || !division) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('Nama divisi wajib diisi')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/divisions/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          divisionId: division.id,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          color: formData.color
        })
      })

      const result = await response.json()

      if (result.success) {
        onSuccess(result.division)
        handleClose()
        alert('Divisi berhasil diupdate!')
      } else {
        setError(result.message || 'Gagal mengupdate divisi')
      }
    } catch (error) {
      setError('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setError('')
    onClose()
  }

  const colorOptions = [
    { name: 'Biru', value: '#3B82F6' },
    { name: 'Hijau', value: '#10B981' },
    { name: 'Ungu', value: '#8B5CF6' },
    { name: 'Merah', value: '#EF4444' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Gray', value: '#6B7280' },
    { name: 'Emerald', value: '#059669' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Edit Divisi: {division.name}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
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

          {/* Division Info */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <span>👥 {division.userCount} Karyawan</span>
              <span>•</span>
              <span>📁 {division.projectCount} Project</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <Label htmlFor="name">Nama Divisi *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Contoh: IT Development, Marketing, HR"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Deskripsi singkat tentang divisi ini..."
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            {/* Color */}
            <div>
              <Label>Warna Divisi</Label>
              <div className="mt-2 grid grid-cols-5 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      formData.color === color.value 
                        ? 'border-gray-800 scale-110' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Warna akan digunakan untuk identifikasi visual divisi
              </p>
            </div>

            {/* Preview */}
            <div className="border rounded-lg p-3 bg-gray-50">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Preview:</Label>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: formData.color }}
                >
                  {formData.name.charAt(0).toUpperCase() || 'D'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {formData.name || 'Nama Divisi'}
                  </p>
                  {formData.description && (
                    <p className="text-sm text-gray-600 line-clamp-1">
                      {formData.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
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