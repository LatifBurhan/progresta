'use client'

import { useState } from 'react'
import { Trash2, AlertCircle, Rocket, MoreVertical, Edit, MapPin, Clock, Calendar } from 'lucide-react'
import Image from 'next/image'
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
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    }).format(date)
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit', minute: '2-digit'
    }).format(date)
  }

  // Parse photos - handle both array and JSON string
  let photos: string[] = []
  try {
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* User Info Header */}
      <div className="p-4 border-b border-slate-50 bg-slate-50/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white shadow-sm bg-white">
              {report.user_foto_profil ? (
                <Image src={report.user_foto_profil} alt="avatar" fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-black text-xs">
                  {(report.user_name || 'U').substring(0,2).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h4 className="font-black text-slate-800 text-[13px] uppercase tracking-tight leading-none mb-1">
                {report.user_name || 'Unknown User'}
              </h4>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="flex items-center gap-1 text-[10px] font-bold">
                  <Calendar className="w-3 h-3" /> {formatDate(report.created_at)}
                </span>
                <span className="text-slate-300 text-[10px]">•</span>
                <span className="flex items-center gap-1 text-[10px] font-bold">
                  <Clock className="w-3 h-3" /> {formatTime(report.created_at)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm shadow-blue-200">
              <MapPin className="w-3 h-3" />
              <span className="text-[10px] font-black uppercase tracking-tighter">{report.lokasi_kerja}</span>
            </div>
            
            {(report.can_edit || report.can_delete) && (
              <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
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
      </div>

      {/* Report Content */}
      <div className="p-4 space-y-4">
        {/* Project Name */}
        <div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Project</span>
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">{report.project_name}</h3>
        </div>

        {/* Pekerjaan Dikerjakan */}
        <div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Pekerjaan Dikerjakan</span>
          <p className="text-[13px] text-slate-700 leading-relaxed font-semibold bg-slate-50 p-3 rounded-xl border border-slate-100">
            {report.pekerjaan_dikerjakan}
          </p>
        </div>

        {/* Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {report.kendala && (
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1 bg-rose-500 rounded-md">
                  <AlertCircle className="w-3 h-3 text-white" />
                </div>
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-wider">Kendala Lapangan</span>
              </div>
              <p className="text-[11px] font-bold text-rose-700 leading-snug">{report.kendala}</p>
            </div>
          )}

          {report.rencana_kedepan && (
            <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="p-1 bg-emerald-500 rounded-md">
                  <Rocket className="w-3 h-3 text-white" />
                </div>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Rencana Lanjut</span>
              </div>
              <p className="text-[11px] font-bold text-emerald-700 leading-snug">{report.rencana_kedepan}</p>
            </div>
          )}
        </div>

        {/* Visual Proof */}
        {photos.length > 0 && (
          <div className="pt-2">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Dokumentasi Visual</span>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => onPhotoClick(photo, photos)}
                  className="group/img relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-200"
                >
                  <Image src={photo} alt="doc" fill className="object-cover group-hover/img:scale-110 transition-transform duration-500" unoptimized />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
