'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ReportCard } from './ReportCard'
import { PhotoViewer } from './PhotoViewer'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import type { ProjectReportWithDetails } from '@/types/report'
import { Loader2, Inbox, AlertCircle, Trash2, RotateCw, Plus } from 'lucide-react'
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
  
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false)
  const [currentPhotos, setCurrentPhotos] = useState<string[]>([])
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  
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
      if (projectId) params.append('project_id', projectId)
      
      const res = await fetch(`/api/reports/list?${params.toString()}`)
      const data = await res.json()
      
      if (data.success) {
        setReports(data.data?.reports || [])
      } else {
        throw new Error('Gagal mengambil data')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat riwayat laporan',
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
        toast({ title: 'Berhasil', description: 'Laporan telah dihapus' })
        loadReports()
      } else {
        throw new Error(data.error || 'Gagal menghapus')
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
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
    <div className="-m-4 sm:-m-8 pb-24 text-slate-900 bg-[#F8FAFC] min-h-screen">
      
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#F8FAFC] border-b border-slate-200/60 px-4 py-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-black uppercase tracking-tight text-slate-800 leading-none mb-1">
              Riwayat Laporan
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {reports.length} Laporan Aktivitas
              </span>
            </div>
          </div>

          <Button 
            onClick={() => router.push('/dashboard/reports?view=create')}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 font-bold text-xs"
          >
            <Plus className="w-4 h-4 mr-1" />
            Buat Laporan
          </Button>
        </div>
      </div>

      {/* Reports List Area */}
      <div className="px-4 space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
          <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Belum ada aktivitas</p>
        </div>
      ) : (
        reports.map((report) => (
          <div key={report.id} className="group">
            <ReportCard
              report={report}
              isAdmin={isAdmin}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              onPhotoClick={handlePhotoClick}
            />
          </div>
        ))
      )}
      </div>

      {/* Photo Viewer */}
      <PhotoViewer
        photos={currentPhotos}
        initialIndex={currentPhotoIndex}
        open={photoViewerOpen}
        onClose={() => setPhotoViewerOpen(false)}
      />

      {/* Delete Dialog Makeover */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-[2rem] border-none shadow-2xl p-8" aria-describedby="delete-dialog-description">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-2">
              <Trash2 className="w-8 h-8" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Hapus Laporan?</DialogTitle>
              <DialogDescription id="delete-dialog-description" className="text-slate-500 font-medium pt-2">
                Tindakan ini permanen. Data laporan yang dihapus tidak dapat dikembalikan oleh sistem.
              </DialogDescription>
            </DialogHeader>
          </div>
          
          <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-8">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
              className="flex-1 h-12 rounded-xl border-slate-200 font-bold text-slate-500 order-2 sm:order-1"
            >
              Batalkan
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="flex-1 h-12 rounded-xl bg-rose-500 hover:bg-rose-600 font-bold shadow-lg shadow-rose-100 order-1 sm:order-2"
            >
              {deleting ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menghapus</>
              ) : (
                'Ya, Hapus'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}