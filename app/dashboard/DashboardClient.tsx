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
      const res = await fetch(`/api/dashboard/stats?${params.toString()}`)
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
      const res = await fetch(`/api/admin/project-activity?period=${activityPeriod}`)
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
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 text-sm md:text-base font-medium">
            Halo, <span className="text-blue-600">{userName}</span> 👋
          </p>
        </div>

        {/* Period Filter */}
        <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 flex gap-1 w-full sm:w-fit overflow-x-auto">
          {(['day', 'week', 'month', 'year'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 sm:flex-none px-3 md:px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${
                period === p 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {p === 'day' ? 'Harian' : p === 'week' ? 'Minggu' : p === 'month' ? 'Bulan' : 'Tahun'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards - Grid 2 Kolom di Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
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

      {/* NEW: 3 Statistik Tambahan - Hanya untuk non-admin */}
      {!isAdmin && stats.avgReportsPerDay !== null && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {/* 1. Rata-rata Laporan per Hari */}
          <Card className="border-none shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Rata-rata per Hari</p>
                  <h3 className="text-2xl font-black text-slate-800">{stats.avgReportsPerDay.toFixed(2)}</h3>
                </div>
              </div>
              <p className="text-xs text-slate-400">Laporan sejak awal bergabung</p>
            </CardContent>
          </Card>

          {/* 2. Breakdown Lokasi Kerja - Pie Chart */}
          <Card className="border-none shadow-lg md:col-span-2">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-600" />
                <CardTitle className="text-sm font-bold text-slate-800">Breakdown Lokasi Kerja</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-[180px] flex items-center justify-center">
                {stats.locationBreakdown.some(loc => loc.value > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.locationBreakdown.filter(loc => loc.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {stats.locationBreakdown.filter(loc => loc.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }}
                        formatter={(value: any) => [`${value} laporan`, '']}
                      />
                      <Legend 
                        iconType="circle"
                        wrapperStyle={{ fontSize: '12px' }}
                        formatter={(value, entry: any) => `${value}: ${entry.payload.value}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-slate-400">Belum ada data lokasi</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3. Statistik Kendala - Hanya untuk non-admin */}
      {!isAdmin && stats.kendalaStats && (
        <Card className="border-none shadow-lg bg-gradient-to-br from-rose-50 to-orange-50">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-orange-500 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-slate-600 font-medium mb-1">Statistik Kendala</p>
                  <h3 className="text-3xl font-black text-slate-800">{stats.kendalaStats.percentage}%</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {stats.kendalaStats.withKendala} dari {stats.kendalaStats.withKendala + stats.kendalaStats.withoutKendala} laporan mengalami kendala
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-white rounded-lg px-3 py-2 shadow-sm">
                  <p className="text-[10px] text-slate-500">Tanpa Kendala</p>
                  <p className="text-lg font-bold text-green-600">{stats.kendalaStats.withoutKendala}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Trend Chart */}
        <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
          <CardHeader className="p-4 md:p-6 pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm md:text-lg font-bold text-slate-800">Trend Aktivitas</CardTitle>
              <div className="text-[10px] font-bold uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-1 rounded">
                Laporan
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-2 md:p-6 pt-4 md:pt-6">
            <div className="h-[200px] md:h-[320px] w-full">
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

        {/* Active Projects */}
        {!isAdmin && (
          <Card className="border-none shadow-xl shadow-slate-200/50">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-sm md:text-lg font-bold text-slate-800 flex items-center justify-between">
                Project Aktif
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 space-y-3">
              {stats.activeProjectsList.length > 0 ? (
                stats.activeProjectsList.slice(0, 4).map((project: any) => (
                  <div key={project.id} className="group p-3 rounded-xl bg-slate-50 border border-transparent active:scale-[0.98] transition-all">
                    <h4 className="font-bold text-slate-700 text-xs md:text-sm truncate">{project.name}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-slate-400 truncate flex-1 mr-2">{project.description || 'Tidak ada deskripsi'}</p>
                      <ChevronRight className="w-3 h-3 text-slate-300" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-xs text-slate-400 py-4">Kosong</p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Project Activity Monitor - Only for Admin */}
{isAdmin && projectActivity && (
  <div className="space-y-8 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
    {/* Header Section */}
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest mb-3">
          <Activity className="w-3 h-3" /> Admin Monitor
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Aktivitas Project</h2>
        <p className="text-slate-500 mt-1">Monitoring real-time performa laporan per project</p>
      </div>
      
      {/* Modern Period Switcher */}
      <div className="bg-slate-100/80 backdrop-blur-md p-1.5 rounded-2xl flex gap-1 w-fit border border-white/50 shadow-inner">
        {['7', '30', '90'].map((p) => (
          <button
            key={p}
            onClick={() => setActivityPeriod(p)}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
              activityPeriod === p 
                ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            {p} Hari
          </button>
        ))}
      </div>
    </div>

    {/* Summary Cards - Glass Effect */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        { label: 'Sangat Aktif', val: projectActivity.summary.veryActive, color: 'emerald', icon: TrendingUp },
        { label: 'Aktif', val: projectActivity.summary.active, color: 'blue', icon: Activity },
        { label: 'Kurang Aktif', val: projectActivity.summary.lowActive, color: 'amber', icon: TrendingUp, rotate: true },
        { label: 'Stagnant', val: projectActivity.summary.stagnant, color: 'rose', icon: AlertTriangle },
      ].map((item, i) => (
        <Card key={i} className="group border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 overflow-hidden bg-white">
          <CardContent className="p-0">
            <div className={`h-1 w-full bg-${item.color}-500`} />
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                  <h3 className="text-4xl font-black text-slate-900 mt-1">{item.val}</h3>
                </div>
                <div className={`w-12 h-12 rounded-2xl bg-${item.color}-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                  <item.icon className={`w-6 h-6 text-${item.color}-500 ${item.rotate ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Stagnant Projects Alert - Minimalist Style */}
    {projectActivity.summary.stagnantProjects.length > 0 && (
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-rose-100 to-rose-50 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
        <Card className="relative border border-rose-100 bg-white/80 backdrop-blur-sm rounded-[1.5rem] overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-rose-600 flex items-center gap-2 uppercase tracking-tighter">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              Perlu Perhatian ({projectActivity.summary.stagnantProjects.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
            {projectActivity.summary.stagnantProjects.slice(0, 6).map((project) => (
              <div key={project.id} className="group/item p-4 bg-slate-50/50 hover:bg-white rounded-2xl border border-transparent hover:border-rose-100 hover:shadow-md transition-all duration-300">
                <h4 className="font-bold text-slate-800 line-clamp-1">{project.name}</h4>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold uppercase italic text-slate-500">
                    {project.pic?.substring(0, 2) || '??'}
                  </div>
                  <p className="text-xs text-slate-500 font-medium">{project.pic || 'No PIC'}</p>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">
                    {project.daysSinceLastReport} Hari Vacuum
                  </span>
                  <span className="text-[10px] font-medium text-slate-400">{project.reportCount} lap.</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )}

    {/* Top Active Projects Table - Clean Professional */}
    <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.04)] rounded-[2rem] overflow-hidden bg-white">
      <CardHeader className="px-8 pt-8">
        <CardTitle className="text-xl font-black text-slate-800">
          Rank Activity <span className="text-slate-300 font-light ml-2">/ {activityPeriod} Days</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project Name</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-widest">PIC</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Activity</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Issues</th>
                <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Update</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody>
              {projectActivity.projects
                .sort((a, b) => b.reportCount - a.reportCount)
                .slice(0, 10)
                .map((project) => (
                  <tr key={project.id} className="group hover:scale-[1.005] transition-all duration-300">
                    <td className="px-6 py-4 bg-slate-50 group-hover:bg-slate-100/50 rounded-l-2xl transition-colors">
                      <p className="font-bold text-slate-800">{project.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{project.status}</p>
                    </td>
                    <td className="px-6 py-4 bg-slate-50 group-hover:bg-slate-100/50 transition-colors text-sm text-slate-600 font-medium">
                      {project.pic || '-'}
                    </td>
                    <td className="px-6 py-4 bg-slate-50 group-hover:bg-slate-100/50 transition-colors text-center">
                      <span className="text-lg font-black text-slate-900">{project.reportCount}</span>
                    </td>
                    <td className="px-6 py-4 bg-slate-50 group-hover:bg-slate-100/50 transition-colors text-center">
                      <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${project.kendalaCount > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-200/50 text-slate-400'}`}>
                        {project.kendalaCount}
                      </div>
                    </td>
                    <td className="px-6 py-4 bg-slate-50 group-hover:bg-slate-100/50 transition-colors text-center text-xs text-slate-500 font-medium">
                      {project.lastReportDate ? `${project.daysSinceLastReport}d ago` : 'Empty'}
                    </td>
                    <td className="px-6 py-4 bg-slate-50 group-hover:bg-slate-100/50 rounded-r-2xl transition-colors text-right">
                      <span 
                        className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter shadow-sm"
                        style={{ 
                          backgroundColor: getActivityColor(project.activityLevel) + '10',
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

      {/* Realtime Reports Monitor - Only for Admin */}
      {isAdmin && (
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
    <Card className="relative overflow-hidden border-none shadow-lg shadow-slate-200/40">
      <CardContent className="p-3 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="order-2 md:order-1">
            <p className="text-[9px] md:text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">{title}</p>
            <h3 className="text-lg md:text-3xl font-black text-slate-800 mt-0.5 md:mt-1 tracking-tight">{value}</h3>
          </div>
          <div className={`order-1 md:order-2 w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white shadow-sm`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
