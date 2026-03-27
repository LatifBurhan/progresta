"use client";

import { useState } from "react";
import { Plus, Search, Filter, Calendar, User, Target, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CreateProjectModal from "./CreateProjectModal";
import EditProjectModal from "./EditProjectModal";
import DeleteProjectModal from "./DeleteProjectModal";

interface Project {
  id: string;
  name: string;
  tujuan: string | null;
  description: string | null;
  pic: string | null;
  prioritas: string | null;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  output_diharapkan: string | null;
  catatan: string | null;
  lampiran_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  divisions: Array<{
    id: string;
    name: string;
    color: string | null;
  }>;
}

interface Division {
  id: string;
  name: string;
  color: string | null;
  is_active: boolean;
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
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || project.description?.toLowerCase().includes(searchQuery.toLowerCase()) || project.pic?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesPrioritas = prioritasFilter === "all" || project.prioritas === prioritasFilter;

    return matchesSearch && matchesStatus && matchesPrioritas;
  });

  const handleCreateSuccess = (newProject: Project) => {
    setProjects((prev) => [newProject, ...prev]);
  };

  const handleEditSuccess = (updatedProject: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
  };

  const handleDeleteSuccess = (deletedProjectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== deletedProjectId));
  };

  const handleDeactivateSuccess = (updatedProject: Project) => {
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
  };

  const openEditModal = (project: Project) => {
    setSelectedProject(project);
    setEditModalOpen(true);
  };

  const openDeleteModal = (project: Project) => {
    setSelectedProject(project);
    setDeleteModalOpen(true);
  };

  const getPriorityColor = (prioritas: string | null) => {
    switch (prioritas) {
      case "Urgent":
        return "bg-red-100 text-red-800 border-red-200";
      case "Tinggi":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "Sedang":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Rendah":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aktif":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Selesai":
        return "bg-green-100 text-green-800 border-green-200";
      case "Ditunda":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Dibatalkan":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID");
  };

  const calculateDuration = (startDate: string | null, endDate: string | null) => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kelola Project</h1>
          <p className="text-gray-600 mt-1">Kelola semua project perusahaan dengan lengkap</p>
        </div>

        <Button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tambah Project Baru
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input placeholder="Cari project..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>

          {/* Status Filter */}
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Non-Aktif">Non-Aktif</option>
            <option value="Selesai">Selesai</option>
            <option value="Ditunda">Ditunda</option>
            <option value="Dibatalkan">Dibatalkan</option>
          </select>

          {/* Priority Filter */}
          <select value={prioritasFilter} onChange={(e) => setPrioritasFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">Semua Prioritas</option>
            <option value="Urgent">Urgent</option>
            <option value="Tinggi">Tinggi</option>
            <option value="Sedang">Sedang</option>
            <option value="Rendah">Rendah</option>
          </select>

          {/* Stats */}
          <div className="text-sm text-gray-600">
            Menampilkan {filteredProjects.length} dari {projects.length} project
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const duration = calculateDuration(project.tanggal_mulai, project.tanggal_selesai);

          return (
            <div key={project.id} className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{project.name}</h3>

                    {/* Status & Priority */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>{project.status}</span>
                      {project.prioritas && <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(project.prioritas)}`}>{project.prioritas}</span>}
                    </div>
                  </div>
                </div>

                {/* Tujuan */}
                {project.tujuan && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Tujuan</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{project.tujuan}</p>
                  </div>
                )}

                {/* PIC */}
                {project.pic && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">PIC:</span>
                      <span className="text-sm text-gray-600">{project.pic}</span>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                {(project.tanggal_mulai || project.tanggal_selesai) && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-700">Timeline</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDate(project.tanggal_mulai)} - {formatDate(project.tanggal_selesai)}
                      {duration && <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">{duration} hari</span>}
                    </div>
                  </div>
                )}

                {/* Divisions */}
                {project.divisions && project.divisions.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Divisi Terlibat:</div>
                    <div className="flex flex-wrap gap-1">
                      {project.divisions.map((division) => (
                        <span key={division.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: division.color || "#3B82F6" }}>
                          {division.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {project.description && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 line-clamp-3">{project.description}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" size="sm" onClick={() => openEditModal(project)} className="flex-1">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => openDeleteModal(project)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    Hapus
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{projects.length === 0 ? "Belum ada project" : "Tidak ada project yang sesuai filter"}</h3>
          <p className="text-gray-600 mb-4">{projects.length === 0 ? "Mulai dengan membuat project pertama Anda" : "Coba ubah filter atau kata kunci pencarian"}</p>
          {projects.length === 0 && (
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Tambah Project Pertama
            </Button>
          )}
        </div>
      )}

      {/* Modals */}
      <CreateProjectModal open={createModalOpen} divisions={divisions} onClose={() => setCreateModalOpen(false)} onSuccess={handleCreateSuccess} />

      {selectedProject && (
        <>
          <EditProjectModal
            open={editModalOpen}
            project={selectedProject}
            divisions={divisions}
            onClose={() => {
              setEditModalOpen(false);
              setSelectedProject(null);
            }}
            onSuccess={handleEditSuccess}
            onDelete={() => {
              setEditModalOpen(false);
              setDeleteModalOpen(true);
            }}
          />

          <DeleteProjectModal
            open={deleteModalOpen}
            project={selectedProject}
            onClose={() => {
              setDeleteModalOpen(false);
              setSelectedProject(null);
            }}
            onDeleteSuccess={handleDeleteSuccess}
            onDeactivateSuccess={handleDeactivateSuccess}
          />
        </>
      )}
    </div>
  );
}
