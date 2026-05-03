'use client'

import { useEffect, useState } from 'react'
import { 
  FileText, 
  FolderKanban, 
  TrendingUp, 
  Users,
  Calendar,
  Loader2,
  Activity,
  MapPin,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RealtimeReportsTable } from '@/components/admin/RealtimeReportsTable'
import { getCache, setCache } from '@/lib/utils/simple-cache'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'

interface DashboardStats {
  totalReports: number
  periodReports: number
  totalProjectsWorked: number
  activeProjects: number
  activeProjectsList: any[]
  todayProgress: number | null
  avgReportsPerDay: number | null
  locationBreakdown: { name: string; value: number; color: string }[]
  kendalaStats: { withKendala: number; withoutKendala: number; percentage: number } | null
  trendData: { date: string; count: number }[]
  period: string
}

interface ProjectActivity {
  id: string
  name: string
  pic: string | null
  status: string
  reportCount: number
  kendalaCount: number
  lastReportDate: string | null
  daysSinceLastReport: number
  activityLevel: string
  isStagnant: boolean
}

interface ProjectActivityData {
  projects: ProjectActivity[]
  summary: {
    veryActive: number
    active: number
    lowActive: number
    stagnant: number
    totalProjects: number
    stagnantProjects: ProjectActivity[]
  }
  period: number
}

interface DashboardClientProps {
  userRole: string
  userName: string
  userId?: string
}

