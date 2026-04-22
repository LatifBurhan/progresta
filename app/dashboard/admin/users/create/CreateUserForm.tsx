"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UserPlus, Eye, EyeOff, Building2, Layers, Mail, Lock, User, Phone, Briefcase, MapPin, FileText, ShieldCheck, ChevronRight, Sparkles } from "lucide-react";

interface Department {
  id: string;
  name: string;
  color: string;
}

interface Division {
  id: string;
  name: string;
  color: string | null;
  department_id: string;
}

interface CreateUserFormProps {
  divisions: Division[];
}

export default function CreateUserForm({ divisions: allDivisions }: CreateUserFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
    position: "",
    employee_status: "",
    address: "",
    notes: "",
    role: "STAFF",
    departmentId: "",
    divisionId: "",
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDivisions, setFilteredDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments();
  }, []);

  // Filter divisions when department changes
  useEffect(() => {
    if (formData.departmentId) {
      const filtered = allDivisions.filter((div) => div.department_id === formData.departmentId);
      setFilteredDivisions(filtered);
      // Reset division selection if current division is not in filtered list
      if (formData.divisionId && !filtered.find((d) => d.id === formData.divisionId)) {
        setFormData((prev) => ({ ...prev, divisionId: "" }));
      }
    } else {
      setFilteredDivisions([]);
      setFormData((prev) => ({ ...prev, divisionId: "" }));
    }
  }, [formData.departmentId, allDivisions]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password || !formData.name || !formData.departmentId || !formData.divisionId) {
      setError("Semua field wajib harus diisi");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/users/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          position: formData.position,
          employee_status: formData.employee_status,
          address: formData.address,
          notes: formData.notes,
          role: formData.role,
          divisionId: formData.divisionId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess("User berhasil dibuat! Mengalihkan...");
        // Reset form
        setFormData({
          email: "",
          password: "",
          name: "",
          phone: "",
          position: "",
          employee_status: "",
          address: "",
          notes: "",
          role: "STAFF",
          departmentId: "",
          divisionId: "",
        });
        // Redirect after 1.5 seconds
        setTimeout(() => {
          router.push("/dashboard/admin/users/manage");
        }, 1500);
      } else {
        setError(result.message || "Gagal membuat user");
      }
    } catch (error) {
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: "STAFF", label: "Staff", description: "Akses standar pelaporan", icon: User, color: "blue" },
    { value: "PM", label: "Project Manager", description: "Monitoring project & tim", icon: Briefcase, color: "emerald" },
    { value: "GENERAL_AFFAIR", label: "HRD", description: "Manajemen karyawan", icon: ShieldCheck, color: "amber" },
    { value: "CEO", label: "CEO", description: "Akses penuh sistem", icon: Sparkles, color: "purple" },
  ];

  return (
    <Card className="max-w-4xl mx-auto border-slate-100 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-50 py-8 px-10">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200 ring-4 ring-blue-50">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">Tambah User Baru</CardTitle>
            <p className="text-sm text-slate-500 font-medium">Daftarkan personel baru untuk mengakses sistem Progresta</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-10">
        {error && (
          <div className="mb-8 p-4 bg-red-50/50 border border-red-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-sm text-red-700 font-bold">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-8 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-sm text-emerald-700 font-bold">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-12">
          {/* Section 1: Akun & Otoritas */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Lock className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Otoritas & Keamanan</h3>
              <div className="flex-1 h-px bg-slate-100 ml-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2.5">
                <Label htmlFor="email" className="text-slate-700 font-black text-[11px] uppercase tracking-wider ml-1">
                  Email <span className="text-red-500">*</span>
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="user@company.com"
                    required
                    className="pl-11 h-12 bg-slate-50/50 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-50/50 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="password" className="text-slate-700 font-black text-[11px] uppercase tracking-wider ml-1">
                  Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Minimal 6 karakter"
                    required
                    className="pl-11 h-12 bg-slate-50/50 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-blue-50/50 transition-all font-medium"
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 rounded-lg transition-colors" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff className="h-4 w-4 text-slate-400" /> : <Eye className="h-4 w-4 text-slate-400" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-slate-700 font-black text-[11px] uppercase tracking-wider ml-1">
                Pilih Otoritas Akses <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isSelected = formData.role === role.value;
                  return (
                    <label
                      key={role.value}
                      className={cn(
                        "relative flex flex-col items-center text-center gap-3 p-5 rounded-3xl border-2 cursor-pointer transition-all duration-300",
                        isSelected ? `border-${role.color}-500 bg-${role.color}-50/30 ring-4 ring-${role.color}-50 shadow-lg shadow-${role.color}-100/50` : "border-slate-50 bg-slate-50/50 hover:border-slate-200 hover:bg-slate-100/50",
                      )}
                    >
                      <input type="radio" name="role" value={role.value} checked={isSelected} onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))} className="sr-only" />
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-all", isSelected ? `bg-${role.color}-500 text-white shadow-lg shadow-${role.color}-200` : "bg-white text-slate-400 shadow-sm")}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <div className={cn("font-black text-[10px] uppercase tracking-[0.1em]", isSelected ? `text-${role.color}-700` : "text-slate-700")}>{role.label}</div>
                        <p className="text-[10px] text-slate-400 font-medium leading-tight px-2">{role.description}</p>
                      </div>
                      {isSelected && (
                        <div className={cn("absolute -top-2 -right-2 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center shadow-md", `bg-${role.color}-500`)}>
                          <ChevronRight className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Section 2: Data Pribadi */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <User className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Identitas Personel</h3>
              <div className="flex-1 h-px bg-slate-100 ml-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2.5">
                <Label htmlFor="name" className="text-slate-700 font-black text-[11px] uppercase tracking-wider ml-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Nama lengkap karyawan"
                    required
                    className="pl-11 h-12 bg-slate-50/50 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-emerald-50/50 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="phone" className="text-slate-700 font-black text-[11px] uppercase tracking-wider ml-1">
                  Nomor Telepon
                </Label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="08xxxxxxxxxx"
                    className="pl-11 h-12 bg-slate-50/50 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-emerald-50/50 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="address" className="text-slate-700 font-black text-[11px] uppercase tracking-wider ml-1">
                Alamat Tinggal
              </Label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
                <textarea
                  id="address"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-50/50 focus:border-emerald-100 transition-all font-medium min-h-[100px] resize-none"
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Alamat lengkap karyawan"
                />
              </div>
            </div>
          </section>

          {/* Section 3: Penempatan Kerja */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Jabatan & Penempatan</h3>
              <div className="flex-1 h-px bg-slate-100 ml-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2.5">
                <Label htmlFor="position" className="text-slate-700 font-black text-[11px] uppercase tracking-wider ml-1">
                  Posisi / Jabatan
                </Label>
                <div className="relative group">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                  <Input
                    id="position"
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value }))}
                    placeholder="Frontend Developer, Marketing, dll"
                    className="pl-11 h-12 bg-slate-50/50 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-purple-50/50 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="employee_status" className="text-slate-700 font-black text-[11px] uppercase tracking-wider ml-1">
                  Status Karyawan
                </Label>
                <div className="relative group">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                  <Input
                    id="employee_status"
                    type="text"
                    value={formData.employee_status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, employee_status: e.target.value }))}
                    placeholder="Tetap, Kontrak, Magang, dll"
                    className="pl-11 h-12 bg-slate-50/50 border-slate-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-purple-50/50 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2.5">
                <Label htmlFor="department" className="text-slate-700 font-black text-[11px] uppercase tracking-wider ml-1">
                  Departemen <span className="text-red-500">*</span>
                </Label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                  <select
                    id="department"
                    value={formData.departmentId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, departmentId: e.target.value }))}
                    className="w-full pl-11 pr-10 h-12 bg-slate-50/50 border border-slate-100 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-50/50 focus:border-purple-100 transition-all font-bold appearance-none text-sm"
                    required
                  >
                    <option value="">Pilih Departemen</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="division" className="text-slate-700 font-black text-[11px] uppercase tracking-wider ml-1">
                  Divisi <span className="text-red-500">*</span>
                </Label>
                <div className="relative group">
                  <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                  <select
                    id="division"
                    value={formData.divisionId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, divisionId: e.target.value }))}
                    className="w-full pl-11 pr-10 h-12 bg-slate-50/50 border border-slate-100 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-50/50 focus:border-purple-100 transition-all font-bold appearance-none text-sm disabled:bg-slate-100 disabled:cursor-not-allowed"
                    required
                    disabled={!formData.departmentId}
                  >
                    <option value="">{formData.departmentId ? "Pilih Divisi" : "Pilih Departemen Dulu"}</option>
                    {filteredDivisions.map((division) => (
                      <option key={division.id} value={division.id}>
                        {division.name}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Catatan */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Catatan Internal</h3>
              <div className="flex-1 h-px bg-slate-100 ml-2" />
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between ml-1">
                <Label htmlFor="notes" className="text-slate-700 font-black text-[11px] uppercase tracking-wider">
                  Keterangan Tambahan
                </Label>
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 text-[9px] font-black px-2 py-0">ADMIN ONLY</Badge>
              </div>
              <div className="relative group">
                <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-400 group-focus-within:text-amber-600 transition-colors" />
                <textarea
                  id="notes"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-amber-50/50 focus:border-amber-100 transition-all font-medium min-h-[100px] resize-none"
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Catatan internal (hanya untuk Admin & HRD)"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-bold ml-1 flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" />
                Data ini tersembunyi dari profil publik karyawan.
              </p>
            </div>
          </section>

          {/* Submit Button */}
          <div className="pt-8 border-t border-slate-50">
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Mendaftarkan User...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Daftarkan Personel Baru</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              )}
            </Button>
            <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-widest mt-6">Progresta © 2026 • Professional HR Management System</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
