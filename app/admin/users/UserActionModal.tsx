'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle, X } from 'lucide-react'

interface UserData {
  id: string
  email: string
  profile: {
    name: string | null
  } | null
}

interface UserActionModalProps {
  open: boolean
  user: UserData | null
  action: 'activate' | 'deactivate' | 'delete' | null
  onClose: () => void
  onConfirm: (userId: string, action: 'activate' | 'deactivate' | 'delete') => void
}

export default function UserActionModal({ 
  open, 
  user, 
  action, 
  onClose, 
  onConfirm 
}: UserActionModalProps) {
  if (!open || !user || !action) return null

  const getActionInfo = () => {
    switch (action) {
      case 'activate':
        return {
          title: 'Aktifkan User',
          description: 'User akan dapat mengakses sistem dan melakukan pelaporan.',
          buttonText: 'Ya, Aktifkan',
          buttonClass: 'bg-green-600 hover:bg-green-700',
          icon: '✅'
        }
      case 'deactivate':
        return {
          title: 'Nonaktifkan User',
          description: 'User tidak akan dapat mengakses sistem sampai diaktifkan kembali.',
          buttonText: 'Ya, Nonaktifkan',
          buttonClass: 'bg-orange-600 hover:bg-orange-700',
          icon: '⏸️'
        }
      case 'delete':
        return {
          title: 'Hapus User',
          description: 'User dan semua data terkait akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.',
          buttonText: 'Ya, Hapus',
          buttonClass: 'bg-red-600 hover:bg-red-700',
          icon: '🗑️'
        }
      default:
        return {
          title: '',
          description: '',
          buttonText: '',
          buttonClass: '',
          icon: ''
        }
    }
  }

  const actionInfo = getActionInfo()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            {actionInfo.title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">{actionInfo.icon}</div>
          <p className="text-gray-600 mb-4">
            Apakah Anda yakin ingin {action === 'activate' ? 'mengaktifkan' : action === 'deactivate' ? 'menonaktifkan' : 'menghapus'} user:
          </p>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="font-medium text-gray-900">
              {user.profile?.name || user.email.split('@')[0]}
            </p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            {actionInfo.description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Batal
          </Button>
          <Button
            onClick={() => onConfirm(user.id, action)}
            className={`flex-1 ${actionInfo.buttonClass}`}
          >
            {actionInfo.buttonText}
          </Button>
        </div>
      </div>
    </div>
  )
}