"use client";

import { useState, useEffect } from "react";
import { Loader2, Clock, Filter } from "lucide-react";
import { ReportDetailModal } from "./ReportDetailModal";
import { useToast } from "@/components/ui/use-toast";

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

const PERIODS = [
  { value: "08-10", label: "08:00 - 10:00" },
  { value: "10-12", label: "10:00 - 12:00" },
  { value: "12-14", label: "12:00 - 14:00" },
  { value: "14-16", label: "14:00 - 16:00" },
];

export function RealtimeReportsTable() {
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "today">("all");
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    loadReports();
  }, [filter, selectedPeriods]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("filter", filter);
      if (selectedPeriods.length > 0) {
        params.set("periods", selectedPeriods.join(","));
      }

      const res = await fetch(`/api/admin/reports/realtime?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setReports(data.data || []);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePeriod = (period: string) => {
    setSelectedPeriods((prev) =>
      prev.includes(period)
        ? prev.filter((p) => p !== period)
        : [...prev, period]
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getPeriodLabel = (period: string) => {
    const found = PERIODS.find((p) => p.value === period);
    return found ? found.label : period;
  };

  const getDivisions = (report: Report) => {
    return report.projects.project_divisions
      .map((pd) => pd.divisions.name)
      .join(", ") || "-";
  };

  const getDepartments = (report: Report) => {
    return report.projects.project_department_divisions
      .map((pd) => pd.departments.name)
      .join(", ") || "-";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Monitoring Laporan Real-time</h2>
          <p className="text-sm text-gray-600 mt-1">Pantau semua laporan project dari seluruh divisi</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>Update otomatis</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Filter className="w-4 h-4" />
          Filter Laporan
        </div>

        {/* Date Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === "all"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilter("today")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === "today"
                ? "bg-blue-500 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Hari Ini
          </button>
        </div>

        {/* Period Filter */}
        <div>
          <p className="text-xs text-gray-500 mb-2">Sesi Waktu (bisa pilih lebih dari satu)</p>
          <div className="flex flex-wrap gap-2">
            {PERIODS.map((period) => (
              <button
                key={period.value}
                onClick={() => togglePeriod(period.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedPeriods.includes(period.value)
                    ? "bg-purple-500 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center p-12">
            <p className="text-gray-500">Tidak ada laporan ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Nama Pelapor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Divisi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Jam
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tanggal
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    onClick={() => setSelectedReport(report)}
                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {report.users.name}
                      </div>
                      <div className="text-xs text-gray-500">{report.users.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{report.projects.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">{getDivisions(report)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">{getDepartments(report)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {getPeriodLabel(report.period)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(report.created_at)}
                      <div className="text-xs text-gray-400">{formatTime(report.created_at)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Total Count */}
      <div className="text-sm text-gray-600 text-center">
        Total: <span className="font-semibold">{reports.length}</span> laporan
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}
