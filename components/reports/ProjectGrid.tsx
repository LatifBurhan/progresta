'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Circle, Users, Clock, ArrowRight, Filter, User } from 'lucide-react'
import type { Project } from '@/types/report'
import { useToast } from '@/components/ui/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ProjectWithStats extends Project {
  reportCount?: number
  lastReportDate?: string
  duration?: string
  team?: string
  tags?: string[]
  isCompleted?: boolean
  urgency?: 'low' | 'medium' | 'high'
  createdBy?: string
}

interface ProjectGridProps {
  projects: ProjectWithStats[]
  loading: boolean
  currentUserId?: string
}

export function ProjectGrid({ projects, loading, currentUserId }: ProjectGridProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [completedProjects, setCompletedProjects] = useState<Set<string>>(
    new Set(projects.filter(p => p.isCompleted).map(p => p.id))
  )
  const [statusFilter, setStatusFilter] = useState<string>('semua')

  // Filter projects based on status
  const filteredProjects = projects.filter(project => {
    if (statusFilter === 'semua') return true
    return project.status?.toLowerCase() === statusFilter.toLowerCase()
  })

  const handleProjectClick = (project: ProjectWithStats, e: React.MouseEvent) => {
    // Check if click is on the completion toggle button
    const target = e.target as HTMLElement
    if (target.closest('button[data-toggle-complete]')) {
      return // Don't navigate if clicking the toggle button
    }
    
    // Navigate to reports page with project filter
    router.push(`/dashboard/reports?view=history&project_id=${project.id}`)
  }

  const handleToggleComplete = async (e: React.MouseEvent, project: ProjectWithStats) => {
    e.stopPropagation() // Mencegah navigasi ke halaman detail
    
    if (currentUserId !== project.createdBy) {
      toast({
        title: 'Akses Terbatas',
        description: 'Hanya pemilik project yang dapat mengubah status.',
        variant: 'destructive'
      })
      return
    }

    const isCompleted = completedProjects.has(project.id)
    
    try {
      const res = await fetch(`/api/projects/${project.id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !isCompleted })
      })

      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      
      setCompletedProjects(prev => {
        const newSet = new Set(prev)
        isCompleted ? newSet.delete(project.id) : newSet.add(project.id)
        return newSet
      })

      toast({
        title: isCompleted ? 'Project Dibuka' : 'Project Selesai',
        description: `${project.name} diperbarui.`
      })
    } catch (error: any) {
      toast({
        title: 'Gagal',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Filter Skeleton */}
        <div className="flex justify-between items-center">
          <div className="h-6 w-32 bg-slate-100 rounded animate-pulse"></div>
          <div className="h-10 w-40 bg-slate-100 rounded-lg animate-pulse"></div>
        </div>
        
        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 md:h-64 bg-slate-50 border border-slate-100 rounded-2xl md:rounded-[2rem] animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  const getFilterLabel = () => {
    switch (statusFilter) {
      case 'aktif': return 'Aktif'
      case 'selesai': return 'Selesai'
      case 'non-aktif': return 'Non-Aktif'
      case 'ditunda': return 'Ditunda'
      case 'dibatalkan': return 'Dibatalkan'
      case 'semua': return 'Semua Project'
      default: return 'Semua Project'
    }
  }

  // Helper function to get team label from divisions
  const getTeamLabel = (project: ProjectWithStats): string => {
    if (project.divisions && project.divisions.length > 0) {
      return project.divisions.length === 1 
        ? project.divisions[0].name 
        : `${project.divisions.length} Divisi`
    }
    return 'Personal'
  }

  // Helper function to get PIC label
  const getPICLabel = (project: ProjectWithStats): string => {
    return project.pic || 'Belum ada PIC'
  }

  // Helper function to get timeline/remaining days
  const getTimelineLabel = (project: ProjectWithStats): string => {
    if (!project.tanggal_selesai) return 'Tidak ada deadline'
    
    const today = new Date()
    const endDate = new Date(project.tanggal_selesai)
    const diffTime = endDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return `Terlambat ${Math.abs(diffDays)} hari`
    if (diffDays === 0) return 'Deadline hari ini'
    if (diffDays === 1) return 'Deadline besok'
    if (diffDays < 7) return `${diffDays} hari lagi`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} minggu lagi`
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} bulan lagi`
    return `${Math.ceil(diffDays / 365)} tahun lagi`
  }



  // Helper function to get urgency/priority badge
  const getUrgencyBadge = (project: ProjectWithStats): { label: string; color: string } => {
    const isCompleted = completedProjects.has(project.id)
    
    if (isCompleted) {
      return { label: 'Finished', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' }
    }
    
    // Use prioritas from database
    const priority = project.prioritas?.toLowerCase()
    
    switch (priority) {
      case 'urgent':
        return { label: 'Urgent', color: 'bg-red-50 text-red-600 border-red-100' }
      case 'tinggi':
      case 'high':
        return { label: 'High', color: 'bg-orange-50 text-orange-600 border-orange-100' }
      case 'sedang':
      case 'medium':
        return { label: 'Medium', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' }
      case 'rendah':
      case 'low':
        return { label: 'Low', color: 'bg-blue-50 text-blue-600 border-blue-100' }
      default:
        return { label: 'Ongoing', color: 'bg-slate-50 text-slate-600 border-slate-100' }
    }
  }

  // Helper function to get status color
  const getStatusColor = (project: ProjectWithStats): string => {
    const status = project.status?.toLowerCase()
    
    switch (status) {
      case 'aktif':
        return 'bg-blue-500'
      case 'selesai':
        return 'bg-emerald-500'
      case 'non-aktif':
      case 'non aktif':
        return 'bg-orange-500'
      case 'ditunda':
        return 'bg-red-500'
      case 'dibatalkan':
        return 'bg-red-600'
      default:
        return 'bg-blue-500' // Default blue for active
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter Header */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-600">
          Menampilkan <span className="font-bold text-slate-900">{filteredProjects.length}</span> project
        </p>
        
        {/* Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Filter className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">{getFilterLabel()}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem 
              onClick={() => setStatusFilter('semua')}
              className={`cursor-pointer ${statusFilter === 'semua' ? 'bg-slate-50 text-slate-700 font-semibold' : ''}`}
            >
              <Users className="w-4 h-4 mr-2 text-slate-500" />
              Semua Project
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setStatusFilter('aktif')}
              className={`cursor-pointer ${statusFilter === 'aktif' ? 'bg-blue-50 text-blue-700 font-semibold' : ''}`}
            >
              <Circle className="w-4 h-4 mr-2 text-blue-500" />
              Aktif
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setStatusFilter('selesai')}
              className={`cursor-pointer ${statusFilter === 'selesai' ? 'bg-emerald-50 text-emerald-700 font-semibold' : ''}`}
            >
              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" />
              Selesai
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setStatusFilter('non-aktif')}
              className={`cursor-pointer ${statusFilter === 'non-aktif' ? 'bg-orange-50 text-orange-700 font-semibold' : ''}`}
            >
              <Circle className="w-4 h-4 mr-2 text-orange-500" />
              Non-Aktif
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setStatusFilter('ditunda')}
              className={`cursor-pointer ${statusFilter === 'ditunda' ? 'bg-red-50 text-red-700 font-semibold' : ''}`}
            >
              <Clock className="w-4 h-4 mr-2 text-red-500" />
              Ditunda
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setStatusFilter('dibatalkan')}
              className={`cursor-pointer ${statusFilter === 'dibatalkan' ? 'bg-red-50 text-red-900 font-semibold' : ''}`}
            >
              <Circle className="w-4 h-4 mr-2 text-red-600" />
              Dibatalkan
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {statusFilter === 'aktif' && <Circle className="w-8 h-8 text-blue-300" />}
              {statusFilter === 'selesai' && <CheckCircle2 className="w-8 h-8 text-emerald-300" />}
              {statusFilter === 'non-aktif' && <Circle className="w-8 h-8 text-orange-300" />}
              {statusFilter === 'ditunda' && <Clock className="w-8 h-8 text-red-300" />}
              {statusFilter === 'dibatalkan' && <Circle className="w-8 h-8 text-red-400" />}
              {statusFilter === 'semua' && <Users className="w-8 h-8 text-slate-300" />}
            </div>
            <p className="text-slate-500 font-medium">
              {statusFilter === 'aktif' && 'Tidak ada project aktif'}
              {statusFilter === 'selesai' && 'Tidak ada project selesai'}
              {statusFilter === 'non-aktif' && 'Tidak ada project non-aktif'}
              {statusFilter === 'ditunda' && 'Tidak ada project ditunda'}
              {statusFilter === 'dibatalkan' && 'Tidak ada project dibatalkan'}
              {statusFilter === 'semua' && 'Tidak ada project'}
            </p>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const isCompleted = completedProjects.has(project.id)
            const canEdit = currentUserId === project.createdBy
            const teamLabel = getTeamLabel(project)
            const picLabel = getPICLabel(project)
            const timelineLabel = getTimelineLabel(project)
            const urgencyBadge = getUrgencyBadge(project)
            const statusColor = getStatusColor(project)
            
            return (
          <div
            key={project.id}
            onClick={(e) => handleProjectClick(project, e)}
            className={`
              group relative flex md:flex-col items-center md:items-start
              bg-white border border-slate-100 md:border-2 
              rounded-2xl md:rounded-[2rem] 
              p-3 md:p-7 
              transition-all duration-300 hover:shadow-xl md:hover:-translate-y-2 cursor-pointer overflow-hidden
              ${isCompleted ? 'bg-slate-50/50 opacity-80' : 'bg-white shadow-sm'}
            `}
          >
            {/* Desktop Top Accent */}
            <div className={`hidden md:block absolute top-0 left-0 right-0 h-1.5 transition-colors ${statusColor}`}></div>

            {/* Mobile: Left Icon/Status */}
            <div className="flex md:hidden mr-3 flex-shrink-0">
              <button
                data-toggle-complete
                onClick={(e) => canEdit && handleToggleComplete(e, project)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  isCompleted ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-300'
                } ${canEdit ? 'active:scale-90' : 'cursor-not-allowed'}`}
              >
                {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
              </button>
            </div>

            {/* Content Section */}
            <div className="flex-1 min-w-0">
              <h3 className={`text-sm md:text-lg font-black text-slate-900 leading-tight truncate md:whitespace-normal md:line-clamp-2 transition-colors ${isCompleted ? 'text-slate-500' : 'group-hover:text-blue-600'}`}>
                {project.name}
              </h3>

              {/* Description: Hidden/Short on Mobile */}
              <p className="text-[11px] md:text-sm text-slate-500 font-medium line-clamp-1 md:line-clamp-2 mt-0.5 md:mt-3 leading-relaxed">
                {project.description || 'Proyek pengerjaan rutin tim Al-Wustho.'}
              </p>

              {/* Stats & Meta (Desktop Grid, Mobile Row) */}
              <div className="flex md:grid md:grid-cols-2 flex-wrap items-center gap-x-4 gap-y-2 mt-2 md:mt-6">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Users className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="text-[9px] md:text-[11px] font-bold uppercase tracking-wider truncate max-w-[80px]">
                    {teamLabel}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <User className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="text-[9px] md:text-[11px] font-bold tracking-wider truncate max-w-[80px]">
                    {picLabel}
                  </span>
                </div>
                <div className="hidden md:flex items-center gap-1.5 text-slate-400 col-span-2 border-t border-slate-50 pt-3 mt-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-[11px] font-bold tracking-wider">
                    {timelineLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Bottom Action & Badges */}
            <div className="hidden md:flex mt-auto pt-6 w-full items-center justify-between">
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${urgencyBadge.color}`}>
                  {urgencyBadge.label}
                </span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Mobile: Simple Arrow */}
            <div className="md:hidden ml-2 flex-shrink-0">
               <ArrowRight className="w-4 h-4 text-slate-300" />
            </div>

            {/* Glass Shine Effect (Desktop) */}
            <div className="hidden md:block absolute -right-12 -bottom-12 w-32 h-32 bg-slate-100 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
            )
          })
        )}
      </div>
    </div>
  )
}