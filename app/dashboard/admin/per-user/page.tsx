'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Search, ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DashboardClient } from '../../DashboardClient'

interface UserStats {
  id: string
  name: string
  email: string
  role: string
  fotoProfil: string | null
  divisionName: string
  totalReports: number
  todayReports: number
  todayProgress: number
}

export default function PerUserDashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [users, setUsers] = useState<UserStats[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserStats[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserStats | null>(null)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    const userId = searchParams.get('user_id')
    if (userId && users.length > 0) {
      const user = users.find(u => u.id === userId)
      if (user) {
        setSelectedUser(user)
      } else {
        setSelectedUser(null)
      }
    } else {
      setSelectedUser(null)
    }
  }, [searchParams, users])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users)
    } else {
      const query = searchQuery.toLowerCase()
      setFilteredUsers(
        users.filter(
          u =>
            u.name.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query) ||
            u.divisionName.toLowerCase().includes(query)
        )
      )
    }
  }, [searchQuery, users])

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/dashboard/users')
      
      // Check if response is ok
      if (!res.ok) {
        const data = await res.json()
        console.error('API Error:', data.error)
        
        // Only show alert for critical errors (not 404 which might be handled by fallback)
        if (res.status !== 404) {
          alert('Error: ' + (data.error || 'Failed to load users'))
        }
        return
      }

      const data = await res.json()

      if (data.success && data.data) {
        setUsers(data.data)
        setFilteredUsers(data.data)
      } else {
        console.warn('API returned success but no data:', data)
        setUsers([])
        setFilteredUsers([])
      }
    } catch (error) {
      console.error('Failed to load users:', error)
      alert('Network error: ' + error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserClick = (user: UserStats) => {
    router.push(`/dashboard/admin/per-user?user_id=${user.id}`)
  }

  const handleBack = () => {
    router.push('/dashboard/admin/per-user')
    setSelectedUser(null)
  }

  if (selectedUser) {
    return (
      <div className="p-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Daftar User
        </button>
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard - {selectedUser.name}</h1>
          <p className="text-gray-600 mt-1">{selectedUser.email} • {selectedUser.divisionName}</p>
        </div>
        <DashboardClient 
          userRole="KARYAWAN" 
          userName={selectedUser.name} 
          userId={selectedUser.id} 
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Per User</h1>
        <p className="text-gray-600 mt-1">Pilih user untuk melihat statistik detail</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Cari nama, email, atau divisi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center p-12">
              <p className="text-gray-500">Tidak ada user ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Divisi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Laporan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hari Ini
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progres
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => handleUserClick(user)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.fotoProfil ? (
                            <img
                              src={user.fotoProfil}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{user.divisionName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.role === 'CEO'
                              ? 'bg-purple-100 text-purple-800'
                              : user.role === 'HRD'
                              ? 'bg-blue-100 text-blue-800'
                              : user.role === 'PM'
                              ? 'bg-green-100 text-green-800'
                              : user.role === 'ADMIN'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">{user.totalReports}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{user.todayReports}/3</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2 mr-2" style={{ width: '100px' }}>
                            <div
                              className={`h-2 rounded-full ${
                                user.todayProgress === 100
                                  ? 'bg-green-500'
                                  : user.todayProgress >= 66
                                  ? 'bg-blue-500'
                                  : user.todayProgress >= 33
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${user.todayProgress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{user.todayProgress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
