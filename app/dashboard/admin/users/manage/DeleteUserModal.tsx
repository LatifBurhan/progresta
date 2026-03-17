'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Trash2, AlertTriangle } from 'lucide-react'

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

interface DeleteUserModalProps {
  open: boolean
  user: UserData | null
  onClose: () => void
  onSuccess: (userId: string) => void
}

export default function DeleteUserModal({ 
  open, 
  user, 
  onClose, 
  onSuccess 
}: DeleteUserModalProps) {
  const [loading, setLoading] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [error, setError] = useState('')

  if (!open || !user) return null

  const handleDelete = async () => {
    if (confirmText !== 'HAPUS') {
      setError('Ketik "HAPUS" untuk mengkonfirmasi')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/users/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      const result = await response.json()

      if (result.success) {
        onSuccess(user.id)
        onClose()
        alert('User berhasil dihapus!')
        setConfirmText('')
      } else {
        setError(result.message || 'Gagal menghapus user')
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-red-900 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Hapus User
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
                  Anda akan menghapus user berikut secara permanen:
                </p>
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium text-gray-900">
                    {user.profile?.name || user.email.split('@')[0]}
                  </p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-600">Role: {user.role}</p>
                </div>
                <p className="text-sm text-red-700 mt-3">
                  <strong>Tindakan ini tidak dapat dibatalkan!</strong> Semua data user termasuk profil akan dihapus, namun laporan yang dibuat user akan tetap ada.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

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
            <Button
              onClick={handleDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={loading || confirmText !== 'HAPUS'}
            >
              {loading ? 'Menghapus...' : 'Hapus User'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}