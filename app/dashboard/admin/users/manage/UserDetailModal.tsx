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
      'CEO': { label: 'CEO', icon: '👑', color: 'bg-purple-100 text-purple-700' },
      'GENERAL_AFFAIR': { label: 'HRD', icon: '👥', color: 'bg-blue-100 text-blue-700' },
      'PM': { label: 'Manager', icon: '📊', color: 'bg-emerald-100 text-emerald-700' },
      'ADMIN': { label: 'Admin', icon: '⚙️', color: 'bg-rose-100 text-rose-700' },
      'STAFF': { label: 'Staff', icon: '👨‍💻', color: 'bg-slate-100 text-slate-700' }
    }
    return config[role] || { label: role, icon: '👤', color: 'bg-gray-100 text-gray-700' }
  }

  const roleBadge = getRoleBadge(user.role)

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose} // Menutup modal saat klik area luar
    >
      <div 
        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto relative animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()} // Mencegah modal tertutup saat area dalam diklik
      >
        
        {/* Close Button (Floating) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 flex items-center justify-center text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cover / Header Area */}
        <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900 w-full" />

        {/* Profile Section (Overlap) */}
        <div className="px-8 pb-6 -mt-16 flex flex-col items-center text-center border-b border-slate-100">
          <div className="relative mb-4">
            {/* Foto Profil (Lebih Besar: w-36 h-36) */}
            {user.profile?.fotoProfil ? (
              <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white">
                <Image src={user.profile.fotoProfil} alt="profile" fill className="object-cover" unoptimized />
              </div>
            ) : (
              <div className="w-36 h-36 rounded-full bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center text-slate-400 text-5xl font-bold">
                {(user.profile?.name || user.email).charAt(0).toUpperCase()}
              </div>
            )}
            
            {/* Status Dot */}
            {user.status === 'ACTIVE' ? (
              <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-emerald-500 border-4 border-white shadow-sm flex items-center justify-center" title="Aktif">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>
            ) : (
              <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-rose-500 border-4 border-white shadow-sm flex items-center justify-center" title="Non-Aktif" />
            )}
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
            {user.profile?.name || user.email.split('@')[0]}
          </h2>
          
          <div className="flex items-center gap-3 mt-1">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${roleBadge.color}`}>
              <span>{roleBadge.icon}</span>
              {roleBadge.label}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {user.status === 'ACTIVE' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {user.status === 'ACTIVE' ? 'Aktif' : 'Non-Aktif'}
            </span>
          </div>
        </div>

        {/* Detail Content */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            
            {/* Email */}
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Email Address</p>
                <p className="text-sm font-medium text-slate-900 break-all">{user.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Nomor Telepon</p>
                <p className="text-sm font-medium text-slate-900">{user.profile?.phone || '-'}</p>
              </div>
            </div>

            {/* Position */}
            <div className="flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Jabatan</p>
                <p className="text-sm font-medium text-slate-900">{user.profile?.position || '-'}</p>
              </div>
            </div>

            {/* Division */}
            <div className="flex items-start gap-3">
              <Building className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Divisi</p>
                <p className="text-sm font-medium text-slate-900">{user.division?.name || 'Lembaga Umum'}</p>
              </div>
            </div>

            {/* Employee Status */}
            {user.employee_status && (
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Status Kepegawaian</p>
                  <p className="text-sm font-medium text-slate-900">{user.employee_status}</p>
                </div>
              </div>
            )}

            {/* Registration Date */}
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">Terdaftar Sejak</p>
                <p className="text-sm font-medium text-slate-900">
                  {new Date(user.createdAt).toLocaleDateString('id-ID', { 
                    day: 'numeric', month: 'long', year: 'numeric' 
                  })}
                </p>
              </div>
            </div>

          </div>

          {/* Full Width Items (Address & Notes) */}
          <div className="mt-6 space-y-6">
            {user.address && (
              <div className="flex items-start gap-3 pt-6 border-t border-slate-100">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Alamat Lengkap</p>
                  <p className="text-sm text-slate-800 leading-relaxed">{user.address}</p>
                </div>
              </div>
            )}

            {user.notes && (
              <div className="flex items-start gap-3 bg-amber-50/50 p-4 rounded-xl border border-amber-100/50">
                <FileText className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-amber-600 mb-1">Catatan Khusus</p>
                  <p className="text-sm text-amber-900 leading-relaxed">{user.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Today's Activity Section */}
          {typeof user.todayReports === 'number' && (
            <div className="mt-8 bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Aktivitas Hari Ini</h3>
                  <p className="text-xs text-slate-500 mt-1">Laporan yang telah diselesaikan</p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-blue-600">{user.todayReports}</span>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${user.todayProgress || 0}%` }}
                />
              </div>
              <p className="text-xs font-medium text-slate-500 mt-3 text-right">
                Progress: {user.todayProgress || 0}%
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}