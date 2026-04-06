"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDurationFromInterval } from "@/lib/overtime/duration";
import type { OvertimeRequest } from "../components/OvertimeHistory";
import { LocationLink } from "@/components/overtime/LocationLink";

interface AdminRequest extends OvertimeRequest {
  users?: {
    email: string;
    name?: string;
    divisions?: {
      name: string;
      departments?: {
        name: string;
      };
    };
  };
  overtime_sessions?: {
    clock_in_lat: number | null;
    clock_in_lng: number | null;
    clock_out_lat: number | null;
    clock_out_lng: number | null;
  };
}

interface ActiveSession {
  id: string;
  user_id: string;
  start_time: string;
  location: string;
  start_photo_url?: string;
  users?: {
    email: string;
    name?: string;
    divisions?: {
      name: string;
      departments?: {
        name: string;
      };
    };
  };
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

function getTodayJakarta(): string {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

export default function OvertimeAdminClient() {
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved">("all");

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ all: "true" });
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      if (statusFilter !== "all") params.set("approvalStatus", statusFilter);

      const res = await fetch(`/api/overtime/requests?${params}`);
      const data = await res.json();
      if (data.success) setRequests(data.data || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, statusFilter]);

  const fetchActiveSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/overtime/active-sessions");
      const data = await res.json();
      if (data.success) setActiveSessions(data.data || []);
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    fetchActiveSessions();

    // Polling active sessions every 30 seconds
    const interval = setInterval(fetchActiveSessions, 30000);
    return () => clearInterval(interval);
  }, [fetchRequests, fetchActiveSessions]);

  // Update "now" every minute for live duration
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const calculateLiveDuration = (startTime: string) => {
    const start = new Date(startTime).getTime();
    const current = now.getTime();
    const diffMs = current - start;
    if (diffMs < 0) return "0 menit";

    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;

    if (hours > 0) return `${hours} jam ${mins} menit`;
    return `${mins} menit`;
  };

  const handleApprovalToggle = async (req: AdminRequest) => {
    setApprovingId(req.id);
    try {
      const newApproved = req.approval_status !== "approved";
      const res = await fetch("/api/overtime/approve", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: req.id, approved: newApproved }),
      });
      const data = await res.json();
      if (data.success) {
        setRequests((prev) => prev.map((r) => (r.id === req.id ? { ...r, approval_status: data.data.approvalStatus } : r)));
      }
    } catch {
      // silently fail
    } finally {
      setApprovingId(null);
    }
  };

  // Today's recap
  const todayStr = new Date().toISOString().split("T")[0];
  const todayRequests = requests.filter((r) => r.created_at.startsWith(todayStr));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manajemen Lembur</h1>
        <p className="text-sm text-slate-500 mt-1">Kelola dan setujui permintaan lembur karyawan</p>
      </div>

      {/* Daily Recap & Live Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Monitoring */}
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                Sedang Lembur
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </h2>
              <p className="text-xs text-slate-500">Monitoring real-time karyawan aktif</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100 uppercase tracking-wider">{activeSessions.length} Aktif</span>
          </div>

          {activeSessions.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-slate-400 italic">Tidak ada karyawan yang sedang lembur</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/50 group hover:bg-emerald-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-lg shadow-sm group-hover:scale-110 transition-transform overflow-hidden">
                      {session.start_photo_url ? <img src={session.start_photo_url} alt="Awal" className="w-full h-full object-cover" /> : session.users?.name?.charAt(0) || session.users?.email?.charAt(0).toUpperCase() || "K"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{session.users?.name || session.users?.email || "Karyawan"}</p>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                        {session.users?.divisions?.departments?.name || "-"} • {session.users?.divisions?.name || "-"}
                      </p>
                      <p className="text-[10px] text-emerald-600 mt-0.5 flex items-center gap-1 font-medium">
                        <span className="w-1 h-1 rounded-full bg-emerald-500" />
                        Di {session.location}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-600 tracking-tight">{calculateLiveDuration(session.start_time)}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Durasi Berjalan</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily Recap */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Selesai Hari Ini</h2>
              <p className="text-xs text-slate-500">{getTodayJakarta()}</p>
            </div>
            <span className="px-2.5 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-100 uppercase tracking-wider">{todayRequests.length} Pengajuan</span>
          </div>

          {todayRequests.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-slate-400 italic">Belum ada pengajuan lembur yang selesai</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {todayRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl border border-transparent hover:border-slate-200 transition-all">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{req.users?.name || req.users?.email || "Karyawan"}</p>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                      {req.users?.divisions?.departments?.name || "-"} • {req.users?.divisions?.name || "-"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{formatDurationFromInterval(req.duration)}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${
                      req.approval_status === "approved" ? "bg-green-50 text-green-700 border border-green-100" : "bg-yellow-50 text-yellow-700 border border-yellow-100"
                    }`}
                  >
                    {req.approval_status === "approved" ? "Disetujui" : "Menunggu"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Dari Tanggal</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Sampai Tanggal</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "pending" | "approved")}
              className="px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            >
              <option value="all">Semua</option>
              <option value="pending">Menunggu</option>
              <option value="approved">Disetujui</option>
            </select>
          </div>
          <button
            onClick={() => {
              setDateFrom("");
              setDateTo("");
              setStatusFilter("all");
            }}
            className="px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Daftar Lembur</h3>
          <button onClick={fetchRequests} disabled={loading} className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50 flex items-center gap-1">
            <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <svg className="w-6 h-6 animate-spin text-slate-400 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">Tidak ada data lembur</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Karyawan</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Unit Kerja</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lokasi</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lokasi GPS</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Project Leader</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tujuan</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Durasi</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Foto</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Setujui</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-slate-800 font-medium">{req.users?.name || req.users?.email || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-semibold text-slate-700">{req.users?.divisions?.departments?.name || "-"}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">{req.users?.divisions?.name || "-"}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(req.created_at)}</td>
                    <td className="px-4 py-3 text-slate-600">{req.location}</td>
                    <td className="px-4 py-3">
                      <LocationLink
                        clockInLat={req.overtime_sessions?.clock_in_lat ?? null}
                        clockInLng={req.overtime_sessions?.clock_in_lng ?? null}
                        clockOutLat={req.overtime_sessions?.clock_out_lat ?? null}
                        clockOutLng={req.overtime_sessions?.clock_out_lng ?? null}
                      />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{req.project_leader}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate" title={req.purpose}>
                      {req.purpose}
                    </td>
                    <td className="px-4 py-3 text-orange-600 font-medium whitespace-nowrap">{formatDurationFromInterval(req.duration)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {req.start_photo_url && (
                          <button onClick={() => setLightboxUrl(req.start_photo_url!)} className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 hover:border-blue-300 transition-all shadow-sm" title="Foto Awal">
                            <img src={req.start_photo_url} alt="Awal" className="w-full h-full object-cover" />
                          </button>
                        )}
                        {req.proof_photo_url && (
                          <button onClick={() => setLightboxUrl(req.proof_photo_url)} className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 hover:border-orange-300 transition-all shadow-sm" title="Foto Selesai">
                            <img src={req.proof_photo_url} alt="Selesai" className="w-full h-full object-cover" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={req.approval_status === "approved"} onChange={() => handleApprovalToggle(req)} disabled={approvingId === req.id} className="w-4 h-4 rounded accent-green-600 cursor-pointer" />
                        <span className={`text-xs font-semibold ${req.approval_status === "approved" ? "text-green-600" : "text-yellow-600"}`}>
                          {approvingId === req.id ? "..." : req.approval_status === "approved" ? "Disetujui" : "Menunggu"}
                        </span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-[60] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setLightboxUrl(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
            <button className="absolute -top-12 right-0 text-white hover:text-slate-300 transition-colors flex items-center gap-2 font-medium" onClick={() => setLightboxUrl(null)}>
              Tutup
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img src={lightboxUrl} alt="Bukti Foto" className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border-4 border-white/10" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}
    </div>
  );
}
