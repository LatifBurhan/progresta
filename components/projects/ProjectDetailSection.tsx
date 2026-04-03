'use client'

import { Calendar, Users, Target, FileText, Download, Briefcase, Clock, Flag, FolderOpen, Paperclip, Zap } from 'lucide-react'

interface Division {
  id: string
  name: string
  color: string
}

interface User {
  id: string
  name: string | null
  email: string
}

interface ProjectDetailSectionProps {
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
    assignments?: User[]
    lampiran_files?: string[]
  }
}

export default function ProjectDetailSection({ project }: ProjectDetailSectionProps) {
  
  function extractFileNameFromUrl(url: string): string {
    try {
      const fileName = url.split('/').pop() || 'file'
      return decodeURIComponent(fileName)
    } catch { return 'file' }
  }

  function formatDate(dateString?: string): string {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  }

  function formatDateRange(start?: string, end?: string): string {
    if (!start && !end) return '-'
    if (!start) return formatDate(end)
    if (!end) return formatDate(start)
    return `${formatDate(start)} - ${formatDate(end)}`
  }

  function isImageFile(url: string): boolean {
    const ext = url.toLowerCase().split('.').pop()
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext || '')
  }

  const getUrgencyData = (prio?: string) => {
    const p = prio?.toLowerCase()
    if (p === 'urgent') return { color: 'text-rose-600', bg: 'bg-rose-50', icon: <Zap className="w-3.5 h-3.5 md:w-4 md:h-4" /> }
    if (p === 'high' || p === 'tinggi') return { color: 'text-orange-600', bg: 'bg-orange-50', icon: <Flag className="w-3.5 h-3.5 md:w-4 md:h-4" /> }
    return { color: 'text-blue-600', bg: 'bg-blue-50', icon: <Briefcase className="w-3.5 h-3.5 md:w-4 md:h-4" /> }
  }

  const getStatusStyle = (status?: string) => {
    const s = status?.toLowerCase()
    if (s === 'selesai') return 'bg-emerald-500 text-white'
    if (s === 'aktif') return 'bg-blue-600 text-white'
    return 'bg-slate-500 text-white'
  }

  const getDaysInfo = (endDate?: string) => {
    if (!endDate) return { text: 'No Deadline', color: 'text-slate-400', shortText: '-' }
    const diff = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return { text: `Terlambat ${Math.abs(diff)} hari`, color: 'text-rose-600', shortText: `${Math.abs(diff)}d late` }
    if (diff === 0) return { text: 'Deadline Hari Ini', color: 'text-rose-600', shortText: 'Today!' }
    return { text: `${diff} hari lagi`, color: 'text-blue-600', shortText: `${diff}d left` }
  }

  const urgency = getUrgencyData(project.prioritas)
  const daysInfo = getDaysInfo(project.tanggal_selesai)

  return (
    <div className="animate-in fade-in duration-500">
      {/* Single Compact Card */}
      <div className="relative overflow-hidden bg-white border border-slate-200 rounded-2xl md:rounded-3xl shadow-lg">
        {/* Top Border Gradient */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500"></div>
        
        <div className="p-4 md:p-6 space-y-4 md:space-y-5">
          
          {/* 1. Header: Status + ID */}
          <div className="flex items-center justify-between gap-2">
            <span className={`px-2.5 py-1 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-wider ${getStatusStyle(project.status)}`}>
              {project.status || 'Status'}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-[9px] md:text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500">
              ID: {project.id.slice(0, 8)}
            </span>
          </div>

          {/* 2. Title */}
          <h1 className="text-base md:text-lg font-bold text-slate-900 leading-tight">
            {project.name}
          </h1>

          {/* 3. Divisi Tags - BESAR & JELAS */}
          {project.divisions && project.divisions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.divisions.map((div, i) => (
                <div 
                  key={i} 
                  className="px-3 py-1.5 md:px-4 md:py-2 rounded-xl border text-xs md:text-sm font-bold shadow-sm"
                  style={{ 
                    backgroundColor: `${div.color}15`,
                    borderColor: `${div.color}40`,
                    color: div.color 
                  }}
                >
                  {div.name}
                </div>
              ))}
            </div>
          )}

          {/* 4. Key Specifications - Grid 2x2 di Mobile */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[9px] md:text-[10px] uppercase tracking-wider mb-3">
              <Zap className="w-3 h-3 md:w-3.5 md:h-3.5 text-amber-400" /> Key Specifications
            </div>
            
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {/* Penanggung Jawab */}
              <div className="flex items-start gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                  <Users className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-wide">Penanggung Jawab</p>
                  <p className="text-xs md:text-sm font-semibold text-indigo-600 truncate">{project.pic || 'Latif'}</p>
                </div>
              </div>

              {/* Prioritas */}
              <div className="flex items-start gap-2 md:gap-3">
                <div className={`w-8 h-8 md:w-9 md:h-9 rounded-lg ${urgency.bg} flex items-center justify-center ${urgency.color} flex-shrink-0`}>
                  {urgency.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-wide">Prioritas</p>
                  <p className={`text-xs md:text-sm font-semibold truncate ${urgency.color}`}>{project.prioritas || 'Normal'}</p>
                </div>
              </div>

              {/* Tenggat Waktu */}
              <div className="flex items-start gap-2 md:gap-3">
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                  <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-wide">Tenggat Waktu</p>
                  <p className="text-[10px] md:text-xs font-semibold text-slate-600 leading-tight">
                    {formatDateRange(project.tanggal_mulai, project.tanggal_selesai)}
                  </p>
                </div>
              </div>

              {/* Sisa Waktu */}
              <div className="flex items-start gap-2 md:gap-3">
                <div className={`w-8 h-8 md:w-9 md:h-9 rounded-lg ${daysInfo.color === 'text-rose-600' ? 'bg-rose-50' : 'bg-blue-50'} flex items-center justify-center ${daysInfo.color} flex-shrink-0`}>
                  <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-wide">Sisa Waktu</p>
                  <p className={`text-xs md:text-sm font-semibold truncate ${daysInfo.color}`}>{daysInfo.text}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Objective & Context - FULL TEXT */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            {/* Main Objective */}
            <div>
              <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[9px] md:text-[10px] uppercase tracking-wider mb-2">
                <Target className="w-3 h-3 md:w-3.5 md:h-3.5" /> Main Objective
              </div>
              <p className="text-xs md:text-sm text-slate-700 leading-relaxed">
                {project.tujuan || 'Mencapai hasil maksimal dalam pengerjaan proyek strategis.'}
              </p>
            </div>

            {/* Project Context */}
            <div>
              <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[9px] md:text-[10px] uppercase tracking-wider mb-2">
                <FileText className="w-3 h-3 md:w-3.5 md:h-3.5" /> Project Context
              </div>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                {project.description || 'Tidak ada deskripsi tambahan untuk project ini.'}
              </p>
            </div>
          </div>

          {/* 6. Personnel - Compact List */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[9px] md:text-[10px] uppercase tracking-wider">
                <Users className="w-3 h-3 md:w-3.5 md:h-3.5 text-emerald-500" /> Personel Terlibat
              </div>
              <span className="bg-emerald-50 text-emerald-600 text-[8px] md:text-[9px] font-bold px-2 py-0.5 rounded-md">
                {project.assignments && project.assignments.length > 0 
                  ? `${project.assignments.length} Personel` 
                  : 'Semua Divisi'}
              </span>
            </div>

            <div className="space-y-2">
              {project.assignments && project.assignments.length > 0 ? (
                project.assignments.map((user, i) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-2.5 md:gap-3 p-2.5 md:p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs md:text-sm flex-shrink-0">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] md:text-xs font-bold text-slate-900 truncate">
                        {user.name || user.email.split('@')[0]}
                      </p>
                      <p className="text-[9px] md:text-[10px] text-slate-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase">Project terbuka untuk seluruh anggota divisi</p>
                </div>
              )}
            </div>
          </div>

          {/* 7. Assets - With Preview */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold text-[9px] md:text-[10px] uppercase tracking-wider">
                <Paperclip className="w-3 h-3 md:w-3.5 md:h-3.5" /> Assets
              </div>
              <span className="bg-slate-100 text-slate-500 text-[8px] md:text-[9px] font-bold px-2 py-0.5 rounded-md">
                {project.lampiran_files?.length || 0} Files
              </span>
            </div>

            <div className="space-y-2">
              {project.lampiran_files && project.lampiran_files.length > 0 ? (
                project.lampiran_files.map((file, i) => (
                  <a 
                    key={i} 
                    href={file} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-2.5 md:gap-3 p-2.5 md:p-3 rounded-xl bg-slate-50 hover:bg-slate-900 border border-slate-100 hover:border-slate-900 transition-all"
                  >
                    {/* Preview/Icon */}
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 group-hover:border-slate-700">
                      {isImageFile(file) ? (
                        <img 
                          src={file} 
                          alt={extractFileNameFromUrl(file)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileText className="w-5 h-5 md:w-6 md:h-6 text-slate-400 group-hover:text-blue-400" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] md:text-xs font-bold text-slate-900 group-hover:text-white truncate">
                        {extractFileNameFromUrl(file)}
                      </p>
                      <p className="text-[8px] md:text-[9px] text-slate-500 group-hover:text-slate-300">
                        Klik untuk download
                      </p>
                    </div>
                    
                    <Download className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400 group-hover:text-white flex-shrink-0" />
                  </a>
                ))
              ) : (
                <div className="py-6 text-center border border-dashed border-slate-200 rounded-xl">
                  <FolderOpen className="w-6 h-6 md:w-7 md:h-7 text-slate-200 mx-auto mb-1.5" />
                  <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase">No Attachments</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
