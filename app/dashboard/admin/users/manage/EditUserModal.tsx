"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Edit, Eye, EyeOff, Mail, User as UserIcon, Phone, Briefcase, Lock, Shield, Layers, CheckCircle2, AlertCircle, Clock, Building2 } from "lucide-react";

interface Department {
  id: string;
  name: string;
  color: string;
}

interface UserData {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  divisionId: string | null;
  profile: {
    name: string | null;
    fotoProfil: string | null;
    phone: string | null;
    position: string | null;
  } | null;
  division?: {
    name: string;
    color: string | null;
  } | null;
}

interface Division {
  id: string;
  name: string;
  color: string | null;
  department_id: string;
}

interface EditUserModalProps {
  open: boolean;
  user: UserData | null;
  divisions: Division[];
  onClose: () => void;
  onSuccess: (updatedUser: UserData) => void;
}

export default function EditUserModal({ open, user, divisions: allDivisions, onClose, onSuccess }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    position: "",
    role: "KARYAWAN",
    departmentId: "",
    divisionId: "",
    password: "",
    changePassword: false,
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDivisions, setFilteredDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Fetch departments on mount
  useEffect(() => {
    if (open) {
      fetchDepartments();
    }
  }, [open]);

  // Filter divisions when department changes
  useEffect(() => {
    if (formData.departmentId) {
      const filtered = allDivisions.filter(div => div.department_id === formData.departmentId);
      setFilteredDivisions(filtered);
      // Reset division selection if current division is not in filtered list
      if (formData.divisionId && !filtered.find(d => d.id === formData.divisionId)) {
        setFormData(prev => ({ ...prev, divisionId: '' }));
      }
    } else {
      setFilteredDivisions([]);
    }
  }, [formData.departmentId, allDivisions]);

  useEffect(() => {
    if (user) {
      // Find user's division to get department_id
      const userDivision = allDivisions.find(d => d.id === user.divisionId);
      
      setFormData({
        email: user.email,
        name: user.profile?.name || "",
        phone: user.profile?.phone || "",
        position: user.profile?.position || "",
        role: user.role,
        departmentId: userDivision?.department_id || "",
        divisionId: user.divisionId || "",
        password: "",
        changePassword: false,
      });
    }
  }, [user, allDivisions]);

  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const response = await fetch("/api/admin/departments");
      const result = await response.json();
      if (result.success && result.departments) {
        setDepartments(result.departments);
      }
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    } finally {
      setLoadingDepartments(false);
    }
  };

  if (!open || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.name || !formData.departmentId || !formData.divisionId) {
      setError("Email, nama, departemen, dan divisi wajib diisi");
      return;
    }

    if (formData.changePassword && formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const updateData: any = {
        userId: user.id,
        email: formData.email,
        name: formData.name,
        phone: formData.phone || null,
        position: formData.position || null,
        role: formData.role,
        divisionId: formData.divisionId,
      };

      if (formData.changePassword && formData.password) {
        updateData.password = formData.password;
      }

      console.log('Sending update data:', updateData); // Debug log

      const response = await fetch("/api/admin/users/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      console.log('Update result:', result); // Debug log

      if (result.success) {
        onSuccess(result.user);
        onClose();
        alert("User berhasil diupdate!");
      } else {
        setError(result.message || "Gagal mengupdate user");
      }
    } catch (error) {
      console.error('Update error:', error); // Debug log
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: "KARYAWAN", label: "👨‍💻 Karyawan", description: "Akses standar untuk pelaporan" },
    { value: "PM", label: "📊 Project Manager", description: "Monitoring project dan tim" },
    { value: "HRD", label: "👥 HRD", description: "Manajemen karyawan dan approval" },
    { value: "CEO", label: "👑 CEO", description: "Akses penuh ke semua data" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-white w-full sm:max-w-[98vw] h-[98vh] sm:h-[98vh] sm:max-h-[98vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-500">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-100 ring-4 ring-blue-50">
              <Edit className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Profile Karyawan</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">{user.profile?.name || user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-full bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
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

          <form id="edit-user-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* LEFT COLUMN: Personal Info */}
            <div className="lg:col-span-7 space-y-10">
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Informasi Personal</h4>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Name */}
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-black text-slate-500 ml-1 uppercase">Nama Lengkap *</Label>
                      <div className="relative group">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                          className="pl-11 h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-base font-medium shadow-sm"
                          placeholder="Nama lengkap karyawan"
                          value={formData.name}
                          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-black text-slate-500 ml-1 uppercase">Email *</Label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                          className="pl-11 h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-base font-medium shadow-sm"
                          type="email"
                          placeholder="user@company.com"
                          value={formData.email}
                          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Phone */}
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-black text-slate-500 ml-1 uppercase">No. Telepon</Label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                          className="pl-11 h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-base font-medium shadow-sm"
                          type="tel"
                          placeholder="08xxxxxxxxxx"
                          value={formData.phone}
                          onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                    </div>

                    {/* Position */}
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-black text-slate-500 ml-1 uppercase">Posisi/Jabatan</Label>
                      <div className="relative group">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                        <Input
                          className="pl-11 h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-base font-medium shadow-sm"
                          placeholder="Frontend Developer, dll"
                          value={formData.position}
                          onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Password Section */}
              <section className="space-y-6">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                  <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Keamanan Akun</h4>
                </div>

                <div className={`p-6 rounded-[2rem] border-2 transition-all ${formData.changePassword ? "border-amber-200 bg-amber-50/30" : "border-slate-50 bg-slate-50/50"}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${formData.changePassword ? "bg-amber-100 text-amber-600" : "bg-slate-200 text-slate-400"}`}>
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <Label htmlFor="changePassword" className="text-sm font-black text-slate-700 cursor-pointer">
                          Ubah Password
                        </Label>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Berikan akses login baru</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      id="changePassword"
                      className="w-5 h-5 rounded-lg border-slate-300 text-amber-600 focus:ring-amber-500"
                      checked={formData.changePassword}
                      onChange={(e) => setFormData((prev) => ({ ...prev, changePassword: e.target.checked, password: "" }))}
                    />
                  </div>

                  {formData.changePassword && (
                    <div className="relative animate-in slide-in-from-top-2 duration-300">
                      <Input
                        className="h-14 rounded-2xl border-amber-100 bg-white focus:ring-2 focus:ring-amber-100 pr-12 font-medium"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                        placeholder="Minimal 6 karakter"
                      />
                      <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN: Role & Division */}
            <div className="lg:col-span-5 space-y-10">
              {/* Role Selection */}
              <section className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Otoritas & Hak Akses *</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {roles.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, role: role.value }))}
                      className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                        formData.role === role.value ? "border-indigo-600 bg-indigo-50/50 shadow-md" : "border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-200"
                      }`}
                    >
                      <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${formData.role === role.value ? "border-indigo-600 bg-indigo-600" : "border-slate-300"}`}>
                        {formData.role === role.value && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className={`font-black text-xs uppercase tracking-tight ${formData.role === role.value ? "text-indigo-900" : "text-slate-600"}`}>{role.label}</div>
                        <div className="text-[10px] font-bold text-slate-400 leading-tight mt-0.5">{role.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Division Selection */}
              <section className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm space-y-6">
                {/* Department Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Departemen *</span>
                  </div>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-50 bg-slate-50 focus:border-blue-500 focus:bg-white transition-all text-sm font-bold outline-none"
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

                {/* Division Selection */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Penempatan Divisi *</span>
                  </div>

                  {!formData.departmentId ? (
                    <div className="p-4 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 text-center">
                      <p className="text-xs font-bold text-slate-400">Pilih departemen terlebih dahulu</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto no-scrollbar">
                      {filteredDivisions.length === 0 ? (
                        <div className="w-full p-4 rounded-xl bg-amber-50 border-2 border-amber-200 text-center">
                          <p className="text-xs font-bold text-amber-600">Tidak ada divisi di departemen ini</p>
                        </div>
                      ) : (
                        filteredDivisions.map((division) => (
                          <button
                            key={division.id}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, divisionId: division.id }))}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all active:scale-95 ${
                              formData.divisionId === division.id ? "border-slate-900 bg-slate-900 text-white shadow-xl" : "border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-200"
                            }`}
                          >
                            <CheckCircle2 className={`w-3.5 h-3.5 ${formData.divisionId === division.id ? "text-blue-400" : "text-slate-300"}`} />
                            <span className="text-[11px] font-black uppercase tracking-tight">{division.name}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </section>
            </div>
          </form>
        </div>

        {/* Action Footer */}
        <div className="px-8 py-8 bg-white border-t border-slate-50 shrink-0">
          <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
            <div className="flex gap-4 w-full">
              <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-slate-50 active:scale-95">
                Batal
              </Button>
              <Button
                type="submit"
                form="edit-user-form"
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
