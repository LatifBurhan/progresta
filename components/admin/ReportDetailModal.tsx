"use client";

import { X, Briefcase, MapPin, CheckCircle2, AlertCircle, Rocket, Image as ImageIcon, Clock, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Image from "next/image";

interface Report {
  id: string;
  user_id: string;
  project_id: string;
  lokasi_kerja: string;
  pekerjaan_dikerjakan: string;
  kendala: string | null;
  rencana_kedepan: string | null;
  foto_urls: string[];
  created_at: string;
  period: string;
  users: {
    id: string;
    name: string;
    email: string;
  };
  projects: {
    id: string;
    name: string;
    project_divisions: Array<{
      divisions: {
        id: string;
        name: string;
      };
    }>;
    project_department_divisions: Array<{
      departments: {
        id: string;
        name: string;
      };
    }>;
  };
}

interface ReportDetailModalProps {
  report: Report;
  onClose: () => void;
}

export function ReportDetailModal({ report, onClose }: ReportDetailModalProps) {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPeriodLabel = (period: string) => {
    const periods: Record<string, string> = {
      "08-10": "08:00 - 10:00",
      "10-12": "10:00 - 12:00",
      "12-14": "12:00 - 14:00",
      "14-16": "14:00 - 16:00",
    };
    return periods[period] || period;
  };

  const getDivisions = () => {
    return report.projects.project_divisions
      .map((pd) => pd.divisions.name)
      .join(", ") || "-";
  };

  const getDepartments = () => {
    return report.projects.project_department_divisions
      .map((pd) => pd.departments.name)
      .join(", ") || "-";
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Detail Laporan Project
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Info Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-gray-700">Pelapor:</span>
                <span className="text-gray-900">{report.users.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Briefcase className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-gray-700">Project:</span>
                <span className="text-gray-900">{report.projects.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-gray-700">Lokasi:</span>
                <span className="text-gray-900">{report.lokasi_kerja}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-gray-700">Periode:</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {getPeriodLabel(report.period)}
                </span>
              </div>
              <div className="text-sm">
                <span className="font-semibold text-gray-700">Divisi:</span>
                <span className="text-gray-900 ml-2">{getDivisions()}</span>
              </div>
              <div className="text-sm">
                <span className="font-semibold text-gray-700">Department:</span>
                <span className="text-gray-900 ml-2">{getDepartments()}</span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Dibuat: {formatDateTime(report.created_at)}
              </div>
            </div>
          </div>

          {/* Pekerjaan Dikerjakan */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Pekerjaan yang Dikerjakan</h3>
            </div>
            <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
              <p className="text-gray-800 whitespace-pre-wrap">{report.pekerjaan_dikerjakan}</p>
            </div>
          </div>

          {/* Kendala */}
          {report.kendala && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Kendala</h3>
              </div>
              <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-100">
                <p className="text-gray-800 whitespace-pre-wrap">{report.kendala}</p>
              </div>
            </div>
          )}

          {/* Rencana Kedepan */}
          {report.rencana_kedepan && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Rocket className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Rencana Kedepan</h3>
              </div>
              <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-100">
                <p className="text-gray-800 whitespace-pre-wrap">{report.rencana_kedepan}</p>
              </div>
            </div>
          )}

          {/* Foto */}
          {report.foto_urls && report.foto_urls.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Lampiran Foto</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {report.foto_urls.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-400 transition-all group"
                  >
                    <Image
                      src={url}
                      alt={`Foto ${index + 1}`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors font-medium"
          >
            Tutup
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
