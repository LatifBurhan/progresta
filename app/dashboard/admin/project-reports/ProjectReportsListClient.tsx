'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  BarChart3, 
  Layers, 
  ChevronRight, 
  Target, 
  FileText, 
  LayoutGrid,
  Search
} from 'lucide-react'

// Interface tetap sama, tidak ada perubahan backend
interface Department {
  id: string
  name: string
  color: string
}

interface ProjectWithDepartments {
  id: string
  name: string
  description: string | null
  status: string
  prioritas: string
  tanggal_mulai: string | null
  tanggal_selesai: string | null
  departments: Department[]
  reportCount: number
}

interface ProjectReportsListClientProps {
  projects: ProjectWithDepartments[]
  departments: Department[]
}

export default function ProjectReportsListClient({ 
  projects, 
  departments 
}: ProjectReportsListClientProps) {
  const [selectedDept, setSelectedDept] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('') // Tambahan filter UI tanpa merusak logic
  const router = useRouter()

  // Logic filter tetap sama
  const filteredProjects = projects.filter(project => {
    const matchesDept = selectedDept ? project.departments.some(dept => dept.id === selectedDept) : true
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesDept && matchesSearch
  })

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 text-slate-900">
      
      {/* 1. Header Ringkas (Hemat Ruang Vertikal) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            Monitoring Laporan
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">Review progres pengerjaan berdasarkan project</p>
        </div>

        {/* Pencarian Cepat (UI Only) */}
        <div className="relative w-full md:w-72 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text"
            placeholder="Cari nama project..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-100 bg-white text-sm focus:ring-4 focus:ring-blue-50 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* 2. Filter Divisi: Pill Style (Sangat Efisien) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth px-1">
        <button
          onClick={() => setSelectedDept(null)}
          className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
            !selectedDept 
              ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
              : 'bg-white border-slate-50 text-slate-400 hover:border-slate-200'
          }`}
        >
          Semua
        </button>
        {departments.map(dept => (
          <button
            key={dept.id}
            onClick={() => setSelectedDept(dept.id)}
            className={`px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
              selectedDept === dept.id 
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' 
                : 'bg-white border-slate-50 text-slate-400 hover:border-slate-200'
            }`}
          >
            {dept.name}
          </button>
        ))}
      </div>

      {/* 3. Grid Project: Diperketat agar tidak banyak ruang kosong */}
      {filteredProjects.length === 0 ? (
        <div className="py-20 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
          <LayoutGrid className="w-12 h-12 text-slate-200 mx-auto mb-2" />
          <p className="text-slate-400 font-bold text-xs uppercase">Project tidak ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProjects.map(project => (
            <div
              key={project.id}
              onClick={() => router.push(`/dashboard/admin/project-reports/${project.id}`)}
              className="group relative flex flex-col bg-white border border-slate-100 rounded-[1.5rem] p-5 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 hover:border-blue-200 cursor-pointer overflow-hidden"
            >
              {/* Report Counter Badge (Pojok Kanan Atas) */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-wrap gap-1 max-w-[70%]">
                  {project.departments.slice(0, 2).map(dept => (
                    <span 
                      key={dept.id}
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: dept.color }}
                      title={dept.name}
                    />
                  ))}
                  {project.departments.length > 2 && <span className="text-[9px] font-black text-slate-300">+{project.departments.length - 2}</span>}
                </div>
                <div className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[10px] font-black border border-blue-100">
                  {project.reportCount} LPRN
                </div>
              </div>

              {/* Title: Lebih Jelas di Desktop */}
              <div className="space-y-1 mb-4 flex-1">
                <h3 className="font-extrabold text-slate-900 text-base leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 uppercase">
                  {project.name}
                </h3>
                <p className="text-xs text-slate-400 font-medium line-clamp-1 italic">
                  {project.description || 'Pengerjaan operasional tim.'}
                </p>
              </div>

              {/* Status Section (Footer Card) */}
              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
                  project.status === 'Aktif' 
                    ? 'bg-emerald-50 text-emerald-600'
                    : project.status === 'Selesai'
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-slate-50 text-slate-400'
                }`}>
                  {project.status}
                </span>
                <div className="flex items-center text-[10px] font-bold text-slate-300 group-hover:text-blue-500 transition-colors">
                  Detail <ChevronRight className="w-3 h-3 ml-0.5" />
                </div>
              </div>

              {/* Hover Effect Decor */}
              <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-blue-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}