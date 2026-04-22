'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { logoutAction } from '@/app/actions/auth-actions'
import { 
  User, 
  Mail, 
  Shield, 
  Building, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Fingerprint
} from 'lucide-react'
import { ProfilePhotoUploader } from '@/components/profile/ProfilePhotoUploader'

interface UserData {
  id: string
  email: string
  name?: string
  phone?: string
  role: string
  status: string
  employee_status?: string
  address?: string
  divisionId?: string
  createdAt?: string
  fotoProfil?: string | null
  divisions?: {
    id: string
    name: string
    description?: string
    color?: string
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const res = await fetch('/api/auth/check')
      const data = await res.json()
      console.log('Auth check:', data)
      
      if (!data.authenticated) {
        router.push('/login')
        return
      }

      console.log('Fetching user data for ID:', data.user.userId)
      const userRes = await fetch(`/api/users/${data.user.userId}`)
      const userResult = await userRes.json()
      console.log('User API response:', userResult)
      
      if (userResult.success) {
        console.log('User data loaded:', userResult.data)
        setUserData(userResult.data)
      } else {
        console.error('User API error:', userResult.error)
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpdate = (photoUrl: string | null) => {
    if (userData) {
      setUserData({ ...userData, fotoProfil: photoUrl })
    }
  }

  const getRoleInfo = (role: string) => {
    const roles: Record<string, any> = {
      CEO: { label: 'CEO', icon: '👑', color: 'bg-indigo-50 text-indigo-700 border-indigo-100', full: 'Chief Executive Officer' },
      GENERAL_AFFAIR: { label: 'HRD', icon: '👥', color: 'bg-blue-50 text-blue-700 border-blue-100', full: 'Human Resource Development' },
      PM: { label: 'PM', icon: '📊', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', full: 'Project Manager' },
      ADMIN: { label: 'Admin', icon: '⚙️', color: 'bg-rose-50 text-rose-700 border-rose-100', full: 'System Administrator' },
      STAFF: { label: 'Staff', icon: '👨‍💻', color: 'bg-slate-50 text-slate-700 border-slate-100', full: 'Staff' },
    }
    return roles[role] || { label: role, icon: '👤', color: 'bg-gray-50', full: role }
  }

  const getStatusInfo = (status: string) => {
    const statuses: Record<string, any> = {
      ACTIVE: { label: 'Aktif', color: 'bg-emerald-500', icon: <CheckCircle className="w-3 h-3" /> },
      PENDING: { label: 'Pending', color: 'bg-amber-500', icon: <Clock className="w-3 h-3" /> },
      INACTIVE: { label: 'Non-Aktif', color: 'bg-rose-500', icon: <XCircle className="w-3 h-3" /> },
    }
    return statuses[status] || { label: status, color: 'bg-slate-400', icon: <XCircle className="w-3 h-3" /> }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <p className="text-slate-400 text-sm font-medium animate-pulse">Memuat profil...</p>
    </div>
  )

  if (!userData) return <div className="p-8 text-center text-slate-500">Data tidak ditemukan</div>

  const roleInfo = getRoleInfo(userData.role)
  const statusInfo = getStatusInfo(userData.status)

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 md:pb-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          Profil Saya
        </h1>
        <p className="text-sm text-slate-500">
          {userData.role === 'STAFF' 
            ? 'Anda hanya dapat mengubah foto profil' 
            : 'Kelola foto profil Anda'}
        </p>
      </div>

      {/* Photo Upload Section */}
      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
        <CardContent className="p-8">
          <ProfilePhotoUploader
            currentPhotoUrl={userData.fotoProfil}
            onPhotoUpdate={handlePhotoUpdate}
            disabled={false}
          />
        </CardContent>
      </Card>

      {/* User Info Header */}
      <div className="flex items-center gap-4 md:gap-6 px-2">
        <div className="space-y-1 flex-1">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-none">
            {userData.name || userData.email.split('@')[0]}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${roleInfo.color}`}>
              {roleInfo.icon} {roleInfo.label}
            </span>
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${statusInfo.color} text-white`}>
              {statusInfo.label}
            </span>
            {userData.employee_status && (
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                {userData.employee_status}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Info Grid - 2 Column on Mobile */}
      <div className="grid grid-cols-2 gap-3">
        <InfoCard 
          label="Status Akun" 
          value={statusInfo.label} 
          icon={<Shield className="w-4 h-4 text-blue-500" />} 
          sub={userData.status === 'ACTIVE' ? 'Terverifikasi' : 'Menunggu'}
        />
        <InfoCard 
          label="Divisi" 
          value={userData.divisions?.name || 'Umum'} 
          icon={<Building className="w-4 h-4 text-emerald-500" />} 
          sub="Penempatan"
          color={userData.divisions?.color}
        />
      </div>

      {/* Detail List Card */}
      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y divide-slate-50">
            {userData.name && (
              <DetailItem 
                icon={<User className="w-4 h-4" />} 
                label="Nama Lengkap" 
                value={userData.name} 
              />
            )}
            <DetailItem 
              icon={<Mail className="w-4 h-4" />} 
              label="Email Address" 
              value={userData.email} 
            />
            {userData.phone && (
              <DetailItem 
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>} 
                label="No. Telepon" 
                value={userData.phone} 
              />
            )}
            <DetailItem 
              icon={<Shield className="w-4 h-4" />} 
              label="Jabatan" 
              value={roleInfo.full} 
            />
            {userData.employee_status && (
              <DetailItem 
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} 
                label="Status Karyawan" 
                value={userData.employee_status} 
              />
            )}
            {userData.address && (
              <DetailItem 
                icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} 
                label="Alamat" 
                value={userData.address} 
              />
            )}
            <DetailItem 
              icon={<Fingerprint className="w-4 h-4" />} 
              label="User ID" 
              value={userData.id} 
              isCode
            />
            <DetailItem 
              icon={<Calendar className="w-4 h-4" />} 
              label="Bergabung" 
              value={userData.createdAt 
                ? new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric', day: 'numeric' }).format(new Date(userData.createdAt))
                : 'Tidak tersedia'
              } 
            />
          </div>
        </CardContent>
      </Card>

      {/* Security/Action Hint */}
      <p className="text-center text-[11px] text-slate-400 font-medium px-6">
        Jika ada kesalahan data atau ingin merubah password, silakan hubungi tim <span className="text-blue-500 font-bold tracking-tight">IT Support</span> atau HRD Al-Wustho.
      </p>

      {/* Logout Button */}
      <form action={logoutAction}>
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-rose-50 text-rose-600 font-semibold text-sm hover:bg-rose-100 transition-colors border border-rose-100"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Keluar
        </button>
      </form>
    </div>
  )
}

// Sub-components for Clean Layout
function InfoCard({ label, value, icon, sub, color }: any) {
  return (
    <Card className="border-none shadow-lg shadow-slate-200/40 rounded-3xl overflow-hidden group">
      <CardContent className="p-4 flex flex-col items-center text-center space-y-1">
        <div className="p-2 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-black text-slate-800 truncate w-full" style={color ? { color } : {}}>
          {value}
        </p>
      </CardContent>
    </Card>
  )
}

function DetailItem({ icon, label, value, isCode }: { icon: any, label: string, value: string, isCode?: boolean }) {
  return (
    <div className="flex items-center gap-4 p-4 hover:bg-slate-50/50 transition-colors">
      <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-0.5">{label}</p>
        <p className={`text-[13px] font-semibold text-slate-700 truncate ${isCode ? 'font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded-md inline-block max-w-full' : ''}`}>
          {value}
        </p>
      </div>
    </div>
  )
}