'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface Project {
  id: string
  name: string
}

interface ReportHistoryMenuProps {
  pathname: string
  onLinkClick: () => void
}

export function ReportHistoryMenu({ pathname, onLinkClick }: ReportHistoryMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)

  const isActive = pathname === '/reports' || pathname.startsWith('/reports')

  useEffect(() => {
    if (isOpen && projects.length === 0) {
      loadProjects()
    }
  }, [isOpen])

  const loadProjects = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/reports/projects')
      const data = await res.json()
      
      if (data.success) {
        setProjects(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-1">
      {/* Main Menu Item */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-purple-50 text-purple-700'
            : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
        }`}
      >
        <div className="flex items-center gap-3">
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
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>

      {/* Dropdown Items */}
      {isOpen && (
        <div className="ml-4 space-y-1">
          {/* Semua Project */}
          <Link
            href="/reports?view=history"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors text-gray-600 hover:bg-purple-50 hover:text-purple-700"
            onClick={onLinkClick}
          >
            <span>Semua Project</span>
          </Link>

          {/* Per Project */}
          {loading ? (
            <div className="px-4 py-2 text-sm text-gray-400">
              Memuat project...
            </div>
          ) : projects.length > 0 ? (
            <>
              <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">
                Per Project
              </div>
              {projects.map(project => (
                <Link
                  key={project.id}
                  href={`/reports?view=history&project_id=${project.id}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors text-gray-600 hover:bg-purple-50 hover:text-purple-700"
                  onClick={onLinkClick}
                >
                  <span className="truncate">{project.name}</span>
                </Link>
              ))}
            </>
          ) : (
            <div className="px-4 py-2 text-sm text-gray-400">
              Tidak ada project
            </div>
          )}
        </div>
      )}
    </div>
  )
}
