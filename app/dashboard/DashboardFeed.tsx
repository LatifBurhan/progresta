'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Edit, 
  Trash2, 
  Filter,
  Users,
  Building,
  Search,
  X
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import ReportCard from './ReportCard'
import DeleteReportModal from './DeleteReportModal'

interface Report {
  id: string
  userId: string
  reportDate: string
  reportTime: string
  period: string
  location: string
  hasIssue: boolean
  issueDesc: string | null
  totalHours: number
  user: {
    email: string
    profile: {
      name: string | null
      fotoProfil: string | null
    } | null
    division: {
      name: string
      color: string
    } | null
  }
  reportDetails: Array<{
    id: string
    task: string
    progress: string
    evidence: string | null
    hoursSpent: number
    project: {
      name: string
    }
  }>
}

interface DashboardFeedProps {
  userId: string
  userRole: string
  userDivisionId?: string
}
export default function DashboardFeed({ userId, userRole, userDivisionId }: DashboardFeedProps) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'my-division' | 'all-divisions'>('all-divisions')
  const [selectedDivision, setSelectedDivision] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [divisions, setDivisions] = useState<Array<{id: string, name: string, color: string}>>([])
  const [projects, setProjects] = useState<Array<{id: string, name: string}>>([])
  const [deleteModal, setDeleteModal] = useState<{open: boolean, reportId: string | null}>({
    open: false,
    reportId: null
  })

  const canSeeAllDivisions = true

  const fetchReports = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        userId,
        filter: canSeeAllDivisions && filter === 'all-divisions' ? 'all' : 'division',
        divisionId: selectedDivision !== 'all' ? selectedDivision : '',
        search: searchQuery,
        projectId: selectedProject !== 'all' ? selectedProject : ''
      })

      const response = await fetch(`/api/reports/feed?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setReports(data.reports)
        if (data.divisions) {
          setDivisions(data.divisions)
        }
        if (data.projects) {
          setProjects(data.projects)
        }
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDivisions = async () => {
    try {
      const response = await fetch('/api/divisions')
      const data = await response.json()
      if (data.success) {
        setDivisions(data.divisions)
      }
    } catch (error) {
      console.error('Failed to fetch divisions:', error)
    }
  }

  useEffect(() => {
    fetchReports()
    fetchDivisions()
  }, [filter, selectedDivision, searchQuery, selectedProject])

  const handleDeleteReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        setReports(reports.filter(r => r.id !== reportId))
        setDeleteModal({ open: false, reportId: null })
        // Refresh attendance data
        window.location.reload()
      } else {
        alert(data.message || 'Gagal menghapus laporan')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Terjadi kesalahan saat menghapus laporan')
    }
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }).format(new Date(dateString))
  }

  const formatTime = (timeString: string) => {
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timeString))
  }
  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Filter Controls */}
      <div className="mb-6 space-y-4">
        {/* Division Toggle for Regular Users */}
        {!canSeeAllDivisions && (
          <div className="flex gap-2">
            <Button
              variant={filter === 'my-division' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('my-division')}
              className="flex items-center gap-2"
            >
              <Building className="w-4 h-4" />
              Divisi Saya
            </Button>
            <Button
              variant={filter === 'all-divisions' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all-divisions')}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Semua Divisi
            </Button>
          </div>
        )}

        {/* Advanced Filters for PM/CEO/HRD */}
        {canSeeAllDivisions && (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari nama karyawan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Division Filter */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter Divisi:</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge
                  variant={selectedDivision === 'all' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSelectedDivision('all')}
                >
                  Semua
                </Badge>
                {divisions.map((division) => (
                  <Badge
                    key={division.id}
                    variant={selectedDivision === division.id ? 'default' : 'outline'}
                    className="cursor-pointer"
                    style={{
                      backgroundColor: selectedDivision === division.id ? division.color : undefined,
                      borderColor: division.color
                    }}
                    onClick={() => setSelectedDivision(division.id)}
                  >
                    {division.name}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Project Filter */}
            {projects.length > 0 && (
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filter Project:</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge
                    variant={selectedProject === 'all' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedProject('all')}
                  >
                    Semua Project
                  </Badge>
                  {projects.slice(0, 10).map((project) => (
                    <Badge
                      key={project.id}
                      variant={selectedProject === project.id ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => setSelectedProject(project.id)}
                    >
                      {project.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Division Filter for PM/CEO/HRD */}
        {canSeeAllDivisions && false && (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filter Divisi:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Badge
                variant={selectedDivision === 'all' ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setSelectedDivision('all')}
              >
                Semua
              </Badge>
              {divisions.map((division) => (
                <Badge
                  key={division.id}
                  variant={selectedDivision === division.id ? 'default' : 'outline'}
                  className="cursor-pointer"
                  style={{
                    backgroundColor: selectedDivision === division.id ? division.color : undefined,
                    borderColor: division.color
                  }}
                  onClick={() => setSelectedDivision(division.id)}
                >
                  {division.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reports Feed */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Belum Ada Laporan
            </h3>
            <p className="text-gray-600">
              {filter === 'my-division' 
                ? 'Belum ada laporan dari divisi Anda hari ini'
                : 'Belum ada laporan dari divisi yang dipilih'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              currentUserId={userId}
              onDelete={(reportId) => setDeleteModal({ open: true, reportId })}
              formatDate={formatDate}
              formatTime={formatTime}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteReportModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, reportId: null })}
        onConfirm={() => deleteModal.reportId && handleDeleteReport(deleteModal.reportId)}
      />
    </div>
  )
}
