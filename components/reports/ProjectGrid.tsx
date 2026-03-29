'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Circle, Users, Calendar, Clock, ArrowRight, briefcase } from 'lucide-react'
import type { Project } from '@/types/report'
import { useToast } from '@/components/ui/use-toast'

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

  const handleProjectClick = (projectId: string) => {
    router.push(`/dashboard/reports?view=history&project_id=${projectId}`)
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 md:h-64 bg-slate-50 border border-slate-100 rounded-2xl md:rounded-[2rem] animate-pulse"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
      {projects.map((project) => {
        const isCompleted = completedProjects.has(project.id)
        const canEdit = currentUserId === project.createdBy
        
        return (
          <div
            key={project.id}
            onClick={() => handleProjectClick(project.id)}
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
            <div className={`hidden md:block absolute top-0 left-0 right-0 h-1.5 transition-colors ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>

            {/* Mobile: Left Icon/Status */}
            <div className="flex md:hidden mr-3 flex-shrink-0">
              <button
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
              <div className="flex justify-between items-start">
                <h3 className={`text-sm md:text-lg font-black text-slate-900 leading-tight truncate md:whitespace-normal md:line-clamp-2 transition-colors ${isCompleted ? 'text-slate-500' : 'group-hover:text-blue-600'}`}>
                  {project.name}
                </h3>
                
                {/* Desktop: Right Status Toggle */}
                <button
                  onClick={(e) => canEdit && handleToggleComplete(e, project)}
                  className={`hidden md:block p-2 rounded-xl transition-all ${canEdit ? 'hover:bg-slate-100' : 'opacity-20 cursor-not-allowed'}`}
                >
                  {isCompleted 
                    ? <CheckCircle2 className="w-7 h-7 text-emerald-500 fill-emerald-50" /> 
                    : <Circle className="w-7 h-7 text-slate-200 group-hover:text-blue-400" />
                  }
                </button>
              </div>

              {/* Description: Hidden/Short on Mobile */}
              <p className="text-[11px] md:text-sm text-slate-500 font-medium line-clamp-1 md:line-clamp-2 mt-0.5 md:mt-3 leading-relaxed">
                {project.description || 'Proyek pengerjaan rutin tim Al-Wustho.'}
              </p>

              {/* Stats & Meta (Desktop Grid, Mobile Row) */}
              <div className="flex md:grid md:grid-cols-2 flex-wrap items-center gap-x-4 gap-y-2 mt-2 md:mt-6">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Users className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="text-[9px] md:text-[11px] font-bold uppercase tracking-wider truncate max-w-[80px]">
                    {project.team || 'Personal'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="text-[9px] md:text-[11px] font-bold uppercase tracking-wider">
                    {project.duration || 'Flexible'}
                  </span>
                </div>
                <div className="hidden md:flex items-center gap-1.5 text-slate-400 col-span-2 border-t border-slate-50 pt-3 mt-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-[11px] font-bold uppercase tracking-wider">
                    {isCompleted ? `Selesai: ${project.lastReportDate}` : 'Project Berjalan'}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Bottom Action & Badges */}
            <div className="hidden md:flex mt-auto pt-6 w-full items-center justify-between">
              <div className="flex gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                  isCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                }`}>
                  {isCompleted ? 'Finished' : (project.urgency || 'Ongoing')}
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
      })}
    </div>
  )
}