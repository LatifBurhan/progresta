'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle, Wrench, Camera, MoreVertical, Briefcase, Edit } from 'lucide-react'
import type { ProjectReportWithDetails } from '@/types/report'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface ReportCardProps {
  report: ProjectReportWithDetails
  isAdmin: boolean
  onEdit: (reportId: string) => void
  onDelete: (reportId: string) => void
  onPhotoClick: (photoUrl: string, allPhotos: string[]) => void
}

export function ReportCard({
  report,
  isAdmin,
  onEdit,
  onDelete,
  onPhotoClick
}: ReportCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    } catch {
      return dateString
    }
  }

  // Parse photos - handle both array and JSON string
  let photos: string[] = []
  try {
    // API returns foto_urls
    const photoData = report.foto_urls
    if (Array.isArray(photoData)) {
      photos = photoData
    } else if (typeof photoData === 'string') {
      photos = JSON.parse(photoData)
    }
  } catch (e) {
    console.error('Error parsing photos:', e)
    photos = []
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-900 mb-1">{report.project_name}</h3>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span>{formatDate(report.created_at)}</span>
            <span>•</span>
            <span>{report.user_name || 'Unknown User'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            report.lokasi_kerja === 'Al-Wustho' ? 'bg-orange-100 text-orange-700' :
            report.lokasi_kerja === 'WFA' ? 'bg-blue-100 text-blue-700' :
            'bg-green-100 text-green-700'
          }`}>
            {report.lokasi_kerja}
          </span>
          {(report.can_edit || report.can_delete) && (
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button 
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {report.can_edit && (
                  <DropdownMenuItem 
                    onClick={() => {
                      setMenuOpen(false)
                      onEdit(report.id)
                    }}
                    className="cursor-pointer"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Laporan
                  </DropdownMenuItem>
                )}
                {report.can_delete && (
                  <DropdownMenuItem 
                    onClick={() => {
                      setMenuOpen(false)
                      onDelete(report.id)
                    }}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus Laporan
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Pekerjaan Section - GREEN */}
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg mb-4">
        <div className="flex items-start gap-2">
          <Briefcase className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-green-900 mb-1">Pekerjaan</h4>
            <p className="text-sm text-green-700 leading-relaxed">{report.pekerjaan_dikerjakan}</p>
          </div>
        </div>
      </div>

      {/* Kendala Section - RED */}
      {report.kendala && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-red-900 mb-1">Kendala</h4>
              <p className="text-sm text-red-700 leading-relaxed">{report.kendala}</p>
            </div>
          </div>
        </div>
      )}

      {/* Rencana Section - BLUE */}
      {report.rencana_kedepan && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-4">
          <div className="flex items-start gap-2">
            <Wrench className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-bold text-blue-900 mb-1">Rencana</h4>
              <p className="text-sm text-blue-700 leading-relaxed">{report.rencana_kedepan}</p>
            </div>
          </div>
        </div>
      )}

      {/* Photos Section */}
      {photos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Camera className="w-4 h-4 text-slate-500" />
            <h4 className="text-sm font-semibold text-slate-700">Dokumentasi</h4>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => onPhotoClick(photo, photos)}
                className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 hover:opacity-90 transition-opacity group"
              >
                <img
                  src={photo}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Image load error:', photo)
                    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
