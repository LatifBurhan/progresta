"use client";

import { useState } from "react";
import { 
  Plus, Search, Filter, Calendar, User, Target, 
  Paperclip, Layers, ChevronRight, LayoutGrid, Sparkles, Briefcase
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CreateProjectModal from "./CreateProjectModal";
import EditProjectModal from "./EditProjectModal";
import DeleteProjectModal from "./DeleteProjectModal";
import FilePreviewModal from "@/components/projects/FilePreviewModal";

interface Division {
  id: string;
  name: string;
  color?: string;
  is_active?: boolean;
  department_id?: string;
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  tujuan: string | null;
  pic: string | null;
  prioritas: string | null;
  status: string;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  lampiran_files: string[] | null;
  divisions: Array<{
    id: string;
    name: string;
    color: string | null;
  }>;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

interface ProjectManagementClientProps {
  projects: Project[];
  divisions: Division[];
}

export default function ProjectManagementClient({ projects: initialProjects, divisions }: ProjectManagementClientProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [prioritasFilter, setPrioritasFilter] = useState<string>("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [filePreviewModalOpen, setFilePreviewModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         project.pic?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesPrioritas = prioritasFilter === "all" || project.prioritas === prioritasFilter;
    return matchesSearch && matchesStatus && matchesPrioritas;
  });

  const handleCreateSuccess = (newProject: Project) => setProjects((prev) => [newProject, ...prev]);
  const handleEditSuccess = (updatedProject: Project) => setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
  const handleDeleteSuccess = (deletedProjectId: string) => setProjects((prev) => prev.filter((p) => p.id !== deletedProjectId));
  const handleDeactivateSuccess = (updatedProject: Project) => setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));

  const openEditModal = (project: Project) => { setSelectedProject(project); setEditModalOpen(true); };
  const openFilePreview = (project: Project) => { setSelectedProject(project); setFilePreviewModalOpen(true); };

  const getPriorityStyle = (prioritas: string | null | undefined) => {
    switch (prioritas) {
      case "Urgent": return "bg-rose-50 text-rose-600 border-rose-100";
      case "Tinggi": return "bg-orange-50 text-orange-600 border-orange-100";
      case "Sedang": return "bg-amber-50 text-amber-600 border-amber-100";
      default: return "bg-slate-50 text-slate-500 border-slate-100";
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Aktif": 
        return {
          border: "border-blue-200 hover:border-blue-300",
          bg: "bg-blue-50/30",
          shadow: "hover:shadow-blue-500/10"
        };
      case "Selesai": 
        return {
          border: "border-emerald-200 hover:border-emerald-300",
          bg: "bg-emerald-50/30",
          shadow: "hover:shadow-emerald-500/10"
        };
      case "Ditunda": 
        return {
          border: "border-amber-200 hover:border-amber-300",
          bg: "bg-amber-50/30",
          shadow: "hover:shadow-amber-500/10"
        };
      case "Dibatalkan": 
        return {
          border: "border-rose-200 hover:border-rose-300",
          bg: "bg-rose-50/30",
          shadow: "hover:shadow-rose-500/10"
        };
      case "Non-Aktif":
        return {
          border: "border-orange-200 hover:border-orange-300",
          bg: "bg-orange-50/30",
          shadow: "hover:shadow-orange-500/10"
        };
      default: 
        return {
          border: "border-slate-200 hover:border-slate-300",
          bg: "bg-slate-50/30",
          shadow: "hover:shadow-slate-500/10"
        };
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-slate-900">
      
      {/* Header Section - Modern & Minimalist */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <div className="p-2 bg-blue-50 rounded-xl">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Management System</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Kelola Project
            <Sparkles className="w-6 h-6 text-amber-400 hidden sm:block" />
          </h1>
          <p className="text-sm font-medium text-slate-500 max-w-md">
            Konfigurasi, monitoring, dan delegasi project tim Al-Wustho secara terpusat.
          </p>
        </div>

        {/* Badge Info - Shortcut info untuk admin */}
        <div className="flex gap-3">
          <div className="bg-white border border-slate-100 px-4 py-2 rounded-2xl shadow-sm hidden sm:block">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Total Active</p>
            <p className="text-sm font-black text-slate-900">{projects.length} Projects</p>
          </div>
        </div>
      </div>
      
      {/* Dashboard Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-1">

        <div className="flex flex-col sm:flex-row gap-3">
           <div className="relative group flex-1 sm:min-w-[350px]">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
             <Input 
               placeholder="Cari nama project atau PIC..." 
               value={searchQuery} 
               onChange={(e) => setSearchQuery(e.target.value)} 
               className="pl-12 h-13 rounded-2xl border-slate-200 bg-white shadow-sm focus:ring-4 focus:ring-blue-50 transition-all text-base font-medium"
             />
           </div>
           <Button 
            onClick={() => setCreateModalOpen(true)} 
            className="h-13 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xl shadow-blue-100 gap-2 active:scale-95 transition-all text-sm uppercase tracking-wider"
           >
             <Plus className="w-5 h-5" />
             <span>Project Baru</span>
           </Button>
        </div>
      </div>

      {/* 2. Intelligent Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 px-3 text-slate-500 border-r border-slate-100 mr-2">
          <Filter className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Filter</span>
        </div>
        
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-100 text-sm font-semibold text-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer hover:bg-slate-100 transition-all"
        >
          <option value="all">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Selesai">Selesai</option>
          <option value="Ditunda">Ditunda</option>
        </select>

        <select 
          value={prioritasFilter} 
          onChange={(e) => setPrioritasFilter(e.target.value)}
          className="bg-slate-50 border border-slate-100 text-sm font-semibold text-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer hover:bg-slate-100 transition-all"
        >
          <option value="all">Semua Prioritas</option>
          <option value="Urgent">Urgent</option>
          <option value="Tinggi">Tinggi</option>
          <option value="Sedang">Sedang</option>
          <option value="Rendah">Rendah</option>
        </select>

        <div className="ml-auto hidden md:block px-4 py-2 bg-blue-50 rounded-xl">
           <p className="text-xs font-bold text-blue-600 uppercase tracking-tight">
             Ditemukan: {filteredProjects.length} Project
           </p>
        </div>
      </div>

      {/* 3. Main Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const statusStyle = getStatusStyle(project.status);
          return (
          <div 
            key={project.id} 
            onClick={() => openEditModal(project)}
            className={`group relative flex flex-col ${statusStyle.bg} border-2 ${statusStyle.border} rounded-[2.5rem] p-6 md:p-8 transition-all duration-300 hover:shadow-2xl ${statusStyle.shadow} md:hover:-translate-y-2 cursor-pointer overflow-hidden`}
          >
            <div className="flex-1 space-y-6">
              {/* Header Info */}
              <div className="space-y-2">
                <h3 className="text-lg md:text-xl font-extrabold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                  {project.name}
                </h3>
              </div>

              {/* Context / Goal Section - Increased Visibility */}
              <div className="bg-white/60 p-4 rounded-[1.5rem] border border-slate-100">
                 <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Objective</span>
                 </div>
                 <p className="text-sm md:text-base text-slate-600 line-clamp-2 leading-relaxed font-medium italic">
                   "{project.tujuan || 'Fokus pada penyelesaian target operasional tim.'}"
                 </p>
              </div>

              {/* Specs Grid - Normalized Weight */}
              <div className="grid grid-cols-2 gap-6 py-1">
                 <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                       <User className="w-4 h-4" /> Lead PIC
                    </div>
                    <p className="text-sm md:text-base font-semibold text-slate-700 truncate">{project.pic || 'Latif'}</p>
                 </div>
                 <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                       <Calendar className="w-4 h-4" /> Target
                    </div>
                    <p className="text-sm md:text-base font-semibold text-slate-700">{formatDate(project.tanggal_selesai)}</p>
                 </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="mt-8 pt-5 border-t border-slate-200/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${getPriorityStyle(project.prioritas)}`}>
                  {project.prioritas || 'Normal'}
                </span>
                {project.lampiran_files && project.lampiran_files.length > 0 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); openFilePreview(project); }}
                    className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-100 text-slate-500 rounded-lg text-[10px] font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
                  >
                    <Paperclip className="w-3.5 h-3.5" /> {project.lampiran_files.length}
                  </button>
                )}
              </div>
              
              <div className="w-10 h-10 rounded-2xl bg-white/60 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-200 transition-all">
                <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        );
        })}
      </div>

      {/* 4. Empty State */}
      {filteredProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 px-6 bg-white border-2 border-dashed border-slate-100 rounded-[3rem] text-center space-y-4 shadow-inner">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 shadow-sm">
            <Search className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-slate-900">Project Tidak Ditemukan</h3>
            <p className="text-base text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
              Kami tidak dapat menemukan data yang sesuai dengan filter atau kata kunci yang Anda masukkan.
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => {setSearchQuery(""); setStatusFilter("all"); setPrioritasFilter("all");}} 
            className="mt-6 rounded-2xl border-slate-200 px-8 py-6 h-auto font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-95"
          >
            Reset Semua Filter
          </Button>
        </div>
      )}

      {/* Modals Container */}
      <CreateProjectModal open={createModalOpen} divisions={divisions} onClose={() => setCreateModalOpen(false)} onSuccess={handleCreateSuccess} />

      {selectedProject && (
        <>
          <EditProjectModal
            open={editModalOpen}
            project={selectedProject}
            divisions={divisions}
            onClose={() => { setEditModalOpen(false); setSelectedProject(null); }}
            onSuccess={handleEditSuccess}
            onDelete={() => { setEditModalOpen(false); setDeleteModalOpen(true); }}
          />
          <DeleteProjectModal
            open={deleteModalOpen}
            project={selectedProject}
            onClose={() => { setDeleteModalOpen(false); setSelectedProject(null); }}
            onDeleteSuccess={handleDeleteSuccess}
            onDeactivateSuccess={handleDeactivateSuccess}
          />
          <FilePreviewModal
            open={filePreviewModalOpen}
            files={selectedProject.lampiran_files || []}
            projectName={selectedProject.name}
            onClose={() => { setFilePreviewModalOpen(false); setSelectedProject(null); }}
          />
        </>
      )}
    </div>
  );
}