'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Briefcase,
  Search,
  Filter,
  MoreVertical,
  Shield,
  Building
} from 'lucide-react'
import ApprovalModal from './ApprovalModal'
import UserActionModal from './UserActionModal'

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

interface UserManagementProps {
  pendingUsers: UserData[]
  allUsers: UserData[]
  divisions: Division[]
  currentUserRole: string
}

export default function UserManagement({ 
  pendingUsers: initialPendingUsers, 
  allUsers: initialAllUsers, 
  divisions,
  currentUserRole 
}: UserManagementProps) {
  const [pendingUsers, setPendingUsers] = useState(initialPendingUsers)
  const [allUsers, setAllUsers] = useState(initialAllUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [approvalModal, setApprovalModal] = useState<{
    open: boolean
    user: UserData | null
  }>({ open: false, user: null })
  const [actionModal, setActionModal] = useState<{
    open: boolean
    user: UserData | null
    action: 'activate' | 'deactivate' | 'delete' | null
  }>({ open: false, user: null, action: null })

  const handleApproval = async (userId: string, role: string, divisionId: string) => {
    try {
      const response = await fetch('/api/admin/users/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role, divisionId })
      })

      const result = await response.json()
      
      if (result.success) {
        // Remove from pending users
        setPendingUsers(prev => prev.filter(u => u.id !== userId))
        
        // Add to all users with updated data
        const updatedUser = pendingUsers.find(u => u.id === userId)
        if (updatedUser) {
          const division = divisions.find(d => d.id === divisionId)
          setAllUsers(prev => [{
            ...updatedUser,
            role,
            status: 'ACTIVE',
            divisionId,
            division
          }, ...prev])
        }
        
        setApprovalModal({ open: false, user: null })
        alert('User berhasil disetujui!')
      } else {
        alert(result.message || 'Gagal menyetujui user')
      }
    } catch (error) {
      console.error('Approval error:', error)
      alert('Terjadi kesalahan saat menyetujui user')
    }
  }

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate' | 'delete') => {
    try {
      const response = await fetch('/api/admin/users/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action })
      })

      const result = await response.json()
      
      if (result.success) {
        if (action === 'delete') {
          setAllUsers(prev => prev.filter(u => u.id !== userId))
        } else {
          setAllUsers(prev => prev.map(u => 
            u.id === userId 
              ? { ...u, status: action === 'activate' ? 'ACTIVE' : 'INACTIVE' }
              : u
          ))
        }
        
        setActionModal({ open: false, user: null, action: null })
        alert(`User berhasil ${action === 'activate' ? 'diaktifkan' : action === 'deactivate' ? 'dinonaktifkan' : 'dihapus'}!`)
      } else {
        alert(result.message || `Gagal ${action} user`)
      }
    } catch (error) {
      console.error('User action error:', error)
      alert(`Terjadi kesalahan saat ${action} user`)
    }
  }

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.profile?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         false
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.status === 'ACTIVE') ||
                         (statusFilter === 'inactive' && user.status === 'INACTIVE')
    
    return matchesSearch && matchesStatus
  })

  const getRoleBadge = (role: string) => {
    const badges = {
      'CEO': { label: '👑 CEO', color: 'bg-purple-100 text-purple-800' },
      'HRD': { label: '👥 HRD', color: 'bg-blue-100 text-blue-800' },
      'PM': { label: '📊 PM', color: 'bg-green-100 text-green-800' },
      'ADMIN': { label: '⚙️ Admin', color: 'bg-red-100 text-red-800' },
      'KARYAWAN': { label: '👨‍💻 Karyawan', color: 'bg-gray-100 text-gray-800' }
    }
    return badges[role as keyof typeof badges] || { label: role, color: 'bg-gray-100 text-gray-800' }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      'ACTIVE': { label: '✅ Aktif', color: 'bg-green-100 text-green-800' },
      'INACTIVE': { label: '❌ Non-Aktif', color: 'bg-red-100 text-red-800' },
      'PENDING': { label: '⏳ Pending', color: 'bg-yellow-100 text-yellow-800' }
    }
    return badges[status as keyof typeof badges] || { label: status, color: 'bg-gray-100 text-gray-800' }
  }

  return (
    <div className="space-y-6">
      {/* Pending Approvals */}
      {pendingUsers.length > 0 ? (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <Clock className="w-5 h-5" />
              Menunggu Approval ({pendingUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pendingUsers.map((user) => (
                <Card key={user.id} className="bg-white border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      {user.profile?.fotoProfil ? (
                        <div className="relative w-12 h-12 rounded-full overflow-hidden">
                          <Image
                            src={user.profile.fotoProfil}
                            alt={user.profile.name || user.email}
                            fill
                            className="object-cover"
                            sizes="48px"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                          <span className="text-lg font-bold text-white">
                            {(user.profile?.name || user.email).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {user.profile?.name || user.email.split('@')[0]}
                        </h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    
                    {user.profile?.phone && (
                      <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {user.profile.phone}
                      </p>
                    )}
                    
                    {user.profile?.position && (
                      <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {user.profile.position}
                      </p>
                    )}
                    
                    <Button
                      onClick={() => setApprovalModal({ open: true, user })}
                      className="w-full bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Setujui
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-lg font-medium text-green-800 mb-2">
              Tidak Ada User Pending
            </h3>
            <p className="text-green-700 text-sm">
              Semua user baru telah disetujui. Bagus!
            </p>
          </CardContent>
        </Card>
      )}

      {/* All Users Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Semua User ({allUsers.length})
          </CardTitle>
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari nama atau email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                Semua
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('active')}
              >
                Aktif
              </Button>
              <Button
                variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('inactive')}
              >
                Non-Aktif
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => {
              const roleBadge = getRoleBadge(user.role)
              const statusBadge = getStatusBadge(user.status)
              
              return (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    {user.profile?.fotoProfil ? (
                      <div className="relative w-12 h-12 rounded-full overflow-hidden">
                        <Image
                          src={user.profile.fotoProfil}
                          alt={user.profile.name || user.email}
                          fill
                          className="object-cover"
                          sizes="48px"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <span className="text-lg font-bold text-white">
                          {(user.profile?.name || user.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">
                          {user.profile?.name || user.email.split('@')[0]}
                        </h3>
                        <Badge className={`text-xs ${roleBadge.color}`}>
                          {roleBadge.label}
                        </Badge>
                        <Badge className={`text-xs ${statusBadge.color}`}>
                          {statusBadge.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </span>
                        
                        {user.division && (
                          <span className="flex items-center gap-1">
                            <Building className="w-3 h-3" />
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                              style={{ 
                                borderColor: user.division.color || '#6B7280',
                                color: user.division.color || '#6B7280'
                              }}
                            >
                              {user.division.name}
                            </Badge>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {user.status === 'ACTIVE' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActionModal({ 
                          open: true, 
                          user, 
                          action: 'deactivate' 
                        })}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        Nonaktifkan
                      </Button>
                    )}
                    
                    {user.status === 'INACTIVE' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActionModal({ 
                          open: true, 
                          user, 
                          action: 'activate' 
                        })}
                        className="text-green-600 hover:text-green-700"
                      >
                        Aktifkan
                      </Button>
                    )}
                    
                    {currentUserRole === 'ADMIN' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActionModal({ 
                          open: true, 
                          user, 
                          action: 'delete' 
                        })}
                        className="text-red-600 hover:text-red-700"
                      >
                        Hapus
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Tidak ada user yang ditemukan</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Approval Modal */}
      <ApprovalModal
        open={approvalModal.open}
        user={approvalModal.user}
        divisions={divisions}
        onClose={() => setApprovalModal({ open: false, user: null })}
        onApprove={handleApproval}
      />

      {/* User Action Modal */}
      <UserActionModal
        open={actionModal.open}
        user={actionModal.user}
        action={actionModal.action}
        onClose={() => setActionModal({ open: false, user: null, action: null })}
        onConfirm={handleUserAction}
      />
    </div>
  )
}