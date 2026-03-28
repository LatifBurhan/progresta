'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Circle, Users, Calendar, Clock } from 'lucide-react'
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
    e.stopPropagation() // Prevent card click
    
    // Check if current user is the creator
    if (currentUserId !== project.createdBy) {
      toast({
        title: 'Tidak Diizinkan',
        description: 'Hanya pembuat project yang dapat mengubah status',
        variant: 'destructive'
      })
      return
    }

    const isCompleted = completedProjects.has(project.id)
    
    try {
      // Call API to update project completion status
      const res = await fetch(`/api/projects/${project.id}/complete`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isCompleted: !isCompleted })
      })

      const data = await res.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to update project')
      }
      
      // Update local state
      setCompletedProjects(prev => {
        const newSet = new Set(prev)
        if (isCompleted) {
          newSet.delete(project.id)
        } else {
          newSet.add(project.id)
        }
        return newSet
      })

      toast({
        title: 'Berhasil',
        description: isCompleted ? 'Project ditandai belum selesai' : 'Project ditandai selesai'
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal mengubah status project',
        variant: 'destructive'
      })
    }
  }

  const getUrgencyColor = (urgency?: 'low' | 'medium' | 'high', isCompleted?: boolean) => {
    if (isCompleted) {
      return {
        bg: 'from-green-50 to-green-100',
        border: 'border-green-200',
        text: 'text-green-700',
        badge: 'bg-green-200 text-green-700',
        icon: 'text-green-600'
      }
    }

    switch (urgency) {
      case 'high':
        return {
          bg: 'from-red-50 to-red-100',
          border: 'border-red-200',
          text: 'text-red-700',
          badge: 'bg-red-200 text-red-700',
          icon: 'text-red-600'
        }
      case 'medium':
        return {
          bg: 'from-orange-50 to-orange-100',
          border: 'border-orange-200',
          text: 'text-orange-700',
          badge: 'bg-orange-200 text-orange-700',
          icon: 'text-orange-600'
        }
      case 'low':
      default:
        return {
          bg: 'from-blue-50 to-blue-100',
          border: 'border-blue-200',
          text: 'text-blue-700',
          badge: 'bg-blue-200 text-blue-700',
          icon: 'text-blue-600'
        }
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white border rounded-lg p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Project Cards */}
      {projects.map((project) => {
        const isCompleted = completedProjects.has(project.id)
        const canEdit = currentUserId === project.createdBy
        const color = getUrgencyColor(project.urgency, isCompleted)

        return (
          <button
            key={project.id}
            onClick={() => handleProjectClick(project.id)}
            className={`bg-gradient-to-br ${color.bg} border-2 ${color.border} rounded-lg p-6 text-left hover:shadow-lg transition-all hover:scale-105 group relative`}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className={`text-lg font-bold text-gray-900 group-hover:${color.text} transition-colors line-clamp-2 pr-2`}>
                {project.name}
              </h3>
              <button
                onClick={(e) => canEdit && handleToggleComplete(e, project)}
                className={`flex-shrink-0 ${canEdit ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed opacity-50'} transition-transform`}
                title={canEdit ? 'Klik untuk ubah status' : 'Hanya pembuat project yang bisa mengubah status'}
              >
                {isCompleted ? (
                  <CheckCircle2 className={`w-6 h-6 ${color.icon}`} />
                ) : (
                  <Circle className={`w-6 h-6 ${color.icon}`} />
                )}
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
              {project.description || 'Proyek yang telah selesai dikerjakan'}
            </p>

            <div className="space-y-2 mb-4">
              {project.team && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>{project.team}</span>
                </div>
              )}
              
              {project.lastReportDate && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>Selesai: {project.lastReportDate}</span>
                </div>
              )}
              
              {project.duration && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Durasi: {project.duration}</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {isCompleted && (
                <span className="px-2 py-1 bg-green-200 text-green-700 rounded text-xs font-medium">
                  ✓ Selesai
                </span>
              )}
              {project.urgency && (
                <span className={`px-2 py-1 ${color.badge} rounded text-xs font-medium`}>
                  {project.urgency === 'high' && '🔴 Urgent'}
                  {project.urgency === 'medium' && '🟡 Sedang'}
                  {project.urgency === 'low' && '🟢 Rendah'}
                </span>
              )}
              {project.tags && project.tags.map((tag, idx) => (
                <span key={idx} className={`px-2 py-1 ${color.badge} rounded text-xs font-medium`}>
                  {tag}
                </span>
              ))}
            </div>
          </button>
        )
      })}
    </div>
  )
}
