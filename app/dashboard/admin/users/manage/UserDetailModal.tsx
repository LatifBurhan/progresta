'use client'

import { X, User, Mail, Phone, Briefcase, MapPin, Building, Calendar, FileText, CheckCircle2, XCircle } from 'lucide-react'
import Image from 'next/image'

interface UserData {
  id: string
  email: string
  role: string
  status: string
  createdAt: string
  updatedAt?: string
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

interface UserDetailModalProps {
  open: boolean
  user: UserData | null
  onClose: () => void
}

export default function UserDetailModal({ open, user, onClose }: UserDetailModalProps) {
  if (!open || !user) return null

  const getRoleBadge = (role: string) => {
    const config: any = {
      'CEO': { label: 'CEO', icon: '👑', color: 'bg-purple-50 text-purple-700 border-purple-200' },
      'GENERAL_AFFAIR': { label: 'HRD', icon: '👥', color: 'bg-blue-50 text-blue-700 border-blue-200' },
      'PM': { label: 'Manager', icon: '📊', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      'ADMIN': { label: 'Admin', icon: '⚙️', color: 'bg-rose-50 text-rose-700 border-rose-200' },
      'STAFF': { label: 'Staff', icon: '👨‍💻', color: 'bg-slate-50 text-slate-600 border-slate-200' }
    }
    return config[role] || { label: role, icon: '👤', color: 'bg-gray-50 text-gray-600 border-gray-200' }
  }

  const roleBadge = getRoleBadge(user.role)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-8 duration-300">
        
        {/* Header with Avatar */}
        <div className="relative bg-gradient-to-br from-blue-600 to-indigo-700 p-8 pb-20 rounded-t-[2.5rem]">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-4">
              {user.profile?.fotoProfil ? (
                <div className="relative w-28 h-28 rounded-3xl overflow-hidden border-4 border-white shadow-2xl">
                  <Image src={user.profile.fotoProfil} alt="profile" fill className="object-cover" unoptimized />
                </div>
              ) : (
                <div className="w-28 h-28 rounded-3xl bg-white/20 backdrop-blur-md border-4 border-white flex items-center justify-center text-white text-4xl font-black shadow-2xl">
                  {(user.profile?.name || user.email).charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Status Badge */}
              {user.status === 'ACTIVE' ? (
                <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-emerald-500 border-4 border-white shadow-lg flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span className="text-white text-xs font-bold">Aktif</span>
                </div>
              ) : (
                <div className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-rose-500 border-4 border-white shadow-lg flex items-center gap-1">
                  <XCircle className="w-4 h-4 text-white" />
                  <span className="text-white text-xs font-bold">Non-Aktif</span>
                </div>
              )}
            </div>

            {/* Name & Role */}
            <h2 className="text-3xl font-black text-white mb-2">
              {user.profile?.name || user.email.split('@')[0]}
            </h2>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-black uppercase tracking-wider ${roleBadge.color} bg-white`}>
              <span>{roleBadge.icon}</span>
              {roleBadge.label}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 -mt-12">
          
          {/* Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Email */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-sm font-bold text-slate-900 break-all">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Telepon</p>
                  <p className="text-sm font-bold text-slate-900">{user.profile?.phone || '-'}</p>
                </div>
              </div>
            </div>

            {/* Position */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Jabatan</p>
                  <p className="text-sm font-bold text-slate-900">{user.profile?.position || '-'}</p>
                </div>
              </div>
            </div>

            {/* Division */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <Building className="w-5 h-5 text-amber-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Divisi</p>
                  <p className="text-sm font-bold text-slate-900">{user.division?.name || 'Lembaga Umum'}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Employee Status */}
          {user.employee_status && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status Kepegawaian</p>
                  <p className="text-sm font-bold text-slate-900">{user.employee_status}</p>
                </div>
              </div>
            </div>
          )}

          {/* Address */}
          {user.address && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-rose-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Alamat</p>
                  <p className="text-sm font-bold text-slate-900 leading-relaxed">{user.address}</p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {user.notes && (
            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-amber-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Catatan</p>
                  <p className="text-sm font-bold text-amber-900 leading-relaxed">{user.notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Created Date */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5 text-slate-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Terdaftar Sejak</p>
                <p className="text-sm font-bold text-slate-900">
                  {new Date(user.createdAt).toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Updated Date */}
          {user.updatedAt && (
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5 text-slate-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Terakhir Diupdate</p>
                  <p className="text-sm font-bold text-slate-900">
                    {new Date(user.updatedAt).toLocaleDateString('id-ID', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Today's Activity */}
          {typeof user.todayReports === 'number' && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="text-xs font-black text-blue-600 uppercase tracking-wider mb-4">Aktivitas Hari Ini</h3>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-slate-600">Laporan Dibuat</span>
                <span className="text-2xl font-black text-blue-600">{user.todayReports}</span>
              </div>
              <div className="w-full bg-white rounded-full h-3 overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${user.todayProgress || 0}%` }}
                />
              </div>
              <p className="text-xs font-bold text-slate-500 mt-2">Progress: {user.todayProgress || 0}%</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm uppercase tracking-wider transition-all active:scale-95"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  )
}
