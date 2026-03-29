'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Mail, 
  Shield, 
  Building, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Loader2
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
      
      console.log('Auth check response:', data) // Debug log
      
      if (!data.authenticated) {
        router.push('/login')
        return
      }

      // Fetch user details
      const userRes = await fetch(`/api/users/${data.user.userId}`)
      const userResult = await userRes.json()
      
      console.log('User data response:', userResult) // Debug log
      
      if (userResult.success) {
        setUserData(userResult.data)
      } else {
        console.error('Failed to load user:', userResult.error)
        alert('Error: ' + userResult.error)
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
      alert('Network error: ' + error)
    } finally {
      setLoading(false)
    }
  }

  const getRoleInfo = (role: string) => {
    switch (role) {
      case 'CEO':
        return {
          label: 'Chief Executive Officer',
          description: 'Akses penuh ke semua divisi dan dashboard perusahaan',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: '👑'
        }
      case 'HRD':
        return {
          label: 'Human Resource Development',
          description: 'Mengelola karyawan, approval akun, dan monitoring produktivitas',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: '👥'
        }
      case 'PM':
        return {
          label: 'Project Manager',
          description: 'Monitoring project, kendala tim, dan koordinasi antar divisi',
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: '📊'
        }
      case 'ADMIN':
        return {
          label: 'Administrator',
          description: 'Akses penuh sistem untuk maintenance dan konfigurasi',
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: '⚙️'
        }
      case 'KARYAWAN':
        return {
          label: 'Karyawan',
          description: 'Melaporkan progres kerja dan melihat feed divisi',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '👨‍💻'
        }
      default:
        return {
          label: role,
          description: 'Role tidak dikenal',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '❓'
        }
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return {
          label: 'Aktif',
          description: 'Akun aktif dan dapat menggunakan semua fitur',
          color: 'bg-green-100 text-green-800',
          icon: <CheckCircle className="w-4 h-4" />
        }
      case 'PENDING':
        return {
          label: 'Menunggu Approval',
          description: 'Akun menunggu persetujuan dari HRD/Admin',
          color: 'bg-yellow-100 text-yellow-800',
          icon: <Clock className="w-4 h-4" />
        }
      case 'INACTIVE':
        return {
          label: 'Non-Aktif',
          description: 'Akun dinonaktifkan, hubungi HRD untuk aktivasi',
          color: 'bg-red-100 text-red-800',
          icon: <XCircle className="w-4 h-4" />
        }
      default:
        return {
          label: status,
          description: 'Status tidak dikenal',
          color: 'bg-gray-100 text-gray-800',
          icon: <XCircle className="w-4 h-4" />
        }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-600">Data user tidak ditemukan</p>
        </div>
      </div>
    )
  }

  const roleInfo = getRoleInfo(userData.role)
  const statusInfo = getStatusInfo(userData.status)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Profile Saya</h1>
        
        {/* Account Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              Informasi Akun
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email */}
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium break-all">{userData.email}</p>
              </div>
            </div>

            {/* Role */}
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-500 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">Role & Akses</p>
                <div className="space-y-2">
                  <Badge className={`${roleInfo.color} px-3 py-1 text-sm font-medium`}>
                    {roleInfo.icon} {roleInfo.label}
                  </Badge>
                  <p className="text-sm text-gray-600">{roleInfo.description}</p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {statusInfo.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">Status Akun</p>
                <div className="space-y-2">
                  <Badge className={`${statusInfo.color} px-3 py-1 text-sm font-medium`}>
                    {statusInfo.label}
                  </Badge>
                  <p className="text-sm text-gray-600">{statusInfo.description}</p>
                </div>
              </div>
            </div>

            {/* Division */}
            {userData.divisionId && userData.divisions && (
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-gray-500 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">Divisi</p>
                  <div className="space-y-2">
                    <Badge 
                      className="px-3 py-1 text-sm font-medium"
                      style={{ 
                        backgroundColor: userData.divisions.color + '20',
                        color: userData.divisions.color || '#6B7280',
                        borderColor: userData.divisions.color || '#6B7280' 
                      }}
                    >
                      {userData.divisions.name}
                    </Badge>
                    {userData.divisions.description && (
                      <p className="text-sm text-gray-600">{userData.divisions.description}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Account Created */}
            {userData.created_at && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Bergabung Sejak</p>
                  <p className="font-medium">
                    {new Intl.DateTimeFormat('id-ID', {
                      timeZone: 'Asia/Jakarta',
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }).format(new Date(userData.created_at))}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
