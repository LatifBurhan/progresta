'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, X, AlertCircle, Loader2 } from 'lucide-react'
import { uploadProjectFile, deleteProjectFile, getFileIcon, formatFileSize } from '@/lib/storage/project-file-upload'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  status: 'uploading' | 'success' | 'error'
  progress?: number
}

interface FileUploadComponentProps {
  projectId: string
  existingFiles?: string[]
  onChange: (files: string[]) => void
  onError: (error: string) => void
  disabled?: boolean
  maxFiles?: number
}

export default function FileUploadComponent({
  projectId,
  existingFiles = [],
  onChange,
  onError,
  disabled = false,
  maxFiles = 10
}: FileUploadComponentProps) {
  const [files, setFiles] = useState<UploadedFile[]>(() => {
    // Initialize with existing files
    return existingFiles.map((url, index) => {
      const fileName = extractFileNameFromUrl(url)
      return {
        id: `existing-${index}`,
        name: fileName,
        size: 0,
        type: '',
        url,
        status: 'success' as const
      }
    })
  })
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState<Map<string, string>>(new Map())
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync existingFiles ketika prop berubah (misal saat modal edit dibuka)
  // Gunakan ref untuk track nilai sebelumnya agar tidak trigger saat upload baru
  const prevExistingKey = useRef('')
  const isInitialSync = useRef(false)
  useEffect(() => {
    const key = existingFiles.join(',')
    if (key && key !== prevExistingKey.current) {
      prevExistingKey.current = key
      isInitialSync.current = true
      setFiles(existingFiles.map((url, index) => ({
        id: `existing-${index}`,
        name: extractFileNameFromUrl(url),
        size: 0,
        type: getTypeFromUrl(url),
        url,
        status: 'success' as const
      })))
    }
  }, [existingFiles.join(',')])

  // Notify parent hanya saat semua upload selesai (tidak ada yang masih uploading)
  useEffect(() => {
    if (isInitialSync.current) {
      isInitialSync.current = false
      return
    }
    // Jangan notify kalau masih ada yang uploading
    const hasUploading = files.some(f => f.status === 'uploading')
    if (hasUploading) return

    const successUrls = files
      .filter(f => f.status === 'success' && f.url && !f.url.startsWith('blob:'))
      .map(f => f.url)

    const existingKey = existingFiles.join(',')
    const currentKey = successUrls.join(',')
    if (currentKey !== existingKey) {
      onChange(successUrls)
    }
  }, [files])

  // Extract filename from URL
  function extractFileNameFromUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      const fileName = pathParts[pathParts.length - 1]
      // Remove timestamp prefix if present (e.g., "1234567890-abc123.pdf" -> original name)
      return decodeURIComponent(fileName)
    } catch {
      return 'file'
    }
  }

  // Extract storage path from URL
  function extractPathFromUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      // Find the index after 'project-attachments'
      const bucketIndex = pathParts.findIndex(part => part === 'project-attachments')
      if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
        return pathParts.slice(bucketIndex + 1).join('/')
      }
      return pathParts.slice(-2).join('/') // fallback: projectId/filename
    } catch {
      return ''
    }
  }

  // Generate unique ID
  function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(7)}`
  }

  // Get file type from URL
  function getTypeFromUrl(url: string): string {
    const ext = url.split('.').pop()?.toLowerCase() || ''
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
    if (imageExts.includes(ext)) return `image/${ext}`
    return ''
  }

  // Check if file is image
  function isImageFile(file: UploadedFile): boolean {
    return file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name)
  }

  // Validate file
  function validateFile(file: File): boolean {
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    
    if (file.size > MAX_FILE_SIZE) {
      const errorMsg = `File ${file.name} melebihi batas 10MB`
      onError(errorMsg)
      return false
    }

    const ALLOWED_FILE_TYPES = [
      'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain', 'text/csv',
      'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'
    ]

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      const errorMsg = `Tipe file ${file.type} tidak didukung`
      onError(errorMsg)
      return false
    }

    return true
  }

  // Process and upload files
  async function processFiles(filesToUpload: File[]) {
    // Filter valid files dulu sebelum add ke state
    const validFiles: File[] = []
    for (const file of filesToUpload) {
      if (validFiles.length + files.length >= maxFiles) {
        onError(`Maksimal ${maxFiles} file`)
        break
      }
      if (validateFile(file)) validFiles.push(file)
    }

    if (validFiles.length === 0) return

    // Buat entry untuk semua file sekaligus (optimistic UI)
    const newEntries: UploadedFile[] = validFiles.map(file => ({
      id: generateId(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file),
      status: 'uploading' as const
    }))

    setFiles(prev => [...prev, ...newEntries])

    // Upload semua file secara paralel
    await Promise.all(newEntries.map(async (entry, i) => {
      const file = validFiles[i]
      try {
        const result = await uploadProjectFile(file, projectId)
        setFiles(prev => prev.map(f =>
          f.id === entry.id
            ? { ...f, status: 'success' as const, url: result.publicUrl }
            : f
        ))
      } catch (error: any) {
        setFiles(prev => prev.map(f =>
          f.id === entry.id ? { ...f, status: 'error' as const } : f
        ))
        setErrors(prev => {
          const next = new Map(prev)
          next.set(entry.id, error.message || 'Gagal upload file')
          return next
        })
        onError(error.message || 'Gagal upload file')
      }
    }))
  }

  // Handle file selection from input
  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(e.target.files || [])
    await processFiles(selectedFiles)
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle drag events
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setDragActive(true)
    }
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    const droppedFiles = Array.from(e.dataTransfer.files)
    await processFiles(droppedFiles)
  }

  // Handle file deletion
  async function handleDelete(fileId: string) {
    const file = files.find(f => f.id === fileId)
    if (!file) return

    // Optimistic UI - remove immediately
    const previousFiles = [...files]
    setFiles(prev => prev.filter(f => f.id !== fileId))

    try {
      // Only delete from storage if it has a URL (uploaded file)
      if (file.url) {
        const path = extractPathFromUrl(file.url)
        if (path) {
          await deleteProjectFile(path)
        }
      }

      // Notify parent with updated URLs — dilakukan via useEffect
      // Clear error for this file
      setErrors(prev => {
        const newErrors = new Map(prev)
        newErrors.delete(fileId)
        return newErrors
      })

    } catch (error: any) {
      // Restore file on failure
      setFiles(previousFiles)
      const errorMsg = `Gagal menghapus ${file.name}: ${error.message}`
      setErrors(prev => {
        const newErrors = new Map(prev)
        newErrors.set(fileId, errorMsg)
        return newErrors
      })
      onError(errorMsg)
    }
  }

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp,.zip,.rar,.7z,.txt,.csv"
          className="hidden"
          disabled={disabled}
        />
        
        <div className="flex flex-col items-center gap-2">
          <Upload className={`w-8 h-8 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
          <div>
            <p className="text-sm font-medium text-gray-700">
              {dragActive ? 'Lepaskan file di sini' : 'Drag & drop file atau klik untuk browse'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Maksimal 10MB per file • PDF, Word, Excel, PowerPoint, Gambar, Archive
            </p>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {files.map(file => {
            const { icon, color } = getFileIcon(file.name)
            const error = errors.get(file.id)
            const isImage = isImageFile(file)

            return (
              <div
                key={file.id}
                className={`relative rounded-xl border overflow-hidden group
                  ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}
                `}
              >
                {/* Preview area */}
                {isImage && file.url ? (
                  <div className="w-full h-36 bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-36 bg-slate-50 flex flex-col items-center justify-center gap-2">
                    <span className={`text-4xl ${color}`}>{icon}</span>
                  </div>
                )}

                {/* File name + status bar */}
                <div className="px-3 py-2 flex items-center gap-2">
                  <p className="text-xs font-medium text-gray-700 truncate flex-1">{file.name}</p>
                  {file.status === 'uploading' && (
                    <Loader2 className="w-4 h-4 text-blue-500 animate-spin shrink-0" />
                  )}
                  {file.status === 'error' && (
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                </div>

                {/* Delete button */}
                {file.status === 'success' && (
                  <button
                    type="button"
                    onClick={() => handleDelete(file.id)}
                    disabled={disabled}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/50 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Uploading overlay */}
                {file.status === 'uploading' && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                  </div>
                )}

                {error && (
                  <p className="px-3 pb-2 text-xs text-red-600">{error}</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Error Summary */}
      {errors.size > 0 && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">
                Terdapat {errors.size} error saat upload
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
