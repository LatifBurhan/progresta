'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

type Session = {
  userId: string
  email: string
  role: string
}

type Profile = {
  fotoProfil: string | null
} | null

export default function ResponsiveLayout({
  session,
  profile,
  children,
  logoutAction,
}: {
  session: Session
  profile: Profile
  children: React.ReactNode
  logoutAction: () => void
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const isActive = (path: string) => pathname === path

  return (
    <>
      {/* Mobile Header */}
      <nav className="bg-white border-b shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left: Menu Button + Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <div className="relative h-8 w-32 sm:h-10 sm:w-40">
                <Image
                  src="/progresta.png"
                  alt="Progresta Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            {/* Right: Profile + Logout */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Profile Avatar */}
              <div className="flex items-center gap-2 sm:gap-3">
                {profile?.fotoProfil ? (
                  <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-gray-300 shadow-sm">
                    <Image
                      src={profile.fotoProfil}
                      alt="Profile"
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 32px, 40px"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border-2 border-gray-300 shadow-sm">
                    <span className="text-sm sm:text-lg font-bold text-white">
                      {session.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="hidden sm:flex flex-col">
                  <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                    {session.email}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      session.role === 'CEO' ? 'bg-purple-100 text-purple-700' :
                      session.role === 'HRD' ? 'bg-blue-100 text-blue-700' :
                      session.role === 'PM' ? 'bg-green-100 text-green-700' :
                      session.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {session.role === 'CEO' && '👑'} 
                      {session.role === 'HRD' && '👥'} 
                      {session.role === 'PM' && '📊'} 
                      {session.role === 'ADMIN' && '⚙️'} 
                      {session.role === 'KARYAWAN' && '👨‍💻'} 
                      {' '}{session.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="hidden sm:block h-8 w-px bg-gray-300"></div>

              <form action={logoutAction}>
                <button
                  type="submit"
                  className="text-xs sm:text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2 sm:px-3 py-2 rounded-md transition-colors"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-16">
        {/* Sidebar Overlay (Mobile) */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static top-16 bottom-0 left-0 z-40
            w-64 bg-white border-r shadow-sm
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            overflow-y-auto
          `}
        >
          {/* Logo di Sidebar - Hidden on mobile, visible on desktop */}
          <div className="hidden lg:block p-4 border-b">
            <div className="relative h-12 w-full">
              <Image
                src="/progresta.png"
                alt="Progresta Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          
          <nav className="p-4 space-y-2">
            {/* Main Menu - Available for All Users */}
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/dashboard')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
              }`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>Dashboard</span>
            </Link>

            <Link
              href="/dashboard/reports?view=create"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === '/dashboard/reports' && searchParams?.get('view') === 'create'
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-700 hover:bg-green-50 hover:text-green-700'
              }`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Buat Laporan</span>
            </Link>

            <Link
              href="/dashboard/reports?view=history"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === '/dashboard/reports' && searchParams?.get('view') === 'history'
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
              }`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span>Riwayat</span>
            </Link>

            <Link
              href="/dashboard/profile"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/dashboard/profile')
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
              }`}
              onClick={() => setIsSidebarOpen(false)}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>Profile</span>
            </Link>

            {/* Admin Navigation - PM, HRD, CEO, ADMIN can access */}
            {['PM', 'HRD', 'CEO', 'ADMIN'].includes(session.role) && (
              <>
                <div className="px-4 py-2 mt-6 border-t pt-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Admin Panel
                  </h3>
                </div>
                
                <Link
                  href="/dashboard/admin/overview"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    pathname === '/dashboard/admin/overview'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <span>Dashboard Overview</span>
                </Link>

                <Link
                  href="/dashboard/admin/per-user"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    pathname === '/dashboard/admin/per-user'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Dashboard Per User</span>
                </Link>
                
                <Link
                  href="/dashboard/admin/users/manage"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    pathname === '/dashboard/admin/users/manage'
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-gray-700 hover:bg-orange-50 hover:text-orange-700'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                  <span>Manajemen User</span>
                </Link>

                <Link
                  href="/dashboard/admin/projects"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    pathname.startsWith('/dashboard/admin/projects')
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <span>Kelola Project</span>
                </Link>

                <Link
                  href="/dashboard/admin/divisions"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    pathname === '/dashboard/admin/divisions'
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-gray-700 hover:bg-orange-50 hover:text-orange-700'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span>Manajemen Divisi</span>
                </Link>

                <Link
                  href="/admin/reports"
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    pathname.startsWith('/admin/reports')
                      ? 'bg-orange-50 text-orange-700'
                      : 'text-gray-700 hover:bg-orange-50 hover:text-orange-700'
                  }`}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Export Laporan</span>
                </Link>
              </>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto pb-16 lg:pb-0 min-h-screen">{children}</main>
      </div>

      {/* Floating Action Button - Tambah Laporan (All Pages) */}
      <Link
        href="/dashboard/reports?view=create"
        className="fixed bottom-20 right-6 lg:bottom-8 lg:right-8 z-30 w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
        title="Buat Laporan Baru"
      >
        <svg
          className="w-6 h-6 group-hover:scale-110 transition-transform"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </Link>

      {/* Bottom Navigation (Mobile Only) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-30">
        <div className="flex justify-around items-center py-2">
          <Link
            href="/dashboard"
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              isActive('/dashboard')
                ? 'text-blue-600'
                : 'text-gray-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </Link>

          <Link
            href="/dashboard/reports?view=history"
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              pathname.startsWith('/dashboard/reports')
                ? 'text-green-600'
                : 'text-gray-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs font-medium">Laporan</span>
          </Link>

          {['PM', 'HRD', 'CEO', 'ADMIN'].includes(session.role) && (
            <Link
              href="/admin/users"
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                pathname.startsWith('/admin')
                  ? 'text-orange-600'
                  : 'text-gray-600'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-xs font-medium">Admin</span>
            </Link>
          )}

          <Link
            href="/dashboard/profile"
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
              isActive('/dashboard/profile')
                ? 'text-blue-600'
                : 'text-gray-600'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </>
  )
}
