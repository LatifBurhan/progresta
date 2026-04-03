"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PhotoUploader } from "./PhotoUploader";
import { validateReportForm } from "@/lib/validations/report-validation";
import { useToast } from "@/components/ui/use-toast";
import type { ReportFormData, Project, LokasiKerja } from "@/types/report";
import { Loader2, Briefcase, MapPin, CheckCircle2, AlertCircle, Rocket, Image as ImageIcon } from "lucide-react";

interface ReportFormProps {
  mode: "create" | "edit";
  reportId?: string;
  initialData?: Partial<ReportFormData>;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReportForm({ mode, reportId, initialData, onSuccess, onCancel }: ReportFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState<ReportFormData>({
    project_id: initialData?.project_id || "",
    lokasi_kerja: initialData?.lokasi_kerja || "Kantor",
    pekerjaan_dikerjakan: initialData?.pekerjaan_dikerjakan || "",
    kendala: initialData?.kendala || "",
    rencana_kedepan: initialData?.rencana_kedepan || "",
    foto_urls: initialData?.foto_urls || [],
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    loadProjects();
    loadUserSession();
  }, []);

  const loadUserSession = async () => {
    try {
      const res = await fetch("/api/auth/check");
      const data = await res.json();
      if (data.authenticated && data.user) setUserId(data.user.userId);
    } catch (error) {
      console.error("Session error:", error);
    }
  };

  const loadProjects = async () => {
    try {
      const res = await fetch("/api/reports/projects");
      const data = await res.json();
      if (data.success) setProjects(data.data || []);
    } catch (error) {
      console.error("Load projects error:", error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const updateField = (field: keyof ReportFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.foto_urls;
      return newErrors;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form (photos are optional, so we don't need placeholder)
    const validationErrors = validateReportForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      let photoUrls = formData.foto_urls;
      if (selectedFiles.length > 0) {
        if (!userId) throw new Error("User session not found");
        const tempReportId = reportId || crypto.randomUUID();
        const uploadFormData = new FormData();
        uploadFormData.append("userId", userId);
        uploadFormData.append("reportId", tempReportId);
        selectedFiles.forEach((file) => uploadFormData.append("files", file));

        const uploadResponse = await fetch("/api/reports/upload-photos", {
          method: "POST",
          body: uploadFormData,
        });
        const uploadResult = await uploadResponse.json();
        if (!uploadResult.success) throw new Error(uploadResult.error || "Upload failed");
        photoUrls = uploadResult.data;
      }

      const endpoint = mode === "create" ? "/api/reports/create" : `/api/reports/update/${reportId}`;
      const response = await fetch(endpoint, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, foto_urls: photoUrls }),
      });
      const result = await response.json();

      if (result.success) {
        toast({ title: "Berhasil", description: "Laporan telah disimpan" });
        onSuccess ? onSuccess() : router.push("/reports");
      } else {
        throw new Error(result.error || "Gagal menyimpan");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loadingProjects) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-slate-400 text-sm font-medium">Memuat formulir...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-4xl mx-auto pb-10">
      {/* 1. Project Selection Grid */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <Label className="text-base font-bold text-slate-800">
            Pilih Project <span className="text-rose-500">*</span>
          </Label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {projects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => updateField("project_id", project.id)}
              className={`relative flex flex-col p-4 rounded-xl border-2 text-left transition-all duration-200 group ${
                formData.project_id === project.id ? "border-blue-500 bg-blue-50/50 ring-4 ring-blue-50" : "border-slate-100 hover:border-slate-200 bg-white"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className={`p-2 rounded-lg ${formData.project_id === project.id ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"}`}>
                  <Briefcase className="w-4 h-4" />
                </div>
                {formData.project_id === project.id && <CheckCircle2 className="w-5 h-5 text-blue-500 animate-in zoom-in duration-300" />}
              </div>
              <span className={`font-bold text-sm ${formData.project_id === project.id ? "text-blue-900" : "text-slate-700"}`}>{project.name}</span>
            </button>
          ))}
        </div>
        {errors.project_id && (
          <p className="text-xs font-bold text-rose-500 flex items-center gap-1 mt-2">
            <AlertCircle className="w-3 h-3" /> {errors.project_id}
          </p>
        )}
      </section>

      {/* 2. Lokasi Kerja Selection */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <MapPin className="w-4 h-4 text-emerald-600" />
          </div>
          <Label className="text-base font-bold text-slate-800">
            Lokasi Kerja <span className="text-rose-500">*</span>
          </Label>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Kantor", "Lokasi Proyek", "Remote"].map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => updateField("lokasi_kerja", loc as LokasiKerja)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold border-2 transition-all ${
                formData.lokasi_kerja === loc ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-100" : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Text Inputs Section */}
      <section className="grid grid-cols-1 gap-8 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
        <div className="space-y-3">
          <Label htmlFor="pekerjaan_dikerjakan" className="flex items-center gap-2 font-bold text-slate-700">
            <CheckCircle2 className="w-4 h-4 text-blue-500" /> Pekerjaan yang Dikerjakan <span className="text-rose-500">*</span>
          </Label>
          <Textarea
            id="pekerjaan_dikerjakan"
            value={formData.pekerjaan_dikerjakan}
            onChange={(e) => updateField("pekerjaan_dikerjakan", e.target.value)}
            className="min-h-[120px] rounded-xl border-slate-200 focus:ring-blue-500 focus:border-blue-500 bg-white"
            placeholder="Gunakan poin-poin agar lebih rapi..."
            disabled={loading}
          />
          {errors.pekerjaan_dikerjakan && (
            <p className="text-xs font-bold text-rose-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.pekerjaan_dikerjakan}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="kendala" className="flex items-center gap-2 font-bold text-slate-700">
              <AlertCircle className="w-4 h-4 text-amber-500" /> Kendala (Opsional)
            </Label>
            <Textarea
              id="kendala"
              value={formData.kendala || ""}
              onChange={(e) => updateField("kendala", e.target.value)}
              className="min-h-[100px] rounded-xl border-slate-200 bg-white"
              placeholder="Apa hambatanmu hari ini?"
              disabled={loading}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="rencana_kedepan" className="flex items-center gap-2 font-bold text-slate-700">
              <Rocket className="w-4 h-4 text-purple-500" /> Rencana Kedepan
            </Label>
            <Textarea
              id="rencana_kedepan"
              value={formData.rencana_kedepan || ""}
              onChange={(e) => updateField("rencana_kedepan", e.target.value)}
              className="min-h-[100px] rounded-xl border-slate-200 bg-white"
              placeholder="Langkah selanjutnya..."
              disabled={loading}
            />
          </div>
        </div>
      </section>

      {/* 4. Photo Uploader Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-blue-600" />
          </div>
          <Label className="text-base font-bold text-slate-800">
            Lampiran Foto <span className="text-slate-400 text-sm font-normal">(Opsional)</span>
          </Label>
        </div>
        <div className="bg-white p-2 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors">
          <PhotoUploader onFilesSelected={handleFilesSelected} initialPhotos={mode === "edit" ? formData.foto_urls : []} error={errors.foto_urls} />
        </div>
      </section>

      {/* Action Buttons */}
      <footer className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
        <Button type="submit" disabled={loading} className="flex-[2] h-12 rounded-xl bg-slate-900 hover:bg-black text-white font-bold shadow-xl shadow-slate-200 transition-all hover:-translate-y-0.5">
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Menyimpan...
            </>
          ) : mode === "create" ? (
            "Kirim Laporan Sekarang"
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel || (() => router.push("/reports"))} disabled={loading} className="flex-1 h-12 rounded-xl border-2 border-slate-100 font-bold text-slate-500 hover:bg-slate-50">
          Batalkan
        </Button>
      </footer>
    </form>
  );
}
