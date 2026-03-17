'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Edit, Calendar, Clock, FileText } from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
  startDate: string | null
  endDate: string | null
  isActive: boolean
  divisionId: string
  division: {
    name: string
    color: string | null
  }
  reportCount: number
}

interface Division {
  id: string
  name: string
  description: string | null
  color: string | null
  isActive: boolean
}

interface EditProjectModalProps {
  open: boolean
  project: Project | null
  divisions: Division[]
  onClose: () => void
  onSuccess: (updatedProject: Project) => void
}

export default function EditProjectModal({ 
  open, 
  project,
  divisions,
  onClose, 
  onSuccess 
}: EditProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    divisionId: '',
    startDate: '',
    endDate: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        divisionId: project.divisionId,
        startDate: project.startDate ? project.startDate.split('T')[0] : '',
        endDate: project.endDate ? project.endDate.split('T')[0] : ''
      })
    }
  }, [project])

  if (!open || !project) return null

  const calculateDuration = () => {
    if (!formData.startDate || !formData.endDate) return null
    
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)
    
    if (end <= start) return null
    
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      setError('Nama project wajib diisi')
      return
    }

    if (!formData.divisionId) {
      setError('Divisi wajib dipilih')
      return
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      
      if (end <= start) {
        setError('Tanggal selesai harus setelah tanggal mulai')
        return
      }
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/projects/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          divisionId: formData.divisionId,
          startDate: formData.startDate || null,
          endDate: formData.endDate || null
        })
      })

      const result = await response.json()

      if (result.success) {
        onSuccess(result.project)
        handleClose()
        alert('Project berhasil diupdate!')
      } else {
        setError(result.message || 'Gagal mengupdate project')
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

  const duration = calculateDuration()
  const selectedDivision = divisions.find(d => d.id === formData.divisionId)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Edit Project: {project.name}
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

          {/* Project Info */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-700 mb-2">
              <FileText className="w-4 h-4" />
              <span>{project.reportCount} Laporan Terkait</span>
            </div>
            <p className="text-xs text-blue-600">
              Project ini sudah memiliki laporan. Perubahan timeline dapat mempengaruhi laporan yang ada.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div>
              <Label htmlFor="name">Nama Project *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Contoh: Website Company Profile, Mobile App Development"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Deskripsi Project</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Deskripsi detail tentang project ini..."
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            {/* Division */}
            <div>
              <Label htmlFor="division">Divisi Penanggung Jawab *</Label>
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

            {/* Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <Label htmlFor="startDate">Tanggal Mulai</Label>
                <div className="relative">
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="pl-10"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>

              {/* End Date */}
              <div>
                <Label htmlFor="endDate">Tanggal Selesai</Label>
                <div className="relative">
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="pl-10"
                    min={formData.startDate || undefined}
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Duration Display */}
            {duration && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center gap-2 text-blue-700">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">Durasi Pengerjaan: {duration} hari</span>
                </div>
              </div>
            )}

            {/* Preview */}
            {formData.name && selectedDivision && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <Label className="text-sm font-medium text-gray-700 mb-3 block">Preview Project:</Label>
                <div className="flex items-start gap-3">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: selectedDivision.color || '#3B82F6' }}
                  >
                    {formData.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{formData.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{selectedDivision.name}</p>
                    {formData.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {formData.description}
                      </p>
                    )}
                    {formData.startDate && formData.endDate && (
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(formData.startDate).toLocaleDateString('id-ID')} - {new Date(formData.endDate).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        {duration && (
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3" />
                            <span className="font-medium text-blue-600">{duration} hari</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

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