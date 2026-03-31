'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { 
  ArrowLeft, 
  MapPin, 
  AlertCircle, 
  Rocket, 
  History,
  Clock,
  Calendar,
  Layers
} from 'lucide-react'

interface UserInfo {
  id: string
  email: string
  name: string
  fotoProfil: string | null
}

interface ProjectReport {
  id: string
  user_id: string
  project_id: string
  lokasi_kerja: 'WFA' | 'Al-Wustho' | 'Client Site'
  pekerjaan_dikerjakan: string
  kendala: string | null
  rencana_kedepan: string | null
  foto_urls: string[]
  created_at: string
  updated_at: string
  user: UserInfo
}

interface ProjectWithReports {
  id: string
  name: string
  description: string | null
  status: string
  reports: ProjectReport[]
}

interface ProjectReportDetailClientProps {
  project: ProjectWithReports
}

export default function ProjectReportDetailClient({ project }: ProjectReportDetailClientProps) {
  const router = useRouter()

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

  return (
    <div className="-m-4 sm:-m-8 pb-24 text-slate-900 bg-[#F8FAFC] min-h-screen">
      
      {/* 1. Enhanced Sticky Header */}
      <div className="sticky top-0 z-30 bg-[#F8FAFC] border-b border-slate-200/60 px-4 py-3 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/admin/project-reports')}
            className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-black uppercase tracking-tight text-slate-800 truncate leading-none mb-1">
              {project.name}
            </h1>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {project.reports.length} Laporan Aktivitas
              </span>
            </div>
          </div>

          <div className="p-2 bg-indigo-50 rounded-lg">
             <History className="w-4 h-4 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* 2. Timeline Feed */}
      <div className="px-4 space-y-6">
        {project.reports.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Belum ada aktivitas</p>
          </div>
        ) : (
          project.reports.map((report) => (
            <div key={report.id} className="group">

              {/* Card Container */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* User Info Header */}
                <div className="p-4 border-b border-slate-50 bg-slate-50/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white shadow-sm bg-white">
                        {report.user.fotoProfil ? (
                          <Image src={report.user.fotoProfil} alt="avatar" fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-black text-xs">
                            {report.user.name.substring(0,2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 text-[13px] uppercase tracking-tight leading-none mb-1">
                          {report.user.name}
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
                    
                    <div className="bg-blue-600 text-white px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm shadow-blue-200">
                      <MapPin className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">{report.lokasi_kerja}</span>
                    </div>
                  </div>
                </div>

                {/* Report Content */}
                <div className="p-4 space-y-4">
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
                  {report.foto_urls && report.foto_urls.length > 0 && (
                    <div className="pt-2">
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">Dokumentasi Visual</span>
                       <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                        {report.foto_urls.map((url, i) => (
                          <div key={i} className="group/img relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-200">
                            <Image src={url} alt="doc" fill className="object-cover group-hover/img:scale-110 transition-transform duration-500" unoptimized />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modern Floating Badge */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md text-white px-5 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 border border-white/10 transition-all hover:scale-105 z-50">
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Monitoring Aktif</span>
      </div>
    </div>
  )
}