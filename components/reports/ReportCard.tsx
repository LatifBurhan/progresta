'use client'

import { useState } from 'react'
import { Edit, Trash2, MapPin, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { ProjectReportWithDetails } from '@/types/report'

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
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    } catch {
      return dateString
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        {/* Header: Date and Actions */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              {formatDate(report.created_at)}
            </p>
            <h3 className="font-semibold text-lg mt-1">{report.project_name}</h3>
          </div>
          
          <div className="flex gap-2">
            {report.can_edit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(report.id)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            {report.can_delete && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(report.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* User Name (for admin view) */}
        {isAdmin && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4" />
            <span>{report.user_name}</span>
          </div>
        )}

        {/* Location */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{report.lokasi_kerja}</span>
        </div>

        {/* Work Description */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Pekerjaan:</p>
          <p className="text-sm whitespace-pre-wrap">{report.pekerjaan_dikerjakan}</p>
        </div>

        {/* Obstacles (if exists) */}
        {report.kendala && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Kendala:</p>
            <p className="text-sm whitespace-pre-wrap text-orange-600">{report.kendala}</p>
          </div>
        )}

        {/* Future Plans (if exists) */}
        {report.rencana_kedepan && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Rencana Kedepan:</p>
            <p className="text-sm whitespace-pre-wrap text-blue-600">{report.rencana_kedepan}</p>
          </div>
        )}

        {/* Photo Thumbnails */}
        {report.foto_urls && report.foto_urls.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Foto:</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {report.foto_urls.map((url, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onPhotoClick(url, report.foto_urls)}
                  className="aspect-square rounded-lg overflow-hidden border hover:border-primary transition-colors cursor-pointer"
                >
                  <img
                    src={url}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
