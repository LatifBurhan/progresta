'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { 
  FolderOpen, 
  Building, 
  Calendar,
  Clock,
  FileText,
  Search,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Eye,
  EyeOff,
  CalendarDays
} from 'lucide-react'
import CreateProjectModal from './CreateProjectModal'
import EditProjectModal from './EditProjectModal'
import DeleteProjectModal from './DeleteProjectModal'

interface Project {
  id: string
  name: string
  description: string | null
  createdAt: string
  updatedAt: string
  startDate: string | null
  endDate: string | null
  isActive: boolean
  divisionId: string
  division: {
    name: string
    color: string | null
  }
  reportCount: number
}

interface Division {
  id: string
  name: string
  description: string | null
  color: string | null
  isActive: boolean
}

interface ProjectManagementClientProps {
  projects: Project[]
  divisions: Division[]
  currentUserRole: string
}

export default function ProjectManagementClient({ 
  projects: initialProjects, 
  divisions,
  currentUserRole 
}: ProjectManagementClientProps) {
  const [projects, setProjects] = useState(initialProjects)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [divisionFilter, setDivisionFilter] = useState<string>('all')
  const [createModal, setCreateModal] = useState(false)
  const [editModal, setEditModal] = useState<{
    open: boolean
    project: Project | null
  }>({ open: false, project: null })
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean
    project: Project | null
  }>({ open: false, project: null })

  const handleCreateSuccess = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev])
    setCreateModal(false)
  }

  const handleEditSuccess = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    ))
    setEditModal({ open: false, project: null })
  }

  const handleDeleteSuccess = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId))
    setDeleteModal({ open: false, project: null })
  }

  const handleToggleStatus = async (projectId: string, newStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/projects/toggle', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, isActive: newStatus })
      })

      const result = await response.json()
      
      if (result.success) {
        setProjects(prev => prev.map(p => 
          p.id === projectId ? { ...p, isActive: newStatus } : p
        ))
        alert(`Project berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}!`)
      } else {
        alert(result.message || 'Gagal mengubah status project')
      }
    } catch (error) {
      console.error('Toggle project status error:', error)
      alert('Terjadi kesalahan saat mengubah status project')
    }
  }

  const calculateDuration = (startDate: string | null, endDate: string | null) => {
    if (!startDate || !endDate) return null
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  const getProjectStatus = (project: Project) => {
    if (!project.isActive) return { label: '❌ Non-Aktif', color: 'bg-red-100 text-red-800' }
    
    if (!project.startDate || !project.endDate) {
      return { label: '📋 Draft', color: 'bg-gray-100 text-gray-800' }
    }
    
    const now = new Date()
    const start = new Date(project.startDate)
    const end = new Date(project.endDate)
    
    if (now < start) {
      return { label: '⏳ Belum Dimulai', color: 'bg-blue-100 text-blue-800' }
    } else if (now > end) {
      return { label: '✅ Selesai', color: 'bg-green-100 text-green-800' }
    } else {
      return { label: '🚀 Sedang Berjalan', color: 'bg-yellow-100 text-yellow-800' }
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.division.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         false
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && project.isActive) ||
                         (statusFilter === 'inactive' && !project.isActive)
    
    const matchesDivision = divisionFilter === 'all' || project.divisionId === divisionFilter
    
    return matchesSearch && matchesStatus && matchesDivision
  })

  const canEditProject = () => {
    // PM, HRD, CEO, ADMIN can edit projects
    return ['PM', 'HRD', 'CEO', 'ADMIN'].includes(currentUserRole)
  }

  const canDeleteProject = (project: Project) => {
    // Only ADMIN can delete projects, and only if no reports
    return currentUserRole === 'ADMIN' && project.reportCount === 0
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link href="/admin/projects">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Project</h1>
          </div>
          <p className="text-gray-600">
            Kelola project perusahaan, timeline, dan assignment divisi
          </p>
        </div>
        {canEditProject() && (
          <Button 
            onClick={() => setCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Project
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari nama project, deskripsi, atau divisi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Status Filter */}
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                Semua
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('active')}
              >
                Aktif
              </Button>
              <Button
                variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('inactive')}
              >
                Non-Aktif
              </Button>
            </div>

            {/* Division Filter */}
            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Semua Divisi</option>
              {divisions.map((division) => (
                <option key={division.id} value={division.id}>
                  {division.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Projects List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Daftar Project ({filteredProjects.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProjects.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada project yang ditemukan</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => {
                const status = getProjectStatus(project)
                const duration = calculateDuration(project.startDate, project.endDate)
                
                return (
                  <Card key={project.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      {/* Project Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                            style={{ backgroundColor: project.division.color || '#3B82F6' }}
                          >
                            {project.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 line-clamp-1">{project.name}</h3>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Building className="w-3 h-3" />
                              <span>{project.division.name}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="mb-3">
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                      </div>

                      {/* Description */}
                      {project.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {project.description}
                        </p>
                      )}

                      {/* Timeline */}
                      <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>Mulai: {formatDate(project.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4" />
                          <span>Selesai: {formatDate(project.endDate)}</span>
                        </div>
                        {duration && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium text-blue-600">
                              {duration} hari pengerjaan
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex gap-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{project.reportCount} Laporan</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2 border-t">
                        {canEditProject() && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditModal({ open: true, project })}
                            className="flex-1"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        )}
                        
                        {canEditProject() && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(project.id, !project.isActive)}
                            className={project.isActive 
                              ? "text-orange-600 hover:text-orange-700" 
                              : "text-green-600 hover:text-green-700"
                            }
                          >
                            {project.isActive ? (
                              <>
                                <EyeOff className="w-3 h-3 mr-1" />
                                Nonaktif
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3 mr-1" />
                                Aktifkan
                              </>
                            )}
                          </Button>
                        )}

                        {canDeleteProject(project) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteModal({ open: true, project })}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>

                      {/* Delete Warning */}
                      {project.reportCount > 0 && (
                        <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                          ⚠️ Tidak dapat dihapus (ada laporan)
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateProjectModal
        open={createModal}
        divisions={divisions}
        onClose={() => setCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditProjectModal
        open={editModal.open}
        project={editModal.project}
        divisions={divisions}
        onClose={() => setEditModal({ open: false, project: null })}
        onSuccess={handleEditSuccess}
      />

      <DeleteProjectModal
        open={deleteModal.open}
        project={deleteModal.project}
        onClose={() => setDeleteModal({ open: false, project: null })}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  )
}