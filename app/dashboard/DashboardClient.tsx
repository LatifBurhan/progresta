'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FileText, 
  FolderKanban, 
  TrendingUp, 
  Users,
  Calendar,
  Loader2 
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

interface DashboardStats {
  totalReports: number
  periodReports: number
  totalProjectsWorked: number
  activeProjects: number
  activeProjectsList: any[]
  todayProgress: number | null
  trendData: { date: string; count: number }[]
  period: string
}

interface DashboardClientProps {
  userRole: string
  userName: string
  userId?: string // Optional: for admin viewing specific user
}

export function DashboardClient({ userRole, userName, userId }: DashboardClientProps) {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('day')

  const isAdmin = ['ADMIN', 'HRD', 'CEO'].includes(userRole)

  useEffect(() => {
    loadStats()
  }, [period, userId])

  const loadStats = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ period })
      if (userId) {
        params.append('user_id', userId)
      }
      
      const res = await fetch(`/api/dashboard/stats?${params.toString()}`)
      const data = await res.json()

      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPeriodLabel = () => {
    switch (period) {
      case 'day': return 'Hari Ini'
      case 'week': return 'Minggu Ini'
      case 'month': return 'Bulan Ini'
      case 'year': return 'Tahun Ini'
    }
  }

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Selamat datang, {userName}</p>
        </div>

        {/* Period Filter */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={period === 'day' ? 'default' : 'outline'}
            onClick={() => setPeriod('day')}
          >
            Hari
          </Button>
          <Button
            size="sm"
            variant={period === 'week' ? 'default' : 'outline'}
            onClick={() => setPeriod('week')}
          >
            Minggu
          </Button>
          <Button
            size="sm"
            variant={period === 'month' ? 'default' : 'outline'}
            onClick={() => setPeriod('month')}
          >
            Bulan
          </Button>
          <Button
            size="sm"
            variant={period === 'year' ? 'default' : 'outline'}
            onClick={() => setPeriod('year')}
          >
            Tahun
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reports */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Laporan</p>
                <h3 className="text-3xl font-bold text-blue-900 mt-2">{stats.totalReports}</h3>
                <p className="text-xs text-blue-600 mt-1">Sepanjang waktu</p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Period Reports */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Laporan {getPeriodLabel()}</p>
                <h3 className="text-3xl font-bold text-purple-900 mt-2">{stats.periodReports}</h3>
                <p className="text-xs text-purple-600 mt-1">Periode saat ini</p>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projects Worked */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">Project Dikerjakan</p>
                <h3 className="text-3xl font-bold text-orange-900 mt-2">{stats.totalProjectsWorked}</h3>
                <p className="text-xs text-orange-600 mt-1">Yang pernah dilaporkan</p>
              </div>
              <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                <FolderKanban className="w-6 h-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today Progress or Active Projects */}
        {stats.todayProgress !== null ? (
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Progres Hari Ini</p>
                  <h3 className="text-3xl font-bold text-green-900 mt-2">{stats.todayProgress}%</h3>
                  <p className="text-xs text-green-600 mt-1">Target: 3 laporan/hari</p>
                </div>
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Project Aktif</p>
                  <h3 className="text-3xl font-bold text-green-900 mt-2">{stats.activeProjects}</h3>
                  <p className="text-xs text-green-600 mt-1">Sedang berjalan</p>
                </div>
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Trend Chart */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Trend Laporan</h3>
            <span className="text-sm text-gray-500">{getPeriodLabel()}</span>
          </div>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Active Projects List (for non-admin) */}
      {!isAdmin && stats.activeProjectsList.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project yang Sedang Bergabung</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {stats.activeProjectsList.map((project: any) => (
                <div
                  key={project.id}
                  className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <h4 className="font-semibold text-indigo-900 text-sm line-clamp-1">
                    {project.name}
                  </h4>
                  <p className="text-xs text-indigo-600 mt-1 line-clamp-2">
                    {project.description || 'Tidak ada deskripsi'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