export function DashboardClientRefactored({ userRole, userName, userId }: DashboardClientProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('day')
  const [projectActivity, setProjectActivity] = useState<ProjectActivityData | null>(null)
  const [activityPeriod, setActivityPeriod] = useState('30')
  
  // Accordion state - all open by default
  const [openSections, setOpenSections] = useState({
    overview: true,
    activity: true,
    realtime: true
  })

  const isAdmin = ['ADMIN', 'GENERAL_AFFAIR', 'CEO'].includes(userRole)

  useEffect(() => {
    const loadStats = async () => {
      const cacheKey = `stats_${period}_${userId || 'all'}`
      const cached = getCache<DashboardStats>(cacheKey)
      
      if (cached) {
        setStats(cached)
        setLoading(false)
      } else {
        setLoading(true)
      }
      
      try {
        const params = new URLSearchParams({ period })
        if (userId) params.append('user_id', userId)
        const res = await fetch(`/api/dashboard/stats-optimized?${params.toString()}`)
        const data = await res.json()
        if (data.success) {
          setStats(data.data)
          setCache(cacheKey, data.data)
        }
      } catch (error) {
        console.error('Failed to load stats:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadStats()
  }, [period, userId])

  useEffect(() => {
    if (!isAdmin) return
    
    const loadProjectActivity = async () => {
      const cacheKey = `activity_${activityPeriod}`
      const cached = getCache<ProjectActivityData>(cacheKey)
      
      if (cached) {
        setProjectActivity(cached)
        return
      }
      
      try {
        const res = await fetch(`/api/admin/project-activity-optimized?period=${activityPeriod}`)
        const result = await res.json()
        if (result.success) {
          setProjectActivity(result.data)
          setCache(cacheKey, result.data)
        }
      } catch (error) {
        console.error('Failed to load activity data:', error)
      }
    }
    
    loadProjectActivity()
  }, [activityPeriod, isAdmin])

  const toggleSection = (section: 'overview' | 'activity' | 'realtime') => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const getActivityColor = (level: string) => {
    switch (level) {
      case 'very_active': return '#10b981'
      case 'active': return '#3b82f6'
      case 'low_active': return '#f59e0b'
      default: return '#ef4444'
    }
  }

  const getActivityLabel = (level: string) => {
    switch (level) {
      case 'very_active': return 'Sangat Aktif'
      case 'active': return 'Aktif'
      case 'low_active': return 'Kurang Aktif'
      default: return 'Stagnant'
    }
  }

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-slate-400 font-medium">Menyinkronkan data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm">
            Halo, <span className="text-blue-600">{userName}</span>
          </p>
        </div>

        {/* Period Filter */}
        <div className="bg-white p-1 rounded-lg shadow-sm border border-slate-200 flex gap-1">
          {(['day', 'week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-md text-xs font-semibold transition-all ${
                period === p 
                ? 'bg-slate-900 text-white' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {p === 'day' ? 'Hari' : p === 'week' ? 'Minggu' : p === 'month' ? 'Bulan' : 'Tahun'}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 1: Dashboard Overview */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
          <button
            onClick={() => toggleSection('overview')}
            className="flex items-center gap-3 flex-1"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold text-slate-900">Statistik & Ringkasan</h2>
              <p className="text-xs text-slate-500">Data aktivitas dan performa</p>
            </div>
          </button>
          <button onClick={() => toggleSection('overview')}>
            {openSections.overview ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>
        </div>

        {openSections.overview && (
          <div className="p-6 pt-0 space-y-4">
            {/* Stats Grid - Masonry Style */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard 
                title="Total Laporan" 
                value={stats.totalReports} 
                icon={<FileText className="w-5 h-5" />} 
                color="blue" 
              />
              <StatCard 
                title={`Laporan ${period === 'day' ? 'Hari Ini' : period}`} 
                value={stats.periodReports} 
                icon={<Calendar className="w-5 h-5" />} 
                color="purple" 
              />
              <StatCard 
                title="Project" 
                value={stats.totalProjectsWorked} 
                icon={<FolderKanban className="w-5 h-5" />} 
                color="orange" 
              />
              <StatCard 
                title={stats.todayProgress !== null ? "Progres" : "Aktif"} 
                value={stats.todayProgress !== null ? `${stats.todayProgress}%` : stats.activeProjects} 
                icon={stats.todayProgress !== null ? <TrendingUp className="w-5 h-5" /> : <Users className="w-5 h-5" />} 
                color="emerald" 
              />
            </div>

            {/* Additional Stats - Masonry Grid */}
            {stats.avgReportsPerDay !== null && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Rata-rata Laporan */}
                <Card className="border border-slate-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                        <Activity className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Rata-rata/Hari</p>
                        <h3 className="text-2xl font-bold text-slate-800">{stats.avgReportsPerDay.toFixed(2)}</h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Breakdown Lokasi */}
                <Card className="border border-slate-200 md:col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Breakdown Lokasi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="h-[160px]">
                      {stats.locationBreakdown.some(loc => loc.value > 0) ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={stats.locationBreakdown.filter(loc => loc.value > 0)}
                              cx="50%"
                              cy="50%"
                              innerRadius={35}
                              outerRadius={60}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {stats.locationBreakdown.filter(loc => loc.value > 0).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-sm text-slate-400">Belum ada data</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Statistik Kendala */}
            {stats.kendalaStats && (
              <Card className="border border-rose-200 bg-gradient-to-br from-rose-50 to-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-medium">Statistik Kendala</p>
                        <h3 className="text-3xl font-bold text-slate-800">{stats.kendalaStats.percentage}%</h3>
                        <p className="text-xs text-slate-500">
                          {stats.kendalaStats.withKendala}/{stats.kendalaStats.withKendala + stats.kendalaStats.withoutKendala} laporan
                        </p>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl px-4 py-3 shadow-sm">
                      <p className="text-xs text-slate-500">Tanpa Kendala</p>
                      <p className="text-2xl font-bold text-green-600">{stats.kendalaStats.withoutKendala}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trend Chart & Stagnant Projects - Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Trend Chart */}
              <Card className="lg:col-span-2 border border-slate-200">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Trend Aktivitas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.trendData}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="date" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 11 }}
                        />
                        <YAxis hide />
                        <Tooltip />
                        <Area 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          fill="url(#colorCount)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Yang Perlu Perhatian (Stagnant Projects) */}
              {isAdmin && projectActivity && projectActivity.summary.stagnantProjects.length > 0 ? (
                <Card className="border border-rose-200 bg-rose-50">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold text-rose-600 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Yang Perlu Perhatian
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {projectActivity.summary.stagnantProjects.slice(0, 5).map((project) => (
                      <div key={project.id} className="p-3 bg-white rounded-lg border border-rose-100 hover:border-rose-200 transition-all">
                        <h4 className="font-semibold text-slate-800 text-sm line-clamp-1">{project.name}</h4>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-slate-500">{project.pic || 'No PIC'}</p>
                          <span className="text-xs font-bold text-rose-500 bg-rose-100 px-2 py-0.5 rounded">
                            {project.daysSinceLastReport}d
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border border-slate-200">
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Status Project
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center justify-center py-8">
                      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">Semua Lancar!</p>
                      <p className="text-xs text-slate-400 mt-1">Tidak ada project yang perlu perhatian</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Aktivitas Project (Admin Only) */}
      {isAdmin && projectActivity && (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <button
              onClick={() => toggleSection('activity')}
              className="flex items-center gap-3 flex-1"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold text-slate-900">Aktivitas Project</h2>
                <p className="text-xs text-slate-500">Monitoring performa laporan per project</p>
              </div>
            </button>
            <div className="flex items-center gap-3">
              {/* Period Switcher */}
              <div className="bg-slate-100 p-0.5 rounded-lg flex gap-0.5 border border-slate-200">
                {['7', '30', '90'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setActivityPeriod(p)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      activityPeriod === p 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {p} Hari
                  </button>
                ))}
              </div>
              <button onClick={() => toggleSection('activity')}>
                {openSections.activity ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          {openSections.activity && (
            <div className="p-6 pt-0 space-y-4">
              {/* Summary Cards - Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Sangat Aktif', val: projectActivity.summary.veryActive, color: 'emerald', icon: TrendingUp },
                  { label: 'Aktif', val: projectActivity.summary.active, color: 'blue', icon: Activity },
                  { label: 'Kurang Aktif', val: projectActivity.summary.lowActive, color: 'amber', icon: TrendingUp },
                  { label: 'Stagnant', val: projectActivity.summary.stagnant, color: 'rose', icon: AlertTriangle },
                ].map((item, i) => (
                  <Card key={i} className="border border-slate-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-semibold text-slate-400 uppercase">{item.label}</p>
                          <h3 className="text-3xl font-bold text-slate-900 mt-1">{item.val}</h3>
                        </div>
                        <div className={`w-12 h-12 rounded-xl bg-${item.color}-100 flex items-center justify-center`}>
                          <item.icon className={`w-6 h-6 text-${item.color}-600`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Stagnant Projects Alert */}
              {projectActivity.summary.stagnantProjects.length > 0 && (
                <Card className="border border-rose-200 bg-rose-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-rose-600 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Perlu Perhatian ({projectActivity.summary.stagnantProjects.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {projectActivity.summary.stagnantProjects.slice(0, 6).map((project) => (
                      <div key={project.id} className="p-3 bg-white rounded-lg border border-rose-100">
                        <h4 className="font-semibold text-slate-800 text-sm line-clamp-1">{project.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">{project.pic || 'No PIC'}</p>
                        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                          <span className="text-xs font-bold text-rose-500">{project.daysSinceLastReport}d</span>
                          <span className="text-xs text-slate-400">{project.reportCount} lap</span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Activity Table */}
              <Card className="border border-slate-200">
                <CardHeader>
                  <CardTitle className="text-base font-bold">
                    Rank Activity <span className="text-slate-400 font-normal text-sm">/ {activityPeriod} Days</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-y border-slate-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Project</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">PIC</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Activity</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Issues</th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Last Report</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {projectActivity.projects
                          .sort((a, b) => b.reportCount - a.reportCount)
                          .slice(0, 10)
                          .map((project) => (
                            <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3">
                                <p className="font-semibold text-slate-800 text-sm">{project.name}</p>
                                <p className="text-xs text-slate-400">{project.status}</p>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600">{project.pic || '-'}</td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-lg font-bold text-slate-900">{project.reportCount}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <div className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${
                                  project.kendalaCount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'
                                }`}>
                                  {project.kendalaCount}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-sm text-slate-500">
                                  {project.lastReportDate ? `${project.daysSinceLastReport} hari lalu` : 'Belum ada'}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: Monitoring Laporan Real-time (Admin Only) */}
      {isAdmin && (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <button
              onClick={() => toggleSection('realtime')}
              className="flex items-center gap-3 flex-1"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-bold text-slate-900">Monitoring Laporan Real-time</h2>
                <p className="text-xs text-slate-500">Laporan terbaru dari semua user</p>
              </div>
            </button>
            <button onClick={() => toggleSection('realtime')}>
              {openSections.realtime ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </button>
          </div>

          {openSections.realtime && (
            <div className="p-6 pt-0">
              <RealtimeReportsTable />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatCard({ title, value, icon, color }: any) {
  const colors: any = {
    blue: "from-blue-500 to-indigo-600",
    purple: "from-purple-500 to-fuchsia-600",
    orange: "from-orange-400 to-red-500",
    emerald: "from-emerald-400 to-teal-600",
  }

  return (
    <Card className="border border-slate-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
          </div>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
