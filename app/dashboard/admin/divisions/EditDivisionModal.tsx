"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Layers, Palette, FileText, CheckCircle2, Clock, AlertCircle, Building2 } from "lucide-react";

interface Department {
  id: string;
  name: string;
  color: string;
}

interface Division {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  userCount: number;
  projectCount: number;
  department_id?: string;
}

interface EditDivisionModalProps {
  open: boolean;
  division: Division | null;
  onClose: () => void;
  onSuccess: (updatedDivision: Division) => void;
}

export default function EditDivisionModal({ open, division, onClose, onSuccess }: EditDivisionModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
    departmentId: "",
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [error, setError] = useState("");

  // Fetch departments when modal opens
  useEffect(() => {
    if (open) {
      fetchDepartments();
    }
  }, [open]);

  useEffect(() => {
    if (division) {
      setFormData({
        name: division.name,
        description: division.description || "",
        color: division.color || "#3B82F6",
        departmentId: division.department_id || "",
      });
    }
  }, [division]);

  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const response = await fetch("/api/admin/departments");
      const result = await response.json();

      if (result.success && result.departments) {
        setDepartments(result.departments);
      } else {
        console.error("Failed to fetch departments:", result.message);
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    } finally {
      setLoadingDepartments(false);
    }
  };

  if (!open || !division) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Nama divisi wajib diisi");
      return;
    }

    if (!formData.departmentId) {
      setError("Departemen wajib dipilih");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/divisions/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          divisionId: division.id,
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          color: formData.color,
          departmentId: formData.departmentId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess(result.division);
        handleClose();
        alert("Divisi berhasil diupdate!");
      } else {
        setError(result.message || "Gagal mengupdate divisi");
      }
    } catch (error) {
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError("");
    onClose();
  };

  const colorOptions = [
    { name: "Biru", value: "#3B82F6" },
    { name: "Hijau", value: "#10B981" },
    { name: "Ungu", value: "#8B5CF6" },
    { name: "Merah", value: "#EF4444" },
    { name: "Orange", value: "#F59E0B" },
    { name: "Pink", value: "#EC4899" },
    { name: "Indigo", value: "#6366F1" },
    { name: "Teal", value: "#14B8A6" },
    { name: "Gray", value: "#6B7280" },
    { name: "Emerald", value: "#059669" },
  ];

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
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Detail Divisi</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{division.name}</p>
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

          <form id="edit-division-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* LEFT COLUMN: Main Info */}
            <div className="lg:col-span-7 space-y-10">
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Identitas Divisi</h4>
                </div>

                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-black text-slate-500 ml-1 uppercase">Departemen *</Label>
                    <div className="relative group">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors z-10 pointer-events-none" />
                      <select
                        className="w-full pl-11 h-14 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-base font-medium shadow-sm appearance-none cursor-pointer outline-none"
                        value={formData.departmentId}
                        onChange={(e) => setFormData((prev) => ({ ...prev, departmentId: e.target.value }))}
                        required
                      >
                        <option value="">Pilih Departemen</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-black text-slate-500 ml-1 uppercase">Nama Divisi *</Label>
                    <div className="relative group">
                      <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                      <Input
                        className="pl-11 h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-base font-medium shadow-sm"
                        placeholder="Contoh: Divisi IT Al-Wustho"
                        value={formData.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-black text-slate-500 ml-1 uppercase">Deskripsi Divisi</Label>
                    <div className="relative group">
                      <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-300 group-focus-within:text-slate-500 transition-colors" />
                      <textarea
                        className="w-full pl-11 pr-4 py-4 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-slate-100 transition-all text-sm font-medium shadow-sm min-h-[140px] outline-none"
                        placeholder="Detail tanggung jawab divisi..."
                        value={formData.description}
                        onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Stats Card */}
              <section className="grid grid-cols-2 gap-5">
                <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Karyawan</p>
                    <p className="text-xl font-black text-slate-900">{division.userCount} Orang</p>
                  </div>
                </div>
                <div className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project</p>
                    <p className="text-xl font-black text-slate-900">{division.projectCount} Aktif</p>
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN: Style Settings */}
            <div className="lg:col-span-5 space-y-10">
              <section className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="w-4 h-4 text-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Identitas Visual</span>
                </div>

                <div className="space-y-4">
                  <Label className="text-[11px] font-black text-slate-500 ml-1 uppercase">Warna Divisi</Label>
                  <div className="grid grid-cols-5 gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, color: color.value }))}
                        className={`w-full aspect-square rounded-xl border-4 transition-all hover:scale-105 active:scale-95 ${formData.color === color.value ? "border-slate-900 shadow-lg" : "border-white shadow-sm hover:border-slate-100"}`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <Label className="text-[11px] font-black text-slate-500 ml-1 uppercase mb-3 block">Preview Label</Label>
                  <div className="p-6 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center">
                    <div className="flex items-center gap-3 px-6 py-3 rounded-2xl shadow-xl animate-in zoom-in duration-300" style={{ backgroundColor: formData.color }}>
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white font-black text-lg">{formData.name.charAt(0).toUpperCase() || "D"}</div>
                      <span className="text-white font-black uppercase tracking-wider text-sm">{formData.name || "Nama Divisi"}</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </form>
        </div>

        {/* Action Footer */}
        <div className="px-8 py-8 bg-white border-t border-slate-50 shrink-0">
          <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
            <div className="flex gap-4 w-full">
              <Button type="button" variant="ghost" onClick={handleClose} disabled={loading} className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 active:scale-95">
                Batalkan
              </Button>
              <Button
                type="submit"
                form="edit-division-form"
                disabled={loading}
                className="flex-[2] h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 animate-spin" /> <span>Menyimpan...</span>
                  </div>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
