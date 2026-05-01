"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, ChevronDown, ChevronRight } from "lucide-react";

interface OvertimeDetail {
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  location: string;
}

interface UserOvertimeData {
  userId: string;
  userName: string;
  userEmail: string;
  totalMinutes: number;
  totalDays: number;
  details: OvertimeDetail[];
}

interface OvertimeRecapModalProps {
  open: boolean;
  onClose: () => void;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}:${mins.toString().padStart(2, "0")}`;
}

export function OvertimeRecapModal({ open, onClose }: OvertimeRecapModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<UserOvertimeData[]>([]);
  const [search, setSearch] = useState("");
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  
  // Default to current month
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open, selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        month: selectedMonth,
        search: search
      });
      
      const res = await fetch(`/api/admin/overtime/recap?${params}`);
      const result = await res.json();
      
      if (result.success) {
        setData(result.data || []);
      } else {
        setError(result.message || "Gagal memuat data");
      }
    } catch (error) {
      console.error("Error fetching overtime recap:", error);
      setError("Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchData();
  };

  const toggleExpand = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  // Generate month options (last 12 months)
  const monthOptions = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = date.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    monthOptions.push({ value, label });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogTitle className="sr-only">Rekapan Lembur Bulanan</DialogTitle>
        <DialogDescription className="sr-only">
          Monitoring total jam lembur karyawan per bulan dengan detail harian
        </DialogDescription>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Rekapan Lembur Bulanan</h2>
          <p className="text-sm text-slate-500 mt-1">Monitoring total jam lembur karyawan per bulan</p>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">Pilih Bulan</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              >
                {monthOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-600 mb-1">Cari Karyawan</label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Nama atau email..."
                  className="w-full px-3 py-2 pl-9 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              {loading ? "Memuat..." : "Cari"}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="w-8 h-8 animate-spin text-orange-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={fetchData}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm"
              >
                Coba Lagi
              </button>
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-500 font-medium">Tidak ada data lembur untuk bulan ini</p>
              <p className="text-sm text-slate-400 mt-1">Coba pilih bulan lain atau ubah filter pencarian</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-50 rounded-xl text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <div className="col-span-1"></div>
                <div className="col-span-5">Nama Karyawan</div>
                <div className="col-span-3 text-center">Total Jam Lembur</div>
                <div className="col-span-3 text-center">Jumlah Hari</div>
              </div>

              {/* Table Body */}
              {data.map((user) => (
                <div key={user.userId} className="border border-slate-200 rounded-xl overflow-hidden">
                  {/* Summary Row */}
                  <div
                    onClick={() => toggleExpand(user.userId)}
                    className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="col-span-1 flex items-center">
                      {expandedUsers.has(user.userId) ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="col-span-5">
                      <p className="font-semibold text-slate-800">{user.userName}</p>
                      <p className="text-xs text-slate-500">{user.userEmail}</p>
                    </div>
                    <div className="col-span-3 text-center">
                      <p className="text-lg font-bold text-orange-600">{formatDuration(user.totalMinutes)}</p>
                      <p className="text-xs text-slate-500">jam:menit</p>
                    </div>
                    <div className="col-span-3 text-center">
                      <p className="text-lg font-bold text-slate-700">{user.totalDays}</p>
                      <p className="text-xs text-slate-500">hari</p>
                    </div>
                  </div>

                  {/* Detail Rows */}
                  {expandedUsers.has(user.userId) && (
                    <div className="bg-slate-50 border-t border-slate-200 px-4 py-3">
                      <div className="space-y-2">
                        {user.details.map((detail, idx) => (
                          <div key={idx} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-slate-100 text-sm">
                            <div className="flex items-center gap-4">
                              <span className="text-slate-600 font-medium min-w-[100px]">{detail.date}</span>
                              <span className="text-slate-500">
                                {detail.startTime} - {detail.endTime}
                              </span>
                              <span className="text-xs bg-slate-50 text-slate-600 px-2 py-1 rounded-md">
                                {detail.location}
                              </span>
                            </div>
                            <span className="font-semibold text-orange-600">
                              {formatDuration(detail.durationMinutes)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium"
          >
            Tutup
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
