'use client'

import { X, Download } from 'lucide-react'
import { getFileIcon, formatFileSize } from '@/lib/storage/project-file-upload'

interface FilePreviewModalProps {
  open: boolean
  files: string[]
  projectName: string
  onClose: () => void
}

export default function FilePreviewModal({
  open,
  files,
  projectName,
  onClose
}: FilePreviewModalProps) {
  if (!open) return null

  // Extract filename from URL
  function extractFileNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      const fileName = pathParts[pathParts.length - 1]
      return decodeURIComponent(fileName)
    } catch {
      return 'file'
    }
  }

  // Extract file size from URL (if available in metadata)
  // For now, we'll just show the file without size since we don't store it
  function getFileSizeFromUrl(url: string): number {
    // This would require fetching file metadata from storage
    // For now, return 0 to indicate size is unknown
    return 0
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              File Lampiran - {projectName}
            </h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* File List */}
          {files.length > 0 ? (
            <div className="space-y-2">
              {files.map((fileUrl, index) => {
                const fileName = extractFileNameFromUrl(fileUrl)
                const { icon, color } = getFileIcon(fileName)
                const fileSize = getFileSizeFromUrl(fileUrl)

                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {/* File Icon */}
                    <div className={`text-2xl ${color} flex-shrink-0`}>
                      {icon}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {fileName}
                      </p>
                      {fileSize > 0 && (
                        <p className="text-sm text-gray-500">
                          {formatFileSize(fileSize)}
                        </p>
                      )}
                    </div>

                    {/* Download Button */}
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors flex-shrink-0"
                      title="Download file"
                    >
                      <Download className="w-5 h-5" />
                    </a>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Tidak ada file lampiran</p>
            </div>
          )}

          {/* Close Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
