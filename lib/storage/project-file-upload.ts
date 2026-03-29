/**
 * Project File Upload Utilities
 * Handles file uploads for project attachments to Supabase Storage
 * Uses API endpoints to bypass RLS with service role
 */

const BUCKET_NAME = 'project-attachments'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_FILE_TYPES = [
  // Images
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  // Archives
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed'
]

export interface UploadResult {
  path: string
  publicUrl: string
  fileName: string
  fileSize: number
  fileType: string
}

/**
 * Upload a single file to project attachments bucket
 * Uses API endpoint to bypass RLS with service role
 */
export async function uploadProjectFile(
  file: File,
  projectId: string
): Promise<UploadResult> {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File terlalu besar. Maksimal ${MAX_FILE_SIZE / 1024 / 1024}MB`)
  }

  // Validate file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error(`Tipe file tidak didukung: ${file.type}`)
  }

  // Create form data
  const formData = new FormData()
  formData.append('file', file)
  formData.append('projectId', projectId)

  // Upload via API endpoint
  const response = await fetch('/api/admin/projects/upload-file', {
    method: 'POST',
    body: formData
  })

  const result = await response.json()

  if (!result.success) {
    throw new Error(result.message || 'Gagal upload file')
  }

  return result.data
}

/**
 * Upload multiple files
 */
export async function uploadProjectFiles(
  files: File[],
  projectId: string
): Promise<UploadResult[]> {
  const uploadPromises = files.map(file => uploadProjectFile(file, projectId))
  return Promise.all(uploadPromises)
}

/**
 * Delete a file from storage
 * Uses API endpoint to bypass RLS with service role
 */
export async function deleteProjectFile(filePath: string): Promise<void> {
  const response = await fetch('/api/admin/projects/delete-file', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ filePath })
  })

  const result = await response.json()

  if (!result.success) {
    throw new Error(result.message || 'Gagal menghapus file')
  }
}

/**
 * Delete multiple files
 */
export async function deleteProjectFiles(filePaths: string[]): Promise<void> {
  // Delete files one by one
  const deletePromises = filePaths.map(path => deleteProjectFile(path))
  await Promise.all(deletePromises)
}

/**
 * Get file extension icon/color
 */
export function getFileIcon(fileName: string): { icon: string; color: string } {
  const ext = fileName.split('.').pop()?.toLowerCase()
  
  switch (ext) {
    case 'pdf':
      return { icon: '📄', color: 'text-red-600' }
    case 'doc':
    case 'docx':
      return { icon: '📝', color: 'text-blue-600' }
    case 'xls':
    case 'xlsx':
      return { icon: '📊', color: 'text-green-600' }
    case 'ppt':
    case 'pptx':
      return { icon: '📊', color: 'text-orange-600' }
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
      return { icon: '🖼️', color: 'text-purple-600' }
    case 'zip':
    case 'rar':
    case '7z':
      return { icon: '📦', color: 'text-gray-600' }
    default:
      return { icon: '📎', color: 'text-gray-600' }
  }
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
