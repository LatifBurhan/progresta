'use client'

import { Suspense } from 'react'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ReportHistory } from '@/components/reports/ReportHistory'
import { ReportForm } from '@/components/reports/ReportForm'
import { ProjectGrid } from '@/components/reports/ProjectGrid'
import ProjectDetailSection from '@/components/projects/ProjectDetailSection'
import { Loader2, X } from 'lucide-react'
import { Toaster } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import type { Project } from '@/types/report'

function ReportsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = searchParams.get('view')
  const projectId = searchParams.get('project_id') || ''
  const showDetail = searchParams.get('show_detail') === 'true'
  
  const [checking, setChecking] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loadingProjectDetail, setLoadingProjectDetail] = useState(false)

  useEffect(() => {
    checkAuth()
    loadProjects()
  }, [])

  useEffect(() => {
    // Open modal if view=create
    if (view === 'create') {
      setShowModal(true)
    } else {
      setShowModal(false)
    }
  }, [view])

  // Load project detail when projectId changes
  useEffect(() => {
    const loadProjectDetail = async () => {
      if (projectId) {
        console.log('Loading project detail for:', projectId)
        setLoadingProjectDetail(true)
        
        // First check if project is already in projects array
        let project = projects.find(p => p.id === projectId)
        console.log('Project from cache:', project)
        
        // If not found, fetch from API
        if (!project) {
          try {
            console.log('Fetching project from API...')
            const res = await fetch(`/api/admin/projects/${projectId}`)
            const data = await res.json()
            console.log('API response:', data)
            if (data.success && data.project) {
              project = data.project
            }
          } catch (error) {
            console.error('Failed to load project detail:', error)
          }
        }
        
        console.log('Setting selected project:', project)
        setSelectedProject(project || null)
        setLoadingProjectDetail(false)
      } else {
        console.log('No projectId, clearing selected project')
        setSelectedProject(null)
      }
    }

    loadProjectDetail()
  }, [projectId, projects])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check')
      const data = await res.json()
      
      if (!data.authenticated) {
        router.push('/login')
      } else {
        setAuthenticated(true)
        setCurrentUserId(data.user?.id || '')
        // Check if user is admin (ADMIN, HRD, or CEO)
        const adminRoles = ['ADMIN', 'HRD', 'CEO']
        setIsAdmin(adminRoles.includes(data.user?.role))
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    } finally {
      setChecking(false)
    }
  }

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/reports/projects')
      const data = await res.json()
      
      if (data.success) {
        setProjects(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoadingProjects(false)
    }
  }

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1) // Trigger refresh of history
    setShowModal(false)
    router.push('/reports?view=history') // Switch to history view
  }

  const handleFormCancel = () => {
    setShowModal(false)
    router.push('/reports?view=history')
  }

  const handleCloseModal = () => {
    setShowModal(false)
    router.push('/reports?view=history')
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div>
          {projectId && (
            <button
              onClick={() => router.push('/reports?view=history')}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke Daftar Project
            </button>
          )}
          <h1 className="text-3xl font-bold">Riwayat Progres</h1>
          <p className="text-muted-foreground mt-1">
            {projectId 
              ? 'Laporan progres project yang telah dikerjakan'
              : 'Proyek yang telah selesai dikerjakan'
            }
          </p>
        </div>

        {/* Show Project Grid if no projectId selected, otherwise show Report History */}
        {!projectId ? (
          <ProjectGrid projects={projects} loading={loadingProjects} currentUserId={currentUserId} />
        ) : (
          <>
            {/* Project Detail Section */}
            {(() => {
              console.log('Rendering project detail section:', {
                loadingProjectDetail,
                selectedProject,
                projectId
              })
              return null
            })()}
            
            {loadingProjectDetail ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-6 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                <span className="ml-2 text-slate-600">Memuat detail project...</span>
              </div>
            ) : selectedProject ? (
              <ProjectDetailSection project={selectedProject} />
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-yellow-800 text-sm">Debug: Project tidak ditemukan (ID: {projectId})</p>
              </div>
            )}
            
            {/* Report History */}
            <ReportHistory key={refreshKey} isAdmin={isAdmin} projectId={projectId} />
          </>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleCloseModal}
          />
          
          {/* Modal Content */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">Buat Laporan Baru</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseModal}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Modal Body */}
              <div className="flex-1 overflow-auto p-6">
                <ReportForm
                  mode="create"
                  onSuccess={handleFormSuccess}
                  onCancel={handleFormCancel}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Toast Notifications */}
      <Toaster />
    </div>
  )
}

export default function ReportsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <ReportsPageContent />
    </Suspense>
  )
}
