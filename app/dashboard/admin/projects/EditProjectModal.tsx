"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Edit, Calendar, User, Target, FileText, AlertCircle, Link } from "lucide-react";

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

interface EditProjectModalProps {
  open: boolean;
  project: Project;
  divisions: Division[];
  onClose: () => void;
  onSuccess: (updatedProject: Project) => void;
  onDelete: () => void;
}

export default function EditProjectModal({ open, project, divisions, onClose, onSuccess, onDelete }: EditProjectModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    tujuan: "",
    description: "",
    divisionIds: [] as string[],
    pic: "",
    prioritas: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    outputDiharapkan: "",
    catatan: "",
    lampiranUrl: "",
    status: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Initialize form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || "",
        tujuan: project.tujuan || "",
        description: project.description || "",
        divisionIds: project.divisions?.map((d) => d.id) || [],
        pic: project.pic || "",
        prioritas: project.prioritas || "",
        tanggalMulai: project.tanggal_mulai || "",
        tanggalSelesai: project.tanggal_selesai || "",
        outputDiharapkan: project.output_diharapkan || "",
        catatan: project.catatan || "",
        lampiranUrl: project.lampiran_url || "",
        status: project.status || "Aktif",
      });
    }
  }, [project]);

  if (!open) return null;

  const calculateDuration = () => {
    if (!formData.tanggalMulai || !formData.tanggalSelesai) return null;

    const start = new Date(formData.tanggalMulai);
    const end = new Date(formData.tanggalSelesai);

    if (end <= start) return null;

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Nama project wajib diisi");
      return;
    }

    if (!formData.divisionIds.length) {
      setError("Minimal satu divisi wajib dipilih");
      return;
    }

    if (formData.tanggalMulai && formData.tanggalSelesai) {
      const start = new Date(formData.tanggalMulai);
      const end = new Date(formData.tanggalSelesai);

      if (end <= start) {
        setError("Tanggal selesai harus setelah tanggal mulai");
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/projects/${project.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          tujuan: formData.tujuan.trim() || null,
          description: formData.description.trim() || null,
          divisionIds: formData.divisionIds,
          pic: formData.pic.trim() || null,
          prioritas: formData.prioritas || null,
          tanggalMulai: formData.tanggalMulai || null,
          tanggalSelesai: formData.tanggalSelesai || null,
          outputDiharapkan: formData.outputDiharapkan.trim() || null,
          catatan: formData.catatan.trim() || null,
          lampiranUrl: formData.lampiranUrl.trim() || null,
          status: formData.status,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess(result.project);
        onClose();
        alert("Project berhasil diupdate!");
      } else {
        setError(result.message || "Gagal mengupdate project");
      }
    } catch (error) {
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  const duration = calculateDuration();
  const selectedDivisions = divisions.filter((d) => formData.divisionIds.includes(d.id));

  const handleDivisionToggle = (divisionId: string) => {
    setFormData((prev) => ({
      ...prev,
      divisionIds: prev.divisionIds.includes(divisionId) ? prev.divisionIds.filter((id) => id !== divisionId) : [...prev.divisionIds, divisionId],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Edit className="w-5 h-5 text-blue-600" />
              Edit Project: {project.name}
            </h3>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Project Name */}
                <div>
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Nama Project *
                  </Label>
                  <Input id="name" type="text" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} placeholder="Contoh: Website Company Profile" required />
                </div>

                {/* Status */}
                <div>
                  <Label htmlFor="status">Status Project</Label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Non-Aktif">Non-Aktif</option>
                    <option value="Selesai">Selesai</option>
                    <option value="Ditunda">Ditunda</option>
                    <option value="Dibatalkan">Dibatalkan</option>
                  </select>
                </div>

                {/* Tujuan */}
                <div>
                  <Label htmlFor="tujuan" className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Tujuan Project
                  </Label>
                  <textarea
                    id="tujuan"
                    value={formData.tujuan}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tujuan: e.target.value }))}
                    placeholder="Jelaskan tujuan dari project ini..."
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Deskripsi Project</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Deskripsi detail tentang project ini..."
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                </div>

                {/* PIC */}
                <div>
                  <Label htmlFor="pic" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    PIC (Person In Charge)
                  </Label>
                  <Input id="pic" type="text" value={formData.pic} onChange={(e) => setFormData((prev) => ({ ...prev, pic: e.target.value }))} placeholder="Nama PIC yang bertanggung jawab" />
                </div>

                {/* Priority */}
                <div>
                  <Label htmlFor="prioritas">Prioritas</Label>
                  <select
                    id="prioritas"
                    value={formData.prioritas}
                    onChange={(e) => setFormData((prev) => ({ ...prev, prioritas: e.target.value }))}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Pilih Prioritas --</option>
                    <option value="Rendah">Rendah</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Tinggi">Tinggi</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Divisions Multi-Select */}
                <div>
                  <Label>Divisi yang Terlibat *</Label>
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
                    {divisions.map((division) => (
                      <div key={division.id} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={`division-${division.id}`}
                          checked={formData.divisionIds.includes(division.id)}
                          onChange={() => handleDivisionToggle(division.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor={`division-${division.id}`} className="flex items-center space-x-2 cursor-pointer flex-1">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: division.color || "#3B82F6" }} />
                          <span className="text-sm font-medium text-gray-700">{division.name}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                  {formData.divisionIds.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedDivisions.map((division) => (
                        <span key={division.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: division.color || "#3B82F6" }}>
                          {division.name}
                          <button type="button" onClick={() => handleDivisionToggle(division.id)} className="ml-1 hover:bg-black hover:bg-opacity-20 rounded-full p-0.5">
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Timeline */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tanggalMulai" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Tanggal Mulai
                    </Label>
                    <Input id="tanggalMulai" type="date" value={formData.tanggalMulai} onChange={(e) => setFormData((prev) => ({ ...prev, tanggalMulai: e.target.value }))} />
                  </div>

                  <div>
                    <Label htmlFor="tanggalSelesai">Tanggal Selesai</Label>
                    <Input id="tanggalSelesai" type="date" value={formData.tanggalSelesai} onChange={(e) => setFormData((prev) => ({ ...prev, tanggalSelesai: e.target.value }))} min={formData.tanggalMulai || undefined} />
                  </div>
                </div>

                {/* Duration Display */}
                {duration && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center gap-2 text-blue-700">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">Durasi: {duration} hari</span>
                    </div>
                  </div>
                )}

                {/* Output Diharapkan */}
                <div>
                  <Label htmlFor="outputDiharapkan">Output yang Diharapkan</Label>
                  <textarea
                    id="outputDiharapkan"
                    value={formData.outputDiharapkan}
                    onChange={(e) => setFormData((prev) => ({ ...prev, outputDiharapkan: e.target.value }))}
                    placeholder="Jelaskan output/hasil yang diharapkan dari project ini..."
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                {/* Catatan */}
                <div>
                  <Label htmlFor="catatan">Catatan/Keterangan</Label>
                  <textarea
                    id="catatan"
                    value={formData.catatan}
                    onChange={(e) => setFormData((prev) => ({ ...prev, catatan: e.target.value }))}
                    placeholder="Catatan tambahan atau keterangan khusus..."
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={2}
                  />
                </div>

                {/* Lampiran URL */}
                <div>
                  <Label htmlFor="lampiranUrl" className="flex items-center gap-2">
                    <Link className="w-4 h-4" />
                    Link Lampiran
                  </Label>
                  <Input id="lampiranUrl" type="url" value={formData.lampiranUrl} onChange={(e) => setFormData((prev) => ({ ...prev, lampiranUrl: e.target.value }))} placeholder="https://drive.google.com/... atau link dokumen lainnya" />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t mt-4">
              <Button type="button" variant="ghost" onClick={onDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50 sm:mr-auto" disabled={loading}>
                Hapus Project
              </Button>

              <div className="flex gap-3 flex-1 sm:flex-none">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1 sm:w-32" disabled={loading}>
                  Batal
                </Button>
                <Button type="submit" className="flex-1 sm:w-48 bg-blue-900 hover:bg-blue-800" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
