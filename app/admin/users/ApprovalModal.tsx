'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { CheckCircle, X } from 'lucide-react'

interface UserData {
  id: string
  email: string
  role: string
  status: string
  createdAt: string
  profile: {
    name: string | null
    fotoProfil: string | null
    phone: string | null
    position: string | null
  } | null
}

interface Division {
  id: string
  name: string
  color: string
}

interface ApprovalModalProps {
  open: boolean
  user: UserData | null
  divisions: Division[]
  onClose: () => void
  onApprove: (userId: string, role: string, divisionId: string) => void
}

export default function ApprovalModal({ 
  open, 
  user, 
  divisions, 
  onClose, 
  onApprove 
}: ApprovalModalProps) {
  const [selectedRole, setSelectedRole] = useState('KARYAWAN')
  const [selectedDivision, setSelectedDivision] = useState('')
  const [loading, setLoading] = useState(false)

  if (!open || !user) return null

  const handleApprove = async () => {
    if (!selectedDivision) {
      alert('Pilih divisi terlebih dahulu')
      return
    }

    setLoading(true)
    try {
      await onApprove(user.id, selectedRole, selectedDivision)
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
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Setujui User Baru
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            {user.profile?.fotoProfil ? (
              <div className="relative w-16 h-16 rounded-full overflow-hidden">
                <Image
                  src={user.profile.fotoProfil}
                  alt={user.profile.name || user.email}
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <span className="text-xl font-bold text-white">
                  {(user.profile?.name || user.email).charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            
            <div>
              <h4 className="font-medium text-gray-900">
                {user.profile?.name || user.email.split('@')[0]}
              </h4>
              <p className="text-sm text-gray-600">{user.email}</p>
              {user.profile?.position && (
                <p className="text-sm text-gray-500">{user.profile.position}</p>
              )}
            </div>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Pilih Role
            </label>
            <div className="space-y-2">
              {roles.map((role) => (
                <label
                  key={role.value}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedRole === role.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={selectedRole === role.value}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{role.label}</div>
                    <div className="text-sm text-gray-600">{role.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Division Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Pilih Divisi
            </label>
            <div className="grid grid-cols-2 gap-2">
              {divisions.map((division) => (
                <label
                  key={division.id}
                  className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedDivision === division.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="division"
                    value={division.id}
                    checked={selectedDivision === division.id}
                    onChange={(e) => setSelectedDivision(e.target.value)}
                  />
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{
                      borderColor: division.color || '#6B7280',
                      color: division.color || '#6B7280'
                    }}
                  >
                    {division.name}
                  </Badge>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              onClick={handleApprove}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={loading || !selectedDivision}
            >
              {loading ? 'Menyetujui...' : 'Setujui User'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}