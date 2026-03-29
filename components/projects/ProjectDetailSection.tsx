'use client'

import { Calendar, Users, Target, FileText, Download, Briefcase, Clock, Flag, FolderOpen, Paperclip, ChevronRight, Zap } from 'lucide-react'

interface Division {
  id: string
  name: string
  color: string
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

  const getUrgencyData = (prio?: string) => {
    const p = prio?.toLowerCase()
    if (p === 'urgent') return { color: 'text-rose-600', bg: 'bg-rose-50', icon: <Zap className="w-4 h-4" /> }
    if (p === 'high' || p === 'tinggi') return { color: 'text-orange-600', bg: 'bg-orange-50', icon: <Flag className="w-4 h-4" /> }
    return { color: 'text-blue-600', bg: 'bg-blue-50', icon: <Briefcase className="w-4 h-4" /> }
  }

  const getStatusStyle = (status?: string) => {
    const s = status?.toLowerCase()
    if (s === 'selesai') return 'bg-emerald-500 text-white shadow-emerald-100'
    if (s === 'aktif') return 'bg-blue-600 text-white shadow-blue-100'
    return 'bg-slate-500 text-white shadow-slate-100'
  }

  const getDaysInfo = (endDate?: string) => {
    if (!endDate) return { text: 'No Deadline', color: 'text-slate-400' }
    const diff = Math.ceil((new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return { text: `DELAYED ${Math.abs(diff)}D`, color: 'text-rose-600' }
    if (diff === 0) return { text: 'DEADLINE TODAY', color: 'text-rose-600 animate-pulse' }
    return { text: `${diff} DAYS LEFT`, color: 'text-blue-600' }
  }

  const urgency = getUrgencyData(project.prioritas)
  const daysInfo = getDaysInfo(project.tanggal_selesai)

  return (
    <div className="animate-in fade-in slide-in-from-top-4 duration-700">
      {/* 1. Header Section */}
      <div className="relative overflow-hidden bg-white border border-slate-100 rounded-[2rem] md:rounded-[2.5rem] shadow-xl shadow-slate-200/50 mb-6">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500"></div>
        
        <div className="p-6 md:p-10">
          <div className="flex flex-col gap-6">
            {/* Badges & Meta */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${getStatusStyle(project.status)}`}>
                  {project.status || 'Status'}
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-slate-100 bg-slate-50 text-slate-400">
                  ID: {project.id.slice(0, 8)}
                </span>
              </div>
              
              {/* Timeline Meta */}
              <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(project.tanggal_mulai)}</span>
                </div>
                <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                <div className={`flex items-center gap-1.5 ${daysInfo.color}`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{daysInfo.text}</span>
                </div>
              </div>
            </div>

            {/* Title Area */}
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">
              {project.name}
            </h1>

            {/* Divisi - Nama Utuh (Bukan Inisial) */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50 mt-2">
               {project.divisions?.map((div, i) => (
                 <div 
                  key={i} 
                  className="px-3 py-1.5 rounded-xl border text-[11px] font-bold tracking-tight shadow-sm flex items-center gap-2 transition-all hover:scale-105"
                  style={{ 
                    backgroundColor: `${div.color}10`, // Opacity 10%
                    borderColor: `${div.color}30`,
                    color: div.color 
                  }}
                 >
                   <span className="w-2 h-2 rounded-full" style={{ backgroundColor: div.color }}></span>
                   {div.name}
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Vision & Context */}
        <div className="lg:col-span-8 space-y-6">
          {/* Objective Card - Normalized Text Weight */}
          <div className="group relative bg-blue-600 rounded-[2rem] p-6 md:p-8 text-white overflow-hidden shadow-2xl shadow-blue-200">
            <Target className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2 text-blue-100 font-black text-[10px] uppercase tracking-[0.2em]">
                <Target className="w-4 h-4" /> Main Objective
              </div>
              <p className="text-sm md:text-base font-normal leading-relaxed opacity-95">
                {project.tujuan || 'Mencapai hasil maksimal dalam pengerjaan proyek strategis.'}
              </p>
            </div>
          </div>

          {/* Description Card - Normalized Text Weight */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-3">
              <FileText className="w-4 h-4" /> Project Context
            </div>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base font-normal opacity-90">
              {project.description || 'Tidak ada deskripsi tambahan untuk project ini.'}
            </p>
          </div>
        </div>

        {/* Right Column: Specs & Assets */}
        <div className="lg:col-span-4 space-y-6">
          {/* Key Specs */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">
               <Zap className="w-4 h-4 text-amber-400" /> Key Specifications
            </div>
            
            <div className="space-y-5">
              <SpecItem 
                icon={<Users className="w-4 h-4" />} 
                label="Lead PIC" 
                value={project.pic || 'Latif'} 
                color="text-indigo-600"
              />
              <SpecItem 
                icon={urgency.icon} 
                label="Priority" 
                value={project.prioritas || 'Normal'} 
                color={urgency.color}
                bg={urgency.bg}
              />
              <SpecItem 
                icon={<Calendar className="w-4 h-4" />} 
                label="Deadline" 
                value={formatDate(project.tanggal_selesai)} 
                color="text-slate-600"
              />
            </div>
          </div>

          {/* Assets/Lampiran */}
          <div className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">
                   <Paperclip className="w-4 h-4" /> Assets
                </div>
                <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-md">
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
                      className="group flex items-center gap-3 p-3 rounded-2xl bg-slate-50 hover:bg-slate-900 hover:text-white transition-all duration-300"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:bg-slate-800">
                        <FileText className="w-5 h-5 text-slate-400 group-hover:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{extractFileNameFromUrl(file)}</p>
                        <p className="text-[9px] opacity-50 font-medium">Click to download</p>
                      </div>
                      <Download className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  ))
                ) : (
                  <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                     <FolderOpen className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                     <p className="text-[10px] font-bold text-slate-400 uppercase">No Attachments</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SpecItem({ icon, label, value, color, bg }: any) {
  return (
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl ${bg || 'bg-slate-50'} flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className={`text-sm font-semibold truncate ${color}`}>{value}</p>
      </div>
    </div>
  )
}