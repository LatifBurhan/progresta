'use client'

import { useEffect, useState } from 'react'
import { 
  FileText, 
  FolderKanban, 
  TrendingUp, 
  Users,
  Calendar,
  Loader2,
  ChevronRight,
  ArrowUpRight,
  Activity,
  MapPin,
  AlertTriangle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RealtimeReportsTable } from '@/components/admin/RealtimeReportsTable'
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

export function DashboardClient({ userRole, userName, userId }: DashboardClientProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('day')
  const [projectActivity, setProjectActivity] = useState<ProjectActivityData | null>(null)
  const [activityPeriod, setActivityPeriod] = useState('30')

  const isAdmin = ['ADMIN', 'GENERAL_AFFAIR', 'CEO'].includes(userRole)

  useEffect(() => {
    loadStats()
  }, [period, userId])

  useEffect(() => {
    if (isAdmin) {
      loadProjectActivity()
    }
  }, [activityPeriod, isAdmin])

  const loadStats = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ period })
      if (userId) params.append('user_id', userId)
      // Use optimized endpoint
      const res = await fetch(`/api/dashboard/stats-optimized?${params.toString()}`)
      const data = await res.json()
      if (data.success) setStats(data.data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProjectActivity = async () => {
    try {
      // Use optimized endpoint
      const res = await fetch(`/api/admin/project-activity-optimized?period=${activityPeriod}`)
      const result = await res.json()
      if (result.success) {
        setProjectActivity(result.data)
      }
    } catch (error) {
      console.error('Failed to load activity data:', error)
    }
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
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header Section - Compact */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 text-xs md:text-sm">
            Halo, <span className="text-blue-600">{userName}</span>
          </p>
        </div>

        {/* Period Filter - Compact */}
        <div className="bg-white p-0.5 rounded-lg shadow-sm border border-slate-200 flex gap-0.5 w-full sm:w-fit">
          {(['day', 'week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 sm:flex-none px-2 md:px-3 py-1 rounded-md text-[10px] font-semibold transition-all whitespace-nowrap ${
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

      {/* Stats Cards - Compact Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard 
          title="Total Laporan" 
          value={stats.totalReports} 
          icon={<FileText className="w-4 h-4 md:w-5 md:h-5" />} 
          color="blue" 
        />
        <StatCard 
          title={`Laporan ${period === 'day' ? 'Hari Ini' : period}`} 
          value={stats.periodReports} 
          icon={<Calendar className="w-4 h-4 md:w-5 md:h-5" />} 
          color="purple" 
        />
        <StatCard 
          title="Project" 
          value={stats.totalProjectsWorked} 
          icon={<FolderKanban className="w-4 h-4 md:w-5 md:h-5" />} 
          color="orange" 
        />
        <StatCard 
          title={stats.todayProgress !== null ? "Progres" : "Aktif"} 
          value={stats.todayProgress !== null ? `${stats.todayProgress}%` : stats.activeProjects} 
          icon={stats.todayProgress !== null ? <TrendingUp className="w-4 h-4 md:w-5 md:h-5" /> : <Users className="w-4 h-4 md:w-5 md:h-5" />} 
          color="emerald" 
        />
      </div>

      {/* NEW: 3 Statistik Tambahan - Compact */}
      {!isAdmin && stats.avgReportsPerDay !== null && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 1. Rata-rata Laporan per Hari */}
          <Card className="border border-slate-100 shadow-sm">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-500 font-medium">Rata-rata/Hari</p>
                  <h3 className="text-xl font-bold text-slate-800">{stats.avgReportsPerDay.toFixed(2)}</h3>
                </div>
              </div>
              <p className="text-[10px] text-slate-400">Sejak bergabung</p>
            </CardContent>
          </Card>

          {/* 2. Breakdown Lokasi Kerja */}
          <Card className="border border-slate-100 shadow-sm md:col-span-2">
            <CardHeader className="p-3 pb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-slate-600" />
                <CardTitle className="text-xs font-semibold text-slate-800">Breakdown Lokasi</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="h-[140px] flex items-center justify-center">
                {stats.locationBreakdown.some(loc => loc.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.locationBreakdown.filter(loc => loc.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={55}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.locationBreakdown.filter(loc => loc.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '11px' }}
                        formatter={(value: any) => [`${value} laporan`, '']}
                      />
                      <Legend 
                        iconType="circle"
                        wrapperStyle={{ fontSize: '10px' }}
                        formatter={(value, entry: any) => `${value}: ${entry.payload.value}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-[10px] text-slate-400">Belum ada data</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3. Statistik Kendala - Compact */}
      {!isAdmin && stats.kendalaStats && (
        <Card className="border border-rose-100 shadow-sm bg-gradient-to-br from-rose-50 to-orange-50">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-slate-600 font-medium">Statistik Kendala</p>
                  <h3 className="text-2xl font-bold text-slate-800">{stats.kendalaStats.percentage}%</h3>
                  <p className="text-[10px] text-slate-500 truncate">
                    {stats.kendalaStats.withKendala}/{stats.kendalaStats.withKendala + stats.kendalaStats.withoutKendala} laporan
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-lg px-2 py-1.5 shadow-sm flex-shrink-0">
                <p className="text-[9px] text-slate-500">Tanpa Kendala</p>
                <p className="text-base font-bold text-green-600">{stats.kendalaStats.withoutKendala}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Trend Chart - Compact */}
        <Card className="lg:col-span-2 border border-slate-100 shadow-sm overflow-hidden">
          <CardHeader className="p-3 md:p-4 pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-slate-800">Trend Aktivitas</CardTitle>
              <div className="text-[9px] font-bold uppercase tracking-wider text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">
                Laporan
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-2 md:p-4 pt-2">
            <div className="h-[180px] md:h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.trendData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    dy={10}
                  />
                  <YAxis 
                    hide={true}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }}
                  />
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

        {/* Active Projects - Compact */}
        {!isAdmin && (
          <Card className="border border-slate-100 shadow-sm">
            <CardHeader className="p-3 md:p-4">
              <CardTitle className="text-sm font-semibold text-slate-800 flex items-center justify-between">
                Project Aktif
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0 space-y-2">
              {stats.activeProjectsList.length > 0 ? (
                stats.activeProjectsList.slice(0, 4).map((project: any) => (
                  <div key={project.id} className="group p-2 rounded-lg bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                    <h4 className="font-semibold text-slate-700 text-xs truncate">{project.name}</h4>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-[9px] text-slate-400 truncate flex-1 mr-2">{project.description || 'Tidak ada deskripsi'}</p>
                      <ChevronRight className="w-3 h-3 text-slate-300" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-[10px] text-slate-400 py-3">Kosong</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Project Activity Monitor - Compact for Admin */}
{isAdmin && projectActivity && (
  <div className="space-y-4 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
    {/* Header Section - Compact */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div>
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[9px] font-semibold uppercase tracking-wider mb-2">
          <Activity className="w-2.5 h-2.5" /> Admin Monitor
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900">Aktivitas Project</h2>
        <p className="text-slate-500 text-xs mt-0.5">Monitoring performa laporan per project</p>
      </div>
      
      {/* Period Switcher - Compact */}
      <div className="bg-slate-100 p-0.5 rounded-lg flex gap-0.5 w-fit border border-slate-200">
        {['7', '30', '90'].map((p) => (
          <button
            key={p}
            onClick={() => setActivityPeriod(p)}
            className={`px-3 py-1.5 rounded-md text-[10px] font-semibold transition-all ${
              activityPeriod === p 
                ? 'bg-white text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {p} Hari
          </button>
        ))}
      </div>
    </div>

    {/* Summary Cards - Compact */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {[
        { label: 'Sangat Aktif', val: projectActivity.summary.veryActive, color: 'emerald', icon: TrendingUp },
        { label: 'Aktif', val: projectActivity.summary.active, color: 'blue', icon: Activity },
        { label: 'Kurang Aktif', val: projectActivity.summary.lowActive, color: 'amber', icon: TrendingUp, rotate: true },
        { label: 'Stagnant', val: projectActivity.summary.stagnant, color: 'rose', icon: AlertTriangle },
      ].map((item, i) => (
        <Card key={i} className="group border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
          <CardContent className="p-0">
            <div className={`h-0.5 w-full bg-${item.color}-500`} />
            <div className="p-3 md:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider truncate">{item.label}</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mt-0.5">{item.val}</h3>
                </div>
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg bg-${item.color}-50 flex items-center justify-center flex-shrink-0`}>
                  <item.icon className={`w-4 h-4 md:w-5 md:h-5 text-${item.color}-500 ${item.rotate ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Stagnant Projects Alert - Compact */}
    {projectActivity.summary.stagnantProjects.length > 0 && (
      <Card className="border border-rose-100 bg-rose-50/30 shadow-sm">
        <CardHeader className="p-3 pb-2">
          <CardTitle className="text-xs font-semibold text-rose-600 flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
            </span>
            Perlu Perhatian ({projectActivity.summary.stagnantProjects.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-2 p-3">
          {projectActivity.summary.stagnantProjects.slice(0, 6).map((project) => (
            <div key={project.id} className="p-2.5 bg-white rounded-lg border border-rose-100 hover:shadow-sm transition-all">
              <h4 className="font-semibold text-slate-800 text-xs line-clamp-1">{project.name}</h4>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-500">
                  {project.pic?.substring(0, 2) || '??'}
                </div>
                <p className="text-[10px] text-slate-500 font-medium truncate">{project.pic || 'No PIC'}</p>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">
                  {project.daysSinceLastReport}d
                </span>
                <span className="text-[9px] font-medium text-slate-400">{project.reportCount} lap</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )}

    {/* Top Active Projects Table - Compact */}
    <Card className="border border-slate-100 shadow-sm overflow-hidden">
      <CardHeader className="p-3 md:p-4">
        <CardTitle className="text-base font-bold text-slate-800">
          Rank Activity <span className="text-slate-400 font-normal text-sm">/ {activityPeriod} Days</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-y border-slate-100">
              <tr>
                <th className="px-3 md:px-4 py-2 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Project</th>
                <th className="px-3 md:px-4 py-2 text-left text-[9px] font-semibold text-slate-500 uppercase tracking-wider">PIC</th>
                <th className="px-3 md:px-4 py-2 text-center text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Activity</th>
                <th className="px-3 md:px-4 py-2 text-center text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Issues</th>
                <th className="px-3 md:px-4 py-2 text-center text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Last</th>
                <th className="px-3 md:px-4 py-2 text-right text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {projectActivity.projects
                .sort((a, b) => b.reportCount - a.reportCount)
                .slice(0, 10)
                .map((project) => (
                  <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 md:px-4 py-2.5">
                      <p className="font-semibold text-slate-800 text-xs">{project.name}</p>
                      <p className="text-[9px] text-slate-400 font-medium">{project.status}</p>
                    </td>
                    <td className="px-3 md:px-4 py-2.5 text-xs text-slate-600">{project.pic || '-'}</td>
                    <td className="px-3 md:px-4 py-2.5 text-center">
                      <span className="text-base font-bold text-slate-900">{project.reportCount}</span>
                    </td>
                    <td className="px-3 md:px-4 py-2.5 text-center">
                      <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-[10px] ${project.kendalaCount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400'}`}>
                        {project.kendalaCount}
                      </div>
                    </td>
                    <td className="px-3 md:px-4 py-2.5 text-center text-[10px] text-slate-500">
                      {project.lastReportDate ? `${project.daysSinceLastReport}d` : '-'}
                    </td>
                    <td className="px-3 md:px-4 py-2.5 text-right">
                      <span 
                        className="px-2 py-1 rounded-md text-[9px] font-bold uppercase"
                        style={{ 
                          backgroundColor: getActivityColor(project.activityLevel) + '15',
                          color: getActivityColor(project.activityLevel)
                        }}
                      >
                        {getActivityLabel(project.activityLevel)}
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

      {/* Realtime Reports Monitor - Compact for Admin */}
      {isAdmin && (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <RealtimeReportsTable />
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
    <Card className="relative overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-slate-500 truncate mb-1">{title}</p>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
          </div>
          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white flex-shrink-0`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
