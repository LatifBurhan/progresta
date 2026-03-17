'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import Link from 'next/link'
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase,
  Search,
  Filter,
  MoreVertical,
  Shield,
  Building,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Plus,
  ArrowLeft
} from 'lucide-react'
import EditUserModal from './EditUserModal'
import DeleteUserModal from './DeleteUserModal'
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

interface UserManagementClientProps {
  allUsers: UserData[]
  divisions: Division[]
  currentUserRole: string
}

export default function UserManagementClient({ 
  allUsers: initialAllUsers, 
  divisions,
  currentUserRole 
}: UserManagementClientProps) {
  const [allUsers, setAllUsers] = useState(initialAllUsers)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [roleFilter, setRoleFilter] = useState<'all' | 'KARYAWAN' | 'PM' | 'HRD' | 'CEO' | 'ADMIN'>('all')
  const [editModal, setEditModal] = useState<{
    open: boolean
    user: UserData | null
  }>({ open: false, user: null })
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean
    user: UserData | null
  }>({ open: false, user: null })
  const [actionModal, setActionModal] = useState<{
    open: boolean
    user: UserData | null
    action: 'activate' | 'deactivate' | null
  }>({ open: false, user: null, action: null })

  const handleEditSuccess = (updatedUser: UserData) => {
    setAllUsers(prev => prev.map(u => 
      u.id === updatedUser.id ? updatedUser : u
    ))
    setEditModal({ open: false, user: null })
  }

  const handleDeleteSuccess = (userId: string) => {
    setAllUsers(prev => prev.filter(u => u.id !== userId))
    setDeleteModal({ open: false, user: null })
  }

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate') => {
    try {
      const response = await fetch('/api/admin/users/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action })
      })

      const result = await response.json()
      
      if (result.success) {
        setAllUsers(prev => prev.map(u => 
          u.id === userId 
            ? { ...u, status: action === 'activate' ? 'ACTIVE' : 'INACTIVE' }
            : u
        ))
        
        setActionModal({ open: false, user: null, action: null })
        alert(`User berhasil ${action === 'activate' ? 'diaktifkan' : 'dinonaktifkan'}!`)
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
                         user.profile?.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         false
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.status === 'ACTIVE') ||
                         (statusFilter === 'inactive' && user.status === 'INACTIVE')
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    
    return matchesSearch && matchesStatus && matchesRole
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
      'INACTIVE': { label: '❌ Non-Aktif', color: 'bg-red-100 text-red-800' }
    }
    return badges[status as keyof typeof badges] || { label: status, color: 'bg-gray-100 text-gray-800' }
  }

  const canEditUser = (user: UserData) => {
    // ADMIN can edit anyone
    if (currentUserRole === 'ADMIN') return true
    
    // CEO can edit anyone except ADMIN
    if (currentUserRole === 'CEO' && user.role !== 'ADMIN') return true
    
    // HRD can edit KARYAWAN and PM
    if (currentUserRole === 'HRD' && ['KARYAWAN', 'PM'].includes(user.role)) return true
    
    return false
  }

  const canDeleteUser = (user: UserData) => {
    // Only ADMIN can delete users
    return currentUserRole === 'ADMIN'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link href="/admin/users">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Karyawan</h1>
          </div>
          <p className="text-gray-600">
            Kelola data karyawan, edit informasi, dan atur status karyawan
          </p>
        </div>
        <Link href="/dashboard/admin/users/create">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Karyawan
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari nama, email, atau posisi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Status Filter */}
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

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Role</option>
              <option value="KARYAWAN">Karyawan</option>
              <option value="PM">Project Manager</option>
              <option value="HRD">HRD</option>
              <option value="CEO">CEO</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Daftar Karyawan ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada karyawan yang ditemukan</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    {/* User Avatar & Basic Info */}
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

                    {/* Role & Status Badges */}
                    <div className="flex gap-2 mb-3">
                      <Badge className={getRoleBadge(user.role).color}>
                        {getRoleBadge(user.role).label}
                      </Badge>
                      <Badge className={getStatusBadge(user.status).color}>
                        {getStatusBadge(user.status).label}
                      </Badge>
                    </div>

                    {/* Additional Info */}
                    {user.profile?.position && (
                      <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                        <Briefcase className="w-3 h-3" />
                        {user.profile.position}
                      </p>
                    )}
                    
                    {user.profile?.phone && (
                      <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {user.profile.phone}
                      </p>
                    )}

                    {user.division && (
                      <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {user.division.name}
                      </p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t">
                      {canEditUser(user) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditModal({ open: true, user })}
                          className="flex-1"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      )}
                      
                      {user.status === 'ACTIVE' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActionModal({ open: true, user, action: 'deactivate' })}
                          className="text-orange-600 hover:text-orange-700"
                        >
                          <UserX className="w-3 h-3 mr-1" />
                          Nonaktif
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActionModal({ open: true, user, action: 'activate' })}
                          className="text-green-600 hover:text-green-700"
                        >
                          <UserCheck className="w-3 h-3 mr-1" />
                          Aktifkan
                        </Button>
                      )}

                      {canDeleteUser(user) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteModal({ open: true, user })}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <EditUserModal
        open={editModal.open}
        user={editModal.user}
        divisions={divisions}
        onClose={() => setEditModal({ open: false, user: null })}
        onSuccess={handleEditSuccess}
      />

      <DeleteUserModal
        open={deleteModal.open}
        user={deleteModal.user}
        onClose={() => setDeleteModal({ open: false, user: null })}
        onSuccess={handleDeleteSuccess}
      />

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