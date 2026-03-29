'use client'

import { X, Calendar, Users, Target, AlertCircle, FileText, Download } from 'lucide-react'
import { useState } from 'react'
import { getFileIcon, formatFileSize } from '@/lib/storage/project-file-upload'

interface Division {
  id: string
  name: string
  color: string
}

interface ProjectDetailModalProps {
  open: boolean
  project: {
    id: string
    name: string
    tujuan?: string
    description?: string
    pic?: string
    prioritas?: string
    tanggal_mulai?: string
    tanggal_selesai?: string
    status?: string
    divisions?: Division[]
    lampiran_files?: string[]
  } | null
  onClose: () => void
}

export default function ProjectDetailModal({
  open,
  project,
  onClose
}: ProjectDetailModalProps) {
  if (!open || !project) return null

  // Extract filename from URL
  function extractFileNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      const fileName = pathParts[pathParts.length - 1]
      return decodeURIComponent(fileName)
    } catch {
      return 'file'
    }
  }

  // Format date to Indonesian format
  function formatDate(dateString?: string): string {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                {project.name}
              </h2>
              {project.status && (
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  project.status.toLowerCase() === 'aktif' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {project.status}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0 ml-4"
            >
              <X className="w-6 h-6 text-slate-500" />
            </button>
          </div>

          {/* Content Grid */}
          <div className="space-y-6">
            {/* Tujuan */}
            {project.tujuan && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">Tujuan Project</h3>
                    <p className="text-blue-800 text-sm leading-relaxed">{project.tujuan}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            {project.description && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-600" />
                  Deskripsi
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">{project.description}</p>
              </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* PIC */}
              {project.pic && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-500 uppercase">PIC</span>
                  </div>
                  <p className="text-slate-900 font-medium">{project.pic}</p>
                </div>
              )}

              {/* Prioritas */}
              {project.prioritas && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-500 uppercase">Prioritas</span>
                  </div>
                  <p className="text-slate-900 font-medium capitalize">{project.prioritas}</p>
                </div>
              )}

              {/* Tanggal Mulai */}
              {project.tanggal_mulai && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-500 uppercase">Tanggal Mulai</span>
                  </div>
                  <p className="text-slate-900 font-medium">{formatDate(project.tanggal_mulai)}</p>
                </div>
              )}

              {/* Tanggal Selesai */}
              {project.tanggal_selesai && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-500 uppercase">Tanggal Selesai</span>
                  </div>
                  <p className="text-slate-900 font-medium">{formatDate(project.tanggal_selesai)}</p>
                </div>
              )}
            </div>

            {/* Divisions */}
            {project.divisions && project.divisions.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-600" />
                  Divisi Terlibat
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.divisions.map((division) => (
                    <span
                      key={division.id}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium"
                      style={{
                        backgroundColor: `${division.color}20`,
                        color: division.color
                      }}
                    >
                      {division.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* File Attachments */}
            {project.lampiran_files && project.lampiran_files.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-600" />
                  File Lampiran ({project.lampiran_files.length})
                </h3>
                <div className="space-y-2">
                  {project.lampiran_files.map((fileUrl, index) => {
                    const fileName = extractFileNameFromUrl(fileUrl)
                    const { icon, color } = getFileIcon(fileName)

                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        {/* File Icon */}
                        <div className={`text-2xl ${color} flex-shrink-0`}>
                          {icon}
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {fileName}
                          </p>
                        </div>

                        {/* Download Button */}
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                          title="Download file"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
