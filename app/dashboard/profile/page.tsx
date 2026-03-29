'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
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

interface UserData {
  id: string
  email: string
  role: string
  status: string
  divisionId?: string
  created_at?: string
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
      if (!data.authenticated) {
        router.push('/login')
        return
      }

      const userRes = await fetch(`/api/users/${data.user.userId}`)
      const userResult = await userRes.json()
      if (userResult.success) {
        setUserData(userResult.data)
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleInfo = (role: string) => {
    const roles: Record<string, any> = {
      CEO: { label: 'CEO', icon: '👑', color: 'bg-indigo-50 text-indigo-700 border-indigo-100', full: 'Chief Executive Officer' },
      HRD: { label: 'HRD', icon: '👥', color: 'bg-blue-50 text-blue-700 border-blue-100', full: 'Human Resource' },
      PM: { label: 'PM', icon: '📊', color: 'bg-emerald-50 text-emerald-700 border-emerald-100', full: 'Project Manager' },
      ADMIN: { label: 'Admin', icon: '⚙️', color: 'bg-rose-50 text-rose-700 border-rose-100', full: 'System Administrator' },
      KARYAWAN: { label: 'Staff', icon: '👨‍💻', color: 'bg-slate-50 text-slate-700 border-slate-100', full: 'Karyawan' },
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
      {/* Header Profile - Compact */}
      <div className="flex items-center gap-4 md:gap-6 px-2">
        <div className="relative">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-blue-100">
            {userData.email.charAt(0).toUpperCase()}
          </div>
          <div className={`absolute -bottom-1 -right-1 p-1.5 rounded-xl border-4 border-[#F8FAFC] ${statusInfo.color} text-white shadow-sm`}>
            {statusInfo.icon}
          </div>
        </div>
        <div className="space-y-1">
          <h1 className="text-xl md:text-3xl font-black text-slate-900 tracking-tight leading-none">
            {userData.email.split('@')[0]}
          </h1>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${roleInfo.color}`}>
              {roleInfo.icon} {roleInfo.label}
            </span>
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
            <DetailItem 
              icon={<Mail className="w-4 h-4" />} 
              label="Email Address" 
              value={userData.email} 
            />
            <DetailItem 
              icon={<Fingerprint className="w-4 h-4" />} 
              label="User ID" 
              value={userData.id} 
              isCode
            />
            <DetailItem 
              icon={<Calendar className="w-4 h-4" />} 
              label="Bergabung" 
              value={userData.created_at 
                ? new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric', day: 'numeric' }).format(new Date(userData.created_at))
                : 'Tidak tersedia'
              } 
            />
            <DetailItem 
              icon={<User className="w-4 h-4" />} 
              label="Jabatan" 
              value={roleInfo.full} 
            />
          </div>
        </CardContent>
      </Card>

      {/* Security/Action Hint */}
      <p className="text-center text-[11px] text-slate-400 font-medium px-6">
        Jika ada kesalahan data atau ingin merubah password, silakan hubungi tim <span className="text-blue-500 font-bold tracking-tight">IT Support</span> atau HRD Al-Wustho.
      </p>
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