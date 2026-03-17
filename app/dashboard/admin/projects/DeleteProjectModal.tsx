'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Trash2, AlertTriangle, FileText } from 'lucide-react'

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

interface DeleteProjectModalProps {
  open: boolean
  project: Project | null
  onClose: () => void
  onSuccess: (projectId: string) => void
}

export default function DeleteProjectModal({ 
  open, 
  project, 
  onClose, 
  onSuccess 
}: DeleteProjectModalProps) {
  const [loading, setLoading] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [error, setError] = useState('')

  if (!open || !project) return null

  const canDelete = project.reportCount === 0

  const handleDelete = async () => {
    if (!canDelete) {
      setError('Project tidak dapat dihapus karena masih memiliki laporan')
      return
    }

    if (confirmText !== 'HAPUS') {
      setError('Ketik "HAPUS" untuk mengkonfirmasi')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/projects/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id })
      })

      const result = await response.json()

      if (result.success) {
        onSuccess(project.id)
        handleClose()
        alert('Project berhasil dihapus!')
      } else {
        setError(result.message || 'Gagal menghapus project')
      }
    } catch (error) {
      setError('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setConfirmText('')
    setError('')
    onClose()
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-red-900 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Hapus Project
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

          {/* Warning */}
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-900 mb-2">Peringatan!</h4>
                <p className="text-sm text-red-700 mb-3">
                  Anda akan menghapus project berikut secara permanen:
                </p>
                <div className="bg-white p-3 rounded border">
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: project.division.color || '#3B82F6' }}
                    >
                      {project.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{project.name}</p>
                      <p className="text-sm text-gray-600">{project.division.name}</p>
                      {project.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{project.description}</p>
                      )}
                      <div className="mt-2 text-sm text-gray-600">
                        <div>Mulai: {formatDate(project.startDate)}</div>
                        <div>Selesai: {formatDate(project.endDate)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>{project.reportCount} Laporan Terkait</span>
                  </div>
                </div>
                
                {!canDelete ? (
                  <div className="mt-3 p-2 bg-amber-100 border border-amber-300 rounded">
                    <p className="text-sm text-amber-800">
                      <strong>Tidak dapat dihapus!</strong> Project ini masih memiliki {project.reportCount} laporan. 
                      Hapus semua laporan terkait terlebih dahulu atau hubungi administrator.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-red-700 mt-3">
                    <strong>Tindakan ini tidak dapat dibatalkan!</strong> Semua data project akan dihapus permanen.
                  </p>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {canDelete && (
            <>
              {/* Confirmation Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ketik <span className="font-bold text-red-600">"HAPUS"</span> untuk mengkonfirmasi:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Ketik HAPUS"
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={loading}
            >
              Batal
            </Button>
            {canDelete ? (
              <Button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={loading || confirmText !== 'HAPUS'}
              >
                {loading ? 'Menghapus...' : 'Hapus Project'}
              </Button>
            ) : (
              <Button
                disabled
                className="flex-1 bg-gray-400 text-white cursor-not-allowed"
              >
                Tidak Dapat Dihapus
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}