"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Trash2, AlertTriangle, Calendar, User, Target } from "lucide-react";

interface Project {
  id: string;
  name: string;
  tujuan: string | null;
  description: string | null;
  pic: string | null;
  prioritas: string | null;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  lampiran_files: string[] | null;
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

interface DeleteProjectModalProps {
  open: boolean;
  project: Project;
  onClose: () => void;
  onDeleteSuccess: (deletedProjectId: string) => void;
  onDeactivateSuccess: (updatedProject: Project) => void;
}

export default function DeleteProjectModal({ open, project, onClose, onDeleteSuccess, onDeactivateSuccess }: DeleteProjectModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmName, setConfirmName] = useState("");

  if (!open) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID");
  };

  const handleDelete = async () => {
    if (confirmName !== project.name) {
      setError("Nama project yang Anda ketikkan tidak sesuai");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/projects/${project.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        onDeleteSuccess(project.id);
        onClose();
        alert("Project berhasil dihapus secara permanen!");
      } else {
        setError(result.message || "Gagal menghapus project");
      }
    } catch (error) {
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: project.name,
          tujuan: project.tujuan,
          description: project.description,
          divisionIds: project.divisions.map((d) => d.id),
          pic: project.pic,
          prioritas: project.prioritas,
          tanggalMulai: project.tanggal_mulai,
          tanggalSelesai: project.tanggal_selesai,
          lampiranFiles: project.lampiran_files,
          status: "Non-Aktif",
        }),
      });

      const result = await response.json();

      if (result.success) {
        onDeactivateSuccess(result.project);
        onClose();
        alert("Project telah dinonaktifkan!");
      } else {
        setError(result.message || "Gagal menonaktifkan project");
      }
    } catch (error) {
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Hapus Project
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Warning */}
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800 mb-1">Peringatan: Tindakan Tidak Dapat Dibatalkan</h4>
                <p className="text-sm text-red-700">Menghapus project akan menghilangkan semua data terkait secara permanen. Data yang akan dihapus meliputi informasi project, relasi dengan divisi, dan semua catatan terkait.</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Project Details */}
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Detail Project yang akan dihapus:</h4>

            <div className="space-y-3">
              {/* Project Name */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Nama Project</span>
                </div>
                <p className="text-sm text-gray-900 font-semibold">{project.name}</p>
              </div>

              {/* Tujuan */}
              {project.tujuan && (
                <div>
                  <span className="text-sm font-medium text-gray-700">Tujuan:</span>
                  <p className="text-sm text-gray-600">{project.tujuan}</p>
                </div>
              )}

              {/* PIC */}
              {project.pic && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">PIC:</span>
                    <span className="text-sm text-gray-600">{project.pic}</span>
                  </div>
                </div>
              )}

              {/* Status & Priority */}
              <div className="flex gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <span
                    className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === "Aktif" ? "bg-blue-100 text-blue-800" : project.status === "Selesai" ? "bg-green-100 text-green-800" : project.status === "Ditunda" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {project.status}
                  </span>
                </div>

                {project.prioritas && (
                  <div>
                    <span className="text-sm font-medium text-gray-700">Prioritas:</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        project.prioritas === "Urgent"
                          ? "bg-red-100 text-red-800"
                          : project.prioritas === "Tinggi"
                            ? "bg-orange-100 text-orange-800"
                            : project.prioritas === "Sedang"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                      }`}
                    >
                      {project.prioritas}
                    </span>
                  </div>
                )}
              </div>

              {/* Timeline */}
              {(project.tanggal_mulai || project.tanggal_selesai) && (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Timeline:</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatDate(project.tanggal_mulai)} - {formatDate(project.tanggal_selesai)}
                  </p>
                </div>
              )}

              {/* Divisions */}
              {project.divisions.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700 block mb-2">Divisi Terlibat:</span>
                  <div className="flex flex-wrap gap-1">
                    {project.divisions.map((division) => (
                      <span key={division.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: division.color || "#3B82F6" }}>
                        {division.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Confirmation */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 mb-3">
              <strong>Opsi 1: Nonaktifkan Project</strong>
              <br />
              Project akan disembunyikan dari daftar aktif tetapi data tetap tersimpan.
            </p>
            <Button type="button" onClick={handleDeactivate} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white mb-4" disabled={loading}>
              Nonaktifkan Saja
            </Button>

            <hr className="my-4 border-yellow-200" />

            <p className="text-sm text-red-800 mb-3">
              <strong>Opsi 2: Hapus Permanen</strong>
              <br />
              Ketik nama project "<strong>{project.name}</strong>" untuk mengonfirmasi penghapusan permanen.
            </p>
            <Input type="text" value={confirmName} onChange={(e) => setConfirmName(e.target.value)} placeholder="Ketik nama project di sini..." className="mb-3" disabled={loading} />
            <Button type="button" onClick={handleDelete} className="w-full bg-red-600 hover:bg-red-700 text-white" disabled={loading || confirmName !== project.name}>
              {loading ? "Sedang Memproses..." : "Ya, Hapus Permanen"}
            </Button>
          </div>

          {/* Actions */}
          <div className="flex justify-center">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="text-gray-500">
              Batal / Tutup
            </Button>
          </div>

          {/* Additional Warning */}
          <p className="text-xs text-gray-500 text-center mt-4">Pastikan Anda memiliki backup data jika diperlukan.</p>
        </div>
      </div>
    </div>
  );
}
