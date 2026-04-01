'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'
import Link from 'next/link'
import { 
  User, Phone, Briefcase, Search, 
  Building, Edit, Trash2, UserCheck, 
  UserX, Plus, ArrowLeft, CheckCircle2, 
  XCircle
} from 'lucide-react'
import EditUserModal from './EditUserModal'
import DeleteUserModal from './DeleteUserModal'
import UserActionModal from './UserActionModal'

interface UserProfile {
  name?: string
  position?: string
  phone?: string
  fotoProfil?: string
}

interface Division {
  id: string
  name: string
  color: string | null
  department_id?: string
}

interface UserData {
  id: string
  email: string
  role: string
  status: string
  createdAt: string
  divisionId: string | null
  employee_status?: string
  address?: string
  notes?: string
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
  todayReports?: number
  todayProgress?: number
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
  const [roleFilter, setRoleFilter] = useState<'all' | 'STAFF' | 'PM' | 'GENERAL_AFFAIR' | 'CEO' | 'ADMIN'>('all')
  
  const [editModal, setEditModal] = useState<{ open: boolean; user: UserData | null }>({ open: false, user: null })
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; user: UserData | null }>({ open: false, user: null })
  const [actionModal, setActionModal] = useState<{ open: boolean; user: UserData | null; action: 'activate' | 'deactivate' | null }>({ open: false, user: null, action: null })

  const handleEditSuccess = (updatedUser: UserData) => {
    console.log('handleEditSuccess - Updated user from API:', updatedUser); // Debug
    
    setAllUsers(prev => prev.map(u => {
      if (u.id === updatedUser.id) {
        // Merge updated data with existing data to preserve fields like todayReports
        const merged: UserData = {
          ...u, // Keep existing fields like todayReports, todayProgress
          ...updatedUser, // Override with updated fields
          profile: {
            name: updatedUser.profile?.name || u.profile?.name || null,
            fotoProfil: updatedUser.profile?.fotoProfil || u.profile?.fotoProfil || null,
            phone: updatedUser.profile?.phone || u.profile?.phone || null,
            position: updatedUser.profile?.position || u.profile?.position || null
          }
        };
        return merged;
      }
      return u;
    }));
    
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
      
      const data = await response.json()
      
      if (response.ok && data.success) {
        // Update user status in local state
        setAllUsers(prev => prev.map(u => 
          u.id === userId 
            ? { ...u, status: action === 'activate' ? 'ACTIVE' : 'INACTIVE' } 
            : u
        ))
        setActionModal({ open: false, user: null, action: null })
        
        // Show success message
        alert(`User berhasil ${action === 'activate' ? 'diaktifkan' : 'dinonaktifkan'}!`)
      } else {
        // Show error message
        alert(`Gagal ${action === 'activate' ? 'mengaktifkan' : 'menonaktifkan'} user: ${data.message || 'Unknown error'}`)
        console.error('User action failed:', data)
      }
    } catch (error) {
      console.error('User action error:', error)
      alert(`Terjadi kesalahan saat ${action === 'activate' ? 'mengaktifkan' : 'menonaktifkan'} user`)
    }
  }

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.profile?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.profile?.position?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' && user.status === 'ACTIVE') || (statusFilter === 'inactive' && user.status === 'INACTIVE')
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesStatus && matchesRole
  })

  const getRoleBadge = (role: string) => {
    const config: any = {
      'CEO': { label: 'CEO', icon: '👑', color: 'bg-purple-50 text-purple-700 border-purple-100' },
      'GENERAL_AFFAIR': { label: 'General Affair', icon: '👥', color: 'bg-blue-50 text-blue-700 border-blue-100' },
      'PM': { label: 'Manager', icon: '📊', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
      'ADMIN': { label: 'Admin', icon: '⚙️', color: 'bg-rose-50 text-rose-700 border-rose-100' },
      'STAFF': { label: 'Staff', icon: '👨‍💻', color: 'bg-slate-50 text-slate-600 border-slate-200' }
    }
    return config[role] || { label: role, icon: '👤', color: 'bg-gray-50 text-gray-600 border-gray-200' }
  }

  const canEditUser = (user: UserData) => {
    // ADMIN can edit anyone
    if (currentUserRole === 'ADMIN') return true
    // GENERAL_AFFAIR and CEO can edit anyone except ADMIN
    if (['GENERAL_AFFAIR', 'CEO'].includes(currentUserRole) && user.role !== 'ADMIN') return true
    return false
  }

  const canDeleteUser = (user: UserData) => {
    // ADMIN and GENERAL_AFFAIR can delete users
    if (['ADMIN', 'GENERAL_AFFAIR'].includes(currentUserRole)) return true
    return false
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/admin/overview">
              <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border border-slate-200 hover:bg-slate-50">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Button>
            </Link>
            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Manajemen Personel</h1>
          </div>
          <p className="text-base font-medium text-slate-500 max-w-2xl leading-relaxed">
            Otoritas data karyawan, pengaturan hak akses, dan monitoring status keaktifan tim Al-Wustho.
          </p>
        </div>
        
        <Link href="/dashboard/admin/users/create">
          <Button className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xl shadow-blue-200 gap-3 active:scale-95 transition-all">
            <Plus className="w-6 h-6" />
            <span className="text-base">Daftarkan Karyawan</span>
          </Button>
        </Link>
      </div>

      {/* 2. Advanced Control Bar */}
      <div className="flex flex-col lg:flex-row gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
          <Input
            placeholder="Cari nama, email, atau jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 rounded-2xl border-none bg-slate-50 focus:ring-4 focus:ring-blue-50 transition-all text-base font-medium"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center bg-slate-50 p-2 rounded-2xl">
          {/* Status Segmented Control */}
          <div className="flex bg-white rounded-xl p-1 shadow-sm border border-slate-100">
            {(['all', 'active', 'inactive'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-tight transition-all ${
                  statusFilter === s ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {s === 'all' ? 'Semua' : s === 'active' ? 'Aktif' : 'Non-Aktif'}
              </button>
            ))}
          </div>

          {/* Role Filter Custom Select */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="h-11 bg-white border border-slate-100 text-sm font-bold text-slate-600 rounded-xl px-4 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer shadow-sm"
          >
            <option value="all">Semua Otoritas</option>
            <option value="STAFF">Staff</option>
            <option value="PM">Project Manager</option>
            <option value="GENERAL_AFFAIR">General Affair</option>
            <option value="CEO">CEO</option>
            <option value="ADMIN">Super Admin</option>
          </select>
        </div>
      </div>

      {/* 3. Modern List Layout */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50 text-slate-400 font-black text-[11px] uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Informasi Personel</th>
                <th className="px-8 py-6">Otoritas & Penempatan</th>
                <th className="px-8 py-6">Progres Harian</th>
                <th className="px-8 py-6 text-right">Manajemen Akun</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <User className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Personel Tidak Ditemukan</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleBadge = getRoleBadge(user.role);
                  return (
                    <tr key={user.id} className="group hover:bg-slate-50/30 transition-colors">
                      {/* Avatar & Identitas */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="relative shrink-0">
                            {user.profile?.fotoProfil ? (
                              <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                                <Image src={user.profile.fotoProfil} alt="profile" fill className="object-cover" unoptimized />
                              </div>
                            ) : (
                              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xl font-black shadow-lg">
                                {(user.profile?.name || user.email).charAt(0).toUpperCase()}
                              </div>
                            )}
                            {/* Status Badge with Icon */}
                            {user.status === 'ACTIVE' ? (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white shadow-md flex items-center justify-center">
                                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                              </div>
                            ) : (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rose-500 border-2 border-white shadow-md flex items-center justify-center">
                                <XCircle className="w-3.5 h-3.5 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-blue-600 transition-colors truncate">
                                {user.profile?.name || user.email.split('@')[0]}
                              </h3>
                              {/* Status Text Badge */}
                              {user.status === 'ACTIVE' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Aktif
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-bold uppercase tracking-wider border border-rose-100">
                                  <XCircle className="w-3 h-3" />
                                  Non-Aktif
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-slate-400 truncate">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role & Divisi */}
                      <td className="px-8 py-6">
                        <div className="space-y-2">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider ${roleBadge.color}`}>
                            <span>{roleBadge.icon}</span>
                            {roleBadge.label}
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold">
                            <Building className="w-4 h-4 text-slate-300" />
                            {user.division?.name || 'Lembaga Umum'}
                          </div>
                        </div>
                      </td>

                      {/* Progres Harian */}
                      <td className="px-8 py-6">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-700">
                              {user.todayReports || 0}/3 Laporan
                            </span>
                            <span className="text-xs font-bold text-slate-400">
                              {user.todayProgress || 0}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div
                              className={`h-2.5 rounded-full transition-all duration-500 ${
                                (user.todayProgress || 0) === 100
                                  ? 'bg-emerald-500'
                                  : (user.todayProgress || 0) >= 66
                                  ? 'bg-blue-500'
                                  : (user.todayProgress || 0) >= 33
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${user.todayProgress || 0}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {canEditUser(user) && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setEditModal({ open: true, user })}
                              className="h-11 w-11 rounded-xl border-slate-100 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                              title="Edit User"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setActionModal({ open: true, user, action: user.status === 'ACTIVE' ? 'deactivate' : 'activate' })}
                            className={`h-11 w-11 rounded-xl border-slate-100 transition-all ${
                              user.status === 'ACTIVE' ? "text-amber-500 hover:bg-amber-50" : "text-emerald-500 hover:bg-emerald-50"
                            }`}
                            title={user.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan'}
                          >
                            {user.status === 'ACTIVE' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </Button>

                          {canDeleteUser(user) && (
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setDeleteModal({ open: true, user })}
                              className="h-11 w-11 rounded-xl border-slate-100 text-rose-500 hover:bg-rose-50"
                              title="Hapus User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals Container */}
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