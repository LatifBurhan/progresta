"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Edit, User, Hash, Layers, Clock, Trash2, ShieldAlert, Paperclip, ExternalLink, Building2, Users, CheckCircle2 } from "lucide-react";
import FileUploadComponent from "@/components/projects/FileUploadComponent";
import { getFileIcon } from "@/lib/storage/project-file-upload";
import { cn } from "@/lib/utils";

interface Department {
  id: string;
  name: string;
  color: string;
}

interface Division {
  id: string;
  name: string;
  color?: string;
  department_id?: string;
}

interface UserInDivision {
  id: string;
  email: string;
  name: string | null;
  divisionId: string | null;
}

interface Project {
  id: string;
  name: string;
  tujuan: string | null;
  description: string | null;
  pic: string | null;
  prioritas: string | null;
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  status: string;
  lampiran_files: string[] | null;
  lampiran_url?: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  divisions: Array<{
    id: string;
    name: string;
    color: string | null;
  }>;
  assignments?: Array<{
    id: string;
    name: string | null;
    email: string;
  }>;
}

interface EditProjectModalProps {
  open: boolean;
  project: Project;
  divisions: Division[];
  onClose: () => void;
  onSuccess: (project: Project) => void;
  onDelete: () => void;
}

export default function EditProjectModal({ open, project, divisions, onClose, onSuccess, onDelete }: EditProjectModalProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    tujuan: "",
    description: "",
    departmentIds: [] as string[],
    divisionIds: [] as string[],
    userIds: [] as string[],
    pic: "",
    prioritas: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    lampiranFiles: [] as string[],
    status: "",
  });
  const [availableUsers, setAvailableUsers] = useState<UserInDivision[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch("/api/admin/departments");
        const result = await response.json();
        if (result.success) {
          setDepartments(result.departments);
        }
      } catch (err) {
        console.error("Failed to fetch departments:", err);
      }
    };
    if (open) {
      fetchDepartments();
    }
  }, [open]);

  useEffect(() => {
    if (project) {
      let files: string[] = [];
      if (project.lampiran_files) {
        files = Array.isArray(project.lampiran_files) ? project.lampiran_files : [project.lampiran_files];
      } else if (project.lampiran_url) {
        files = [project.lampiran_url];
      }

      // Get unique department IDs from project divisions
      const projectDivisions = project.divisions || [];
      const uniqueDepartmentIds = [...new Set(projectDivisions.map((d) => divisions.find((div) => div.id === d.id)?.department_id).filter(Boolean))] as string[];

      setFormData({
        name: project.name || "",
        tujuan: project.tujuan || "",
        description: project.description || "",
        departmentIds: uniqueDepartmentIds,
        divisionIds: project.divisions?.map((d) => d.id) || [],
        userIds: project.assignments?.map((a) => a.id) || [],
        pic: project.pic || "",
        prioritas: project.prioritas || "",
        tanggalMulai: project.tanggal_mulai || "",
        tanggalSelesai: project.tanggal_selesai || "",
        lampiranFiles: files,
        status: project.status || "Aktif",
      });
      setUploadedFiles(files);
    }
  }, [project, divisions]);

  // Fetch users when division changes
  useEffect(() => {
    const fetchUsers = async () => {
      if (formData.divisionIds.length === 0) {
        setAvailableUsers([]);
        return;
      }

      setLoadingUsers(true);
      try {
        const divisionIdsStr = formData.divisionIds.join(",");
        const response = await fetch(`/api/admin/users/by-divisions?divisionIds=${divisionIdsStr}`);
        const result = await response.json();
        if (result.success) {
          setAvailableUsers(result.users);

          // Bersihkan userIds yang tidak ada lagi di divisi yang dipilih
          // Kecuali saat inisialisasi awal (project.assignments)
          const validUserIds = formData.userIds.filter((uid) => result.users.some((u: UserInDivision) => u.id === uid));

          // Jika kita baru saja pindah divisi, update userIds
          if (validUserIds.length !== formData.userIds.length && formData.userIds.length > 0) {
            // setFormData(prev => ({ ...prev, userIds: validUserIds }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch users by divisions:", err);
      } finally {
        setLoadingUsers(false);
      }
    };

    if (open) {
      fetchUsers();
    }
  }, [formData.divisionIds, open]);

  if (!open) return null;

  // Filter divisions based on selected departments
  const filteredDivisions = formData.departmentIds.length > 0 ? divisions.filter((d) => d.department_id && formData.departmentIds.includes(d.department_id)) : [];

  const handleDepartmentToggle = (departmentId: string) => {
    setFormData((prev) => {
      const newDepartmentIds = prev.departmentIds.includes(departmentId) ? prev.departmentIds.filter((id) => id !== departmentId) : [...prev.departmentIds, departmentId];

      // Remove divisions that are not in the selected departments
      const validDivisionIds = prev.divisionIds.filter((divId) => {
        const division = divisions.find((d) => d.id === divId);
        return division && division.department_id && newDepartmentIds.includes(division.department_id);
      });

      return {
        ...prev,
        departmentIds: newDepartmentIds,
        divisionIds: validDivisionIds,
      };
    });
  };

  const handleDivisionToggle = (divisionId: string) => {
    setFormData((prev) => ({
      ...prev,
      divisionIds: prev.divisionIds.includes(divisionId) ? prev.divisionIds.filter((id) => id !== divisionId) : [...prev.divisionIds, divisionId],
    }));
  };

  const handleUserToggle = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      userIds: prev.userIds.includes(userId) ? prev.userIds.filter((id) => id !== userId) : [...prev.userIds, userId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return setError("Nama project wajib diisi");
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          lampiranFiles: formData.lampiranFiles.length > 0 ? formData.lampiranFiles : null,
        }),
      });

      const result = await response.json();
      if (result.success) {
        onSuccess(result.project);
        onClose();
      } else {
        setError(result.message || "Gagal mengupdate project");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url);
  };

  const getFileName = (url: string) => {
    try {
      const decoded = decodeURIComponent(url);
      return decoded.split("/").pop() || "File";
    } catch {
      return "File";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 text-slate-900">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

      <div className="relative bg-white w-full sm:max-w-[98vw] h-[98vh] sm:h-[98vh] sm:max-h-[98vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-500">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100 ring-4 ring-indigo-50">
              <Edit className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight">Perbarui Project</h2>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">ID: {project.id.slice(0, 8)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-full bg-slate-50 text-slate-400 hover:text-rose-500 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar bg-[#FDFDFD]">
          {error && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in shake duration-300">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          <form id="edit-project-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-7 space-y-10">
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-5 bg-indigo-500 rounded-full" />
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">Informasi Dasar</h4>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-600 ml-1">Nama Project *</Label>
                    <Input className="h-12 rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-indigo-100 transition-all font-medium" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-600 ml-1">Status Progres</Label>
                    <div className="flex flex-wrap gap-2">
                      {["Aktif", "Ditunda", "Selesai", "Non-Aktif", "Dibatalkan"].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setFormData({ ...formData, status: st })}
                          className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tight border-2 transition-all ${
                            formData.status === st ? "border-slate-800 bg-slate-800 text-white shadow-md" : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-600 ml-1">Tujuan</Label>
                    <textarea
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-100 transition-all text-sm font-normal min-h-[100px] outline-none leading-relaxed"
                      value={formData.tujuan}
                      onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
                      placeholder="Jelaskan tujuan project..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-600 ml-1">Deskripsi Detail</Label>
                    <textarea
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-100 transition-all text-sm font-normal min-h-[140px] outline-none leading-relaxed"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Tambahkan detail rincian pekerjaan..."
                    />
                  </div>
                </div>
              </section>

              {/* Group 5: Asset / Lampiran - Moved here! */}
              <section className="bg-white border border-slate-100 rounded-[1.5rem] p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-amber-500" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">Project Assets</span>
                  </div>
                  {uploadedFiles.length > 0 && <span className="text-[10px] font-black px-2 py-0.5 rounded bg-blue-50 text-blue-600 uppercase tracking-tighter">{uploadedFiles.length} File Terlampir</span>}
                </div>

                <div className="pt-2">
                  <FileUploadComponent
                    projectId={project.id}
                    existingFiles={uploadedFiles}
                    onChange={(files) => {
                      setUploadedFiles(files);
                      setFormData((prev) => ({ ...prev, lampiranFiles: files }));
                    }}
                    onError={(err) => setError(err)}
                    disabled={loading}
                  />
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN */}
            <div className="lg:col-span-5 space-y-10">
              <section className="bg-white border border-slate-100 rounded-[1.5rem] p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">Timeline & Prioritas</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Mulai</Label>
                    <Input type="date" className="h-11 rounded-xl border-slate-100 bg-slate-50/50 font-medium" value={formData.tanggalMulai} onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Selesai</Label>
                    <Input type="date" className="h-11 rounded-xl border-slate-100 bg-slate-50/50 font-medium" value={formData.tanggalSelesai} onChange={(e) => setFormData({ ...formData, tanggalSelesai: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600 ml-1">Prioritas</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Rendah", "Sedang", "Tinggi", "Urgent"].map((prio) => (
                      <button
                        key={prio}
                        type="button"
                        onClick={() => setFormData({ ...formData, prioritas: prio })}
                        className={`py-2 rounded-xl text-[10px] font-bold uppercase border-2 transition-all ${
                          formData.prioritas === prio ? "border-indigo-600 bg-indigo-600 text-white shadow-md" : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200"
                        }`}
                      >
                        {prio}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-600 ml-1">PIC (Person In Charge)</Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <Input className="pl-10 h-11 rounded-xl border-slate-100 bg-slate-50/50 font-medium" value={formData.pic} onChange={(e) => setFormData({ ...formData, pic: e.target.value })} />
                  </div>
                </div>
              </section>

              <section className="bg-white border border-slate-100 rounded-[1.5rem] p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-500" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">Departemen Terlibat</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {departments.map((department) => (
                    <button
                      key={department.id}
                      type="button"
                      onClick={() => handleDepartmentToggle(department.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${
                        formData.departmentIds.includes(department.id) ? "border-slate-800 bg-slate-800 text-white shadow-md" : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
                      }`}
                    >
                      <Building2 className={`w-3 h-3 ${formData.departmentIds.includes(department.id) ? "text-purple-300" : "text-slate-300"}`} />
                      <span className="text-[11px] font-bold uppercase tracking-tight">{department.name}</span>
                    </button>
                  ))}
                </div>

                {formData.departmentIds.length > 0 && (
                  <>
                    <div className="border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Layers className="w-4 h-4 text-blue-500" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">Divisi dari Departemen Terpilih</span>
                      </div>

                      {filteredDivisions.length === 0 ? (
                        <div className="text-center py-4 text-slate-400 text-xs">Tidak ada divisi di departemen yang dipilih</div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {filteredDivisions.map((division) => (
                            <button
                              key={division.id}
                              type="button"
                              onClick={() => handleDivisionToggle(division.id)}
                              className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${
                                formData.divisionIds.includes(division.id) ? "border-blue-600 bg-blue-600 text-white shadow-md" : "border-slate-100 bg-white text-slate-400 hover:border-slate-200"
                              }`}
                            >
                              <Hash className={`w-3 h-3 ${formData.divisionIds.includes(division.id) ? "text-blue-200" : "text-slate-300"}`} />
                              <span className="text-[11px] font-bold uppercase tracking-tight">{division.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Personel Selection (Multi-select List) */}
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-500" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">Personel Terlibat</span>
                      </div>

                      {formData.divisionIds.length === 0 ? (
                        <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pilih Divisi Dulu</p>
                        </div>
                      ) : loadingUsers ? (
                        <div className="flex flex-col items-center justify-center py-6 space-y-2">
                          <Clock className="w-5 h-5 text-indigo-500 animate-spin" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Memuat Personel...</p>
                        </div>
                      ) : availableUsers.length === 0 ? (
                        <div className="text-center py-6 bg-amber-50 rounded-2xl border border-dashed border-amber-200">
                          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest px-4">Tidak ada personel di divisi terpilih</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {availableUsers.map((user) => {
                            const division = divisions.find((d) => d.id === user.divisionId);
                            const isSelected = formData.userIds.includes(user.id);
                            return (
                              <div
                                key={user.id}
                                onClick={() => handleUserToggle(user.id)}
                                className={cn(
                                  "flex items-center gap-4 p-3 rounded-2xl border-2 transition-all cursor-pointer group hover:border-emerald-200",
                                  isSelected ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-slate-50 bg-slate-50 hover:bg-white",
                                )}
                              >
                                <div
                                  className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all",
                                    isSelected ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200" : "bg-white text-slate-400 shadow-sm",
                                  )}
                                >
                                  {(user.name || user.email).charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <h5 className={cn("text-xs font-black uppercase tracking-tight truncate", isSelected ? "text-emerald-900" : "text-slate-700")}>{user.name || user.email.split("@")[0]}</h5>
                                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter truncate">{user.email}</span>
                                    <span className="text-[10px] text-slate-300">•</span>
                                    <span className="text-[9px] font-black text-blue-500 uppercase tracking-tighter truncate">{division?.name}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {availableUsers.length > 0 && <p className="text-[9px] font-bold text-slate-400 italic px-1">* Kosongkan jika ingin menugaskan project ke seluruh anggota divisi.</p>}
                    </div>
                  </>
                )}
              </section>
            </div>
          </form>
        </div>

        {/* Action Footer */}
        <div className="px-8 py-8 bg-white border-t border-slate-50 shrink-0">
          <div className="flex flex-col sm:flex-row items-center gap-4 max-w-7xl mx-auto w-full">
            <Button type="button" variant="ghost" onClick={onDelete} disabled={loading} className="w-full sm:w-auto h-12 rounded-xl font-bold text-[11px] uppercase tracking-widest text-rose-500 hover:bg-rose-50 transition-all">
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus Project
            </Button>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:ml-auto sm:w-auto">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="h-12 px-8 rounded-xl font-bold text-[11px] uppercase tracking-widest text-slate-400 border-slate-200">
                Batal
              </Button>
              <Button
                type="submit"
                form="edit-project-form"
                disabled={loading}
                className="h-12 px-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all hover:-translate-y-0.5"
              >
                {loading ? <Clock className="w-4 h-4 animate-spin" /> : "Simpan Perubahan"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
