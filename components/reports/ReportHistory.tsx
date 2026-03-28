'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ReportCard } from './ReportCard'
import { PhotoViewer } from './PhotoViewer'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import type { ProjectReportWithDetails } from '@/types/report'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ReportHistoryProps {
  isAdmin: boolean
  projectId?: string
}

export function ReportHistory({ isAdmin, projectId = '' }: ReportHistoryProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [reports, setReports] = useState<ProjectReportWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  
  // Photo viewer state
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false)
  const [currentPhotos, setCurrentPhotos] = useState<string[]>([])
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  
  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reportToDelete, setReportToDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadReports()
  }, [projectId])

  const loadReports = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      if (projectId) {
        params.append('project_id', projectId)
      }
      
      const res = await fetch(`/api/reports/list?${params.toString()}`)
      const data = await res.json()
      
      if (data.success) {
        setReports(data.data?.reports || [])
      } else {
        toast({
          title: 'Error',
          description: 'Gagal memuat laporan',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Failed to load reports:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat laporan',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (reportId: string) => {
    router.push(`/dashboard/reports/edit/${reportId}`)
  }

  const handleDeleteClick = (reportId: string) => {
    setReportToDelete(reportId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!reportToDelete) return
    
    setDeleting(true)
    try {
      const res = await fetch(`/api/reports/delete/${reportToDelete}`, {
        method: 'DELETE'
      })
      
      const data = await res.json()
      
      if (data.success) {
        toast({
          title: 'Berhasil',
          description: 'Laporan berhasil dihapus'
        })
        
        // Reload reports
        loadReports()
      } else {
        throw new Error(data.error || 'Gagal menghapus laporan')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal menghapus laporan',
        variant: 'destructive'
      })
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setReportToDelete(null)
    }
  }

  const handlePhotoClick = (photoUrl: string, allPhotos: string[]) => {
    const index = allPhotos.indexOf(photoUrl)
    setCurrentPhotos(allPhotos)
    setCurrentPhotoIndex(index >= 0 ? index : 0)
    setPhotoViewerOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Reports List */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center p-12 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">Belum ada laporan</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map(report => (
            <ReportCard
              key={report.id}
              report={report}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onPhotoClick={handlePhotoClick}
            />
          ))}
        </div>
      )}

      {/* Photo Viewer */}
      <PhotoViewer
        photos={currentPhotos}
        initialIndex={currentPhotoIndex}
        open={photoViewerOpen}
        onClose={() => setPhotoViewerOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Laporan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Menghapus...
                </>
              ) : (
                'Hapus'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
