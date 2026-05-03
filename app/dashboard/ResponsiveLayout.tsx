"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { NotificationBell } from "@/components/notifications/NotificationBell";

type Session = {
  userId: string;
  email: string;
  role: string;
};

type Profile = {
  fotoProfil: string | null;
} | null;

export default function ResponsiveLayout({ session, profile, children, logoutAction }: { session: Session; profile: Profile; children: React.ReactNode; logoutAction: () => void }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Menutup sidebar otomatis saat navigasi di mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname, searchParams]);

  const isActive = (path: string) => pathname === path;

  const roleStyles: Record<string, string> = {
    CEO: "bg-indigo-50 text-indigo-700 border-indigo-100",
    GENERAL_AFFAIR: "bg-blue-50 text-blue-700 border-blue-100",
    PM: "bg-emerald-50 text-emerald-700 border-emerald-100",
    ADMIN: "bg-rose-50 text-rose-700 border-rose-100",
    STAFF: "bg-slate-50 text-slate-700 border-slate-100",
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 fixed top-0 left-0 right-0 z-50 h-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            {/* Left Section */}
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </button>

              {/* Partner Logos in Navbar - Desktop Only */}
              <div className="hidden lg:flex items-center gap-3 ml-6">
                <div className="transition-transform hover:scale-105 duration-300">
                  <Image src="/master-alwustho.png" alt="Al-Wustho Logo" width={100} height={32} className="h-8 w-auto object-contain" priority />
                </div>
                <div className="h-5 w-[1px] bg-slate-200 hidden sm:block opacity-30 mx-1" />
                <div className="transition-transform hover:scale-105 duration-300">
                  <Image src="/master-elfan.png" alt="Elfan Logo" width={80} height={28} className="h-7 w-auto object-contain" priority />
                </div>
                <div className="h-5 w-[1px] bg-slate-200 hidden sm:block opacity-30 mx-1" />
                <div className="transition-transform hover:scale-105 duration-300">
                  <Image src="/master-ufuk.png" alt="Fan Ufuk Logo" width={80} height={28} className="h-7 w-auto object-contain" priority />
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3 sm:gap-6">
              {/* Notification Bell */}
              <NotificationBell userId={session.userId} />
              
              <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-900 leading-tight">{session.email.split("@")[0]}</span>
                  <span className={`text-[10px] uppercase tracking-wider font-bold mt-0.5 px-2 py-0.5 rounded border self-end ${roleStyles[session.role] || roleStyles.KARYAWAN}`}>{session.role}</span>
                </div>

                <div className="relative group cursor-pointer">
                  {profile?.fotoProfil ? (
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white shadow-md group-hover:ring-blue-100 transition-all">
                      <Image src={profile.fotoProfil} alt="Profile" fill className="object-cover" unoptimized />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-200 group-hover:scale-105 transition-all">
                      <span className="font-bold text-lg">{session.email.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </div>
              </div>

              <form action={logoutAction} className="hidden sm:block">
                <button type="submit" className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all group" title="Logout">
                  <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16 h-screen overflow-hidden">
        {/* Sidebar Overlay (Mobile) */}
        {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity" onClick={() => setIsSidebarOpen(false)} />}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static top-16 bottom-0 left-0 z-40
            w-72 bg-white border-r border-slate-200
            transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
            ${isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}
            overflow-y-auto scrollbar-hide
          `}
        >
          <div className="p-6 space-y-8">
            {/* Sidebar Logo Section */}
            <div className="px-4 py-2 mb-6 flex flex-col items-center">
              <div className="relative h-10 w-full transition-transform hover:scale-105 duration-300">
                <Image src="/progresta.png" alt="Progresta Logo" fill sizes="200px" className="object-contain" priority />
              </div>

              {/* Mobile Only: Partner Logos in Sidebar */}
              <div className="flex flex-col items-center gap-4 mt-6 lg:hidden w-full">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-3" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Our Partners</p>

                <div className="flex items-center justify-center gap-4 w-full px-2">
                  <div className="relative h-6 w-16 transition-transform hover:scale-105 duration-300">
                    <Image src="/master-alwustho.png" alt="Al-Wustho" fill className="object-contain" />
                  </div>
                  <div className="relative h-5 w-14 transition-transform hover:scale-105 duration-300">
                    <Image src="/master-elfan.png" alt="Elfan" fill className="object-contain" />
                  </div>
                  <div className="relative h-5 w-14 transition-transform hover:scale-105 duration-300">
                    <Image src="/master-ufuk.png" alt="Fan Ufuk" fill className="object-contain" />
                  </div>
                </div>
              </div>

              <div className="h-px w-full bg-gradient-to-r from-slate-100 via-slate-200 to-transparent mt-6" />
            </div>

            {/* Nav Group: Main */}
            <div>
              <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Menu Utama</p>
              <nav className="space-y-1.5">
                <SidebarLink
                  href="/dashboard"
                  icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  label="Dashboard"
                  active={isActive("/dashboard")}
                />
                <SidebarLink href="/dashboard/reports?view=create" icon="M12 4v16m8-8H4" label="Buat Laporan" active={pathname === "/dashboard/reports" && searchParams?.get("view") === "create"} color="green" />
                <SidebarLink
                  href="/dashboard/reports?view=history"
                  icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  label="Riwayat"
                  active={pathname === "/dashboard/reports" && searchParams?.get("view") === "history"}
                  color="purple"
                />
                <SidebarLink href="/dashboard/overtime" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0" label="Lembur" active={pathname.startsWith("/dashboard/overtime")} color="orange" />
                <SidebarLink
                  href="/dashboard/payslips"
                  icon="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
                  label="Slip Gaji"
                  active={pathname.startsWith("/dashboard/payslips")}
                  color="green"
                />
                <SidebarLink href="/dashboard/profile" icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" label="Profil Saya" active={isActive("/dashboard/profile")} />
              </nav>
            </div>

            {/* Nav Group: Admin */}
            {["PM", "GENERAL_AFFAIR", "CEO", "ADMIN"].includes(session.role) && (
              <div>
                <p className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Admin Panel</p>
                <nav className="space-y-1.5">
                  <SidebarLink
                    href="/dashboard/admin/overview"
                    icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    label="Overview"
                    active={isActive("/dashboard/admin/overview")}
                    color="indigo"
                  />
                  {["GENERAL_AFFAIR", "CEO", "ADMIN"].includes(session.role) && (
                    <SidebarLink
                      href="/dashboard/admin/users/manage"
                      icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                      label="Database Karyawan"
                      active={isActive("/dashboard/admin/users/manage")}
                      color="orange"
                    />
                  )}
                  <SidebarLink
                    href="/dashboard/admin/projects"
                    icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    label="Kelola Project"
                    active={pathname.startsWith("/dashboard/admin/projects")}
                    color="purple"
                  />
                  {["GENERAL_AFFAIR", "CEO", "ADMIN"].includes(session.role) && (
                    <SidebarLink
                      href="/dashboard/admin/divisions"
                      icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      label="Manajemen Divisi"
                      active={isActive("/dashboard/admin/divisions")}
                      color="orange"
                    />
                  )}
                  <SidebarLink
                    href="/dashboard/admin/project-reports"
                    icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    label="Laporan Project"
                    active={pathname.startsWith("/dashboard/admin/project-reports")}
                    color="teal"
                  />
                  {["GENERAL_AFFAIR", "CEO", "ADMIN"].includes(session.role) && (
                    <SidebarLink href="/dashboard/overtime/admin" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0" label="Kelola Lembur" active={pathname === "/dashboard/overtime/admin"} color="orange" />
                  )}
                  {["GENERAL_AFFAIR", "CEO", "ADMIN"].includes(session.role) && (
                    <SidebarLink
                      href="/dashboard/admin/payslips"
                      icon="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      label="Kelola Slip Gaji & Cuti"
                      active={pathname.startsWith("/dashboard/admin/payslips")}
                      color="teal"
                    />
                  )}
                </nav>
              </div>
            )}

            {/* Logout Button - Paling Bawah Sidebar */}
            <div className="mt-auto pt-6 border-t border-slate-200">
              <form action={logoutAction} className="w-full">
                <button
                  type="submit"
                  className="flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium transition-all duration-200 group w-full text-slate-600 hover:bg-rose-50 hover:text-rose-600"
                >
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-[14px] tracking-tight">Keluar</span>
                </button>
              </form>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] custom-scrollbar relative">
          <div className="p-4 sm:p-8 max-w-[1400px] mx-auto pb-24 lg:pb-8">{children}</div>
        </main>
      </div>

      {/* Floating Action Button - hanya untuk STAFF dan PM */}
      {["STAFF", "PM"].includes(session.role) && (
        <Link
          href="/dashboard/reports?view=create"
          className="fixed bottom-24 right-6 lg:bottom-10 lg:right-10 z-30 w-14 h-14 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group"
        >
          <svg className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      )}

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 z-50 px-2 pb-safe">
        <div className="flex justify-around items-center h-16">
          <MobileNavItem
            href="/dashboard"
            icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            label="Home"
            active={isActive("/dashboard")}
          />
          <MobileNavItem
            href="/dashboard/reports?view=history"
            icon="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            label="Laporan"
            active={pathname.includes("reports")}
          />
          <MobileNavItem href="/dashboard/overtime" icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0" label="Lembur" active={pathname.startsWith("/dashboard/overtime")} />
          {["PM", "GENERAL_AFFAIR", "CEO", "ADMIN"].includes(session.role) && (
            <MobileNavItem href="/dashboard/admin/overview" icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" label="Admin" active={pathname.includes("admin")} />
          )}
          <MobileNavItem href="/dashboard/profile" icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" label="Profil" active={isActive("/dashboard/profile")} />
        </div>
      </nav>
    </div>
  );
}

// Reusable Components for Cleaner Code
function SidebarLink({ href, icon, label, active, color = "blue" }: any) {
  const colorClasses: Record<string, string> = {
    blue: active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-blue-50/50 hover:text-blue-700",
    green: active ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-emerald-50/50 hover:text-emerald-700",
    purple: active ? "bg-purple-50 text-purple-700" : "text-slate-600 hover:bg-purple-50/50 hover:text-purple-700",
    indigo: active ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-indigo-50/50 hover:text-indigo-700",
    orange: active ? "bg-orange-50 text-orange-700" : "text-slate-600 hover:bg-orange-50/50 hover:text-orange-700",
    rose: active ? "bg-rose-50 text-rose-700" : "text-slate-600 hover:bg-rose-50/50 hover:text-rose-700",
    teal: active ? "bg-teal-50 text-teal-700" : "text-slate-600 hover:bg-teal-50/50 hover:text-teal-700",
  };

  return (
    <Link href={href} className={`flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium transition-all duration-200 group ${colorClasses[color]}`}>
      <svg className={`w-5 h-5 transition-transform group-hover:scale-110`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={icon} />
      </svg>
      <span className="text-[14px] tracking-tight">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-current shadow-[0_0_8px_currentColor]" />}
    </Link>
  );
}

function MobileNavItem({ href, icon, label, active }: any) {
  return (
    <Link href={href} className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-all ${active ? "text-blue-600" : "text-slate-400"}`}>
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.5} d={icon} />
      </svg>
      <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? "opacity-100" : "opacity-60"}`}>{label}</span>
    </Link>
  );
}
