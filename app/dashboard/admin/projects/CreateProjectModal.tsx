"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, Calendar, User, Target, FileText, AlertCircle, Briefcase, Flag, Hash, Layers, Clock, Sparkles, CheckCircle2, Paperclip, Building2, Users } from "lucide-react";
import FileUploadComponent from "@/components/projects/FileUploadComponent";
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

interface CreateProjectModalProps {
  open: boolean;
  divisions: Division[];
  onClose: () => void;
  onSuccess: (project: any) => void;
}

export default function CreateProjectModal({ open, divisions, onClose, onSuccess }: CreateProjectModalProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    tujuan: "",
    description: "",
    departmentIds: [] as string[],
    divisionIds: [] as string[],
    userIds: [] as string[], // Personel yang dipilih
    pic: "",
    prioritas: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    lampiranFiles: [] as string[],
  });
  const [availableUsers, setAvailableUsers] = useState<UserInDivision[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string>("");
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
          const validUserIds = formData.userIds.filter((uid) => result.users.some((u: UserInDivision) => u.id === uid));
          if (validUserIds.length !== formData.userIds.length) {
            setFormData((prev) => ({ ...prev, userIds: validUserIds }));
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

  const tempProjectId = `temp-${Date.now()}`;

  if (!open) return null;

  // Filter divisions based on selected departments
  const filteredDivisions = formData.departmentIds.length > 0 ? divisions.filter((d) => d.department_id && formData.departmentIds.includes(d.department_id)) : [];

  const calculateDuration = () => {
    if (!formData.tanggalMulai || !formData.tanggalSelesai) return null;
    const start = new Date(formData.tanggalMulai);
    const end = new Date(formData.tanggalSelesai);
    if (end <= start) return null;
    return Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

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
    if (!formData.departmentIds.length) return setError("Minimal satu departemen wajib dipilih");
    if (!formData.divisionIds.length) return setError("Minimal satu divisi wajib dipilih");

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          tujuan: formData.tujuan.trim() || null,
          description: formData.description.trim() || null,
          lampiranFiles: formData.lampiranFiles.length > 0 ? formData.lampiranFiles : null,
        }),
      });

      const result = await response.json();
      if (result.success) {
        onSuccess(result.project);
        handleClose();
      } else {
        setError(result.message || "Gagal membuat project");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: "", tujuan: "", description: "", departmentIds: [], divisionIds: [], userIds: [], pic: "", prioritas: "", tanggalMulai: "", tanggalSelesai: "", lampiranFiles: [] });
    setUploadedFiles([]);
    setUploadError("");
    setError("");
    onClose();
  };

  const duration = calculateDuration();
  const selectedDepartments = departments.filter((d: Department) => formData.departmentIds.includes(d.id));
  const selectedDivisions = filteredDivisions.filter((d: Division) => formData.divisionIds.includes(d.id));
  const selectedUsers = availableUsers.filter((u) => formData.userIds.includes(u.id));

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={handleClose} />

      {/* Modal Container */}
      <div className="relative bg-white w-full sm:max-w-[98vw] h-[98vh] sm:h-[98vh] sm:max-h-[98vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-500">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-100 ring-4 ring-blue-50">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Inisiasi Project</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Sistem Administrasi Al-Wustho</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2.5 rounded-full bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar bg-[#FDFDFD]">
          {error && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in shake duration-300">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form id="project-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* LEFT COLUMN: Main Info */}
            <div className="lg:col-span-7 space-y-10">
              {/* Group 1: Identitas */}
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Identitas Utama</h4>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-black text-slate-500 ml-1 uppercase">Nama Project *</Label>
                    <div className="relative group">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        className="pl-11 h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-base font-medium shadow-sm"
                        placeholder="Contoh: Digitalization System 2.0"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-black text-slate-500 ml-1 uppercase tracking-wider">Tujuan Utama</Label>
                    <div className="relative group">
                      <Target className="absolute left-4 top-4 w-4 h-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                      <textarea
                        className="w-full pl-11 pr-4 py-4 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all text-sm font-medium shadow-sm min-h-[100px] outline-none"
                        placeholder="Apa output yang ingin dicapai?"
                        value={formData.tujuan}
                        onChange={(e) => setFormData({ ...formData, tujuan: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-black text-slate-500 ml-1 uppercase tracking-wider">Konteks / Deskripsi</Label>
                    <div className="relative group">
                      <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-300 group-focus-within:text-slate-500 transition-colors" />
                      <textarea
                        className="w-full pl-11 pr-4 py-4 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all text-sm font-medium shadow-sm min-h-[140px] outline-none"
                        placeholder="Detail pengerjaan project..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Group 5: Asset / Lampiran - Moved here! */}
              <section className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Project Assets</span>
                </div>
                <FileUploadComponent
                  projectId={tempProjectId}
                  existingFiles={uploadedFiles}
                  onChange={(files) => {
                    setUploadedFiles(files);
                    setFormData((prev) => ({ ...prev, lampiranFiles: files }));
                  }}
                  onError={(err) => setUploadError(err)}
                  disabled={loading}
                />
              </section>

              {/* Group 2: Preview (App-like Card) */}
              {formData.name && selectedDepartments.length > 0 && selectedDivisions.length > 0 && (
                <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl animate-in fade-in zoom-in">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-[80px]" />
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Preview Card</span>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl font-black">{formData.name.charAt(0).toUpperCase()}</div>
                      <div className="flex-1">
                        <h4 className="text-xl font-black tracking-tight leading-none mb-2">{formData.name}</h4>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {selectedDepartments.map((dept: Department) => (
                              <span key={dept.id} className="text-[9px] font-black px-2 py-0.5 rounded bg-white/20 border border-white/20 uppercase tracking-tighter" style={{ backgroundColor: dept.color + "40" }}>
                                {dept.name}
                              </span>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {selectedDivisions.map((d: Division) => (
                              <span key={d.id} className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-white/10 border border-white/10 uppercase tracking-tighter">
                                {d.name}
                              </span>
                            ))}
                          </div>
                          {selectedUsers.length > 0 && (
                            <div className="flex items-center gap-1.5 pt-1">
                              <Users className="w-3 h-3 text-blue-400" />
                              <p className="text-[8px] font-bold text-slate-300 uppercase tracking-wider">{selectedUsers.length} Personel Terpilih</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* RIGHT COLUMN: Settings & Attachments */}
            <div className="lg:col-span-5 space-y-10">
              {/* Group 3: Timeline & Priority */}
              <section className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Timeline & Urgency</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-center">
                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Mulai</Label>
                    <Input type="date" className="h-12 rounded-xl border-slate-50 bg-slate-50/50" value={formData.tanggalMulai} onChange={(e) => setFormData({ ...formData, tanggalMulai: e.target.value })} />
                  </div>
                  <div className="space-y-1.5 text-center">
                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Selesai</Label>
                    <Input type="date" className="h-12 rounded-xl border-slate-50 bg-slate-50/50" value={formData.tanggalSelesai} onChange={(e) => setFormData({ ...formData, tanggalSelesai: e.target.value })} />
                  </div>
                </div>

                {duration && (
                  <div className="flex items-center justify-center gap-2 p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-widest">Est. {duration} Hari Kerja</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-[11px] font-black text-slate-500 ml-1 uppercase">Prioritas Project</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Rendah", "Sedang", "Tinggi", "Urgent"].map((prio) => (
                      <button
                        key={prio}
                        type="button"
                        onClick={() => setFormData({ ...formData, prioritas: prio })}
                        className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                          formData.prioritas === prio ? "border-blue-600 bg-blue-600 text-white shadow-lg" : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200"
                        }`}
                      >
                        {prio}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <Label className="text-[11px] font-black text-slate-500 ml-1 uppercase">Lead PIC</Label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <Input className="pl-10 h-12 rounded-xl border-slate-50 bg-slate-50/50" placeholder="Nama Penanggung Jawab" value={formData.pic} onChange={(e) => setFormData({ ...formData, pic: e.target.value })} />
                  </div>
                </div>
              </section>

              {/* Group 4: Departemen, Divisi, Personel */}
              <section className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Departemen Terlibat *</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {departments.map((department) => (
                    <button
                      key={department.id}
                      type="button"
                      onClick={() => handleDepartmentToggle(department.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all active:scale-95 ${
                        formData.departmentIds.includes(department.id) ? "border-slate-900 bg-slate-900 text-white shadow-xl" : "border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-200"
                      }`}
                    >
                      <Building2 className={`w-3 h-3 ${formData.departmentIds.includes(department.id) ? "text-purple-400" : "text-slate-300"}`} />
                      <span className="text-[11px] font-black uppercase tracking-tight">{department.name}</span>
                    </button>
                  ))}
                </div>

                {formData.departmentIds.length > 0 && (
                  <div className="border-t border-slate-100 pt-4 space-y-6">
                    {/* Divisi Selection */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-blue-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Divisi *</span>
                      </div>

                      {filteredDivisions.length === 0 ? (
                        <div className="text-center py-4 text-slate-400 text-xs">Tidak ada divisi terpilih</div>
                      ) : (
                        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto no-scrollbar">
                          {filteredDivisions.map((division) => (
                            <button
                              key={division.id}
                              type="button"
                              onClick={() => handleDivisionToggle(division.id)}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all active:scale-95 ${
                                formData.divisionIds.includes(division.id) ? "border-blue-600 bg-blue-600 text-white shadow-xl" : "border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-200"
                              }`}
                            >
                              <Hash className={`w-3 h-3 ${formData.divisionIds.includes(division.id) ? "text-blue-200" : "text-slate-300"}`} />
                              <span className="text-[11px] font-black uppercase tracking-tight">{division.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Personel Selection (Multi-select List) */}
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Personel Spesifik</span>
                      </div>

                      {formData.divisionIds.length === 0 ? (
                        <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pilih Divisi Dulu</p>
                        </div>
                      ) : loadingUsers ? (
                        <div className="flex flex-col items-center justify-center py-6 space-y-2">
                          <Clock className="w-5 h-5 text-blue-500 animate-spin" />
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Memuat Daftar Personel...</p>
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
                  </div>
                )}
              </section>
            </div>
          </form>
        </div>

        {/* Action Footer */}
        <div className="px-8 py-8 bg-white border-t border-slate-50 shrink-0">
          <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
            <Button type="button" variant="ghost" onClick={handleClose} disabled={loading} className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 active:scale-95">
              Batalkan
            </Button>
            <Button
              type="submit"
              form="project-form"
              disabled={loading}
              className="flex-[2] h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 animate-spin" /> <span>Mengunggah...</span>
                </div>
              ) : (
                "Inisiasi Project Baru"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
