'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, UserCheck, UserX } from 'lucide-react'

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

interface UserActionModalProps {
  open: boolean
  user: UserData | null
  action: 'activate' | 'deactivate' | null
  onClose: () => void
  onConfirm: (userId: string, action: 'activate' | 'deactivate') => void
}

export default function UserActionModal({ 
  open, 
  user, 
  action,
  onClose, 
  onConfirm 
}: UserActionModalProps) {
  const [loading, setLoading] = useState(false)

  if (!open || !user || !action) return null

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm(user.id, action)
    } finally {
      setLoading(false)
    }
  }

  const isActivate = action === 'activate'
  const actionText = isActivate ? 'mengaktifkan' : 'menonaktifkan'
  const actionTextCap = isActivate ? 'Aktifkan' : 'Nonaktifkan'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold flex items-center gap-2 ${
              isActivate ? 'text-green-900' : 'text-orange-900'
            }`}>
              {isActivate ? (
                <UserCheck className="w-5 h-5 text-green-600" />
              ) : (
                <UserX className="w-5 h-5 text-orange-600" />
              )}
              {actionTextCap} User
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

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              Apakah Anda yakin ingin {actionText} user berikut?
            </p>
            
            <div className={`p-4 rounded-lg border ${
              isActivate ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
            }`}>
              <p className="font-medium text-gray-900">
                {user.profile?.name || user.email.split('@')[0]}
              </p>
              <p className="text-sm text-gray-600">{user.email}</p>
              <p className="text-sm text-gray-600">Role: {user.role}</p>
              <p className="text-sm text-gray-600">
                Status saat ini: {user.status === 'ACTIVE' ? 'Aktif' : 'Non-Aktif'}
              </p>
            </div>

            <p className={`text-sm mt-3 ${
              isActivate ? 'text-green-700' : 'text-orange-700'
            }`}>
              {isActivate 
                ? 'User akan dapat login dan mengakses sistem setelah diaktifkan.'
                : 'User tidak akan dapat login setelah dinonaktifkan, namun data tetap tersimpan.'
              }
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
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
              onClick={handleConfirm}
              className={`flex-1 ${
                isActivate 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-orange-600 hover:bg-orange-700'
              } text-white`}
              disabled={loading}
            >
              {loading ? `${actionTextCap.slice(0, -2)}ing...` : actionTextCap}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}