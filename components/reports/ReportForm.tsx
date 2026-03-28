'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { PhotoUploader } from './PhotoUploader'
import { validateReportForm } from '@/lib/validations/report-validation'
import { useToast } from '@/components/ui/use-toast'
import type { ReportFormData, Project, LokasiKerja } from '@/types/report'
import { Loader2 } from 'lucide-react'

interface ReportFormProps {
  mode: 'create' | 'edit'
  reportId?: string
  initialData?: Partial<ReportFormData>
  onSuccess?: () => void
  onCancel?: () => void
}

export function ReportForm({
  mode,
  reportId,
  initialData,
  onSuccess,
  onCancel
}: ReportFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState<ReportFormData>({
    project_id: initialData?.project_id || '',
    lokasi_kerja: initialData?.lokasi_kerja || 'WFA',
    pekerjaan_dikerjakan: initialData?.pekerjaan_dikerjakan || '',
    kendala: initialData?.kendala || '',
    rencana_kedepan: initialData?.rencana_kedepan || '',
    foto_urls: initialData?.foto_urls || []
  })
  
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    loadProjects()
    loadUserSession()
  }, [])

  const loadUserSession = async () => {
    try {
      const res = await fetch('/api/auth/check')
      const data = await res.json()
      if (data.authenticated && data.user) {
        setUserId(data.user.userId)
      }
    } catch (error) {
      console.error('Failed to load user session:', error)
    }
  }

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/reports/projects')
      const data = await res.json()
      
      if (data.success) {
        setProjects(data.data || [])
      } else {
        toast({
          title: 'Error',
          description: 'Gagal memuat daftar project',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat daftar project',
        variant: 'destructive'
      })
    } finally {
      setLoadingProjects(false)
    }
  }

  const updateField = (field: keyof ReportFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files)
    // Clear foto_urls error
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors.foto_urls
      return newErrors
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // For edit mode, if no new files selected, use existing foto_urls
    const dataToValidate = {
      ...formData,
      foto_urls: selectedFiles.length > 0 ? ['placeholder'] : formData.foto_urls
    }
    
    // Validate form
    const validationErrors = validateReportForm(dataToValidate)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)

    try {
      let photoUrls = formData.foto_urls

      // Upload photos if new files selected
      if (selectedFiles.length > 0) {
        if (!userId) {
          throw new Error('User session not found')
        }

        // Generate temporary report ID for create mode
        const tempReportId = reportId || crypto.randomUUID()
        
        // Create FormData for photo upload
        const uploadFormData = new FormData()
        uploadFormData.append('userId', userId)
        uploadFormData.append('reportId', tempReportId)
        selectedFiles.forEach(file => {
          uploadFormData.append('files', file)
        })

        // Upload photos via API
        const uploadResponse = await fetch('/api/reports/upload-photos', {
          method: 'POST',
          body: uploadFormData
        })

        const uploadResult = await uploadResponse.json()

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload photos')
        }

        photoUrls = uploadResult.data
      }

      // Submit report
      const endpoint = mode === 'create' 
        ? '/api/reports/create'
        : `/api/reports/update/${reportId}`
      
      const method = mode === 'create' ? 'POST' : 'PUT'
      
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          foto_urls: photoUrls
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Berhasil',
          description: mode === 'create' 
            ? 'Laporan berhasil dibuat'
            : 'Laporan berhasil diupdate'
        })
        
        if (onSuccess) {
          onSuccess()
        } else {
          router.push('/reports')
        }
      } else {
        throw new Error(result.error || 'Gagal menyimpan laporan')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Gagal menyimpan laporan',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.push('/reports')
    }
  }

  if (loadingProjects) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Project Selection */}
      <div className="space-y-2">
        <Label htmlFor="project_id">
          Project <span className="text-destructive">*</span>
        </Label>
        <select
          id="project_id"
          value={formData.project_id}
          onChange={(e) => updateField('project_id', e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading}
        >
          <option value="">Pilih Project</option>
          {projects.map(project => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        {errors.project_id && (
          <p className="text-sm text-destructive">{errors.project_id}</p>
        )}
      </div>

      {/* Lokasi Kerja */}
      <div className="space-y-2">
        <Label htmlFor="lokasi_kerja">
          Lokasi Kerja <span className="text-destructive">*</span>
        </Label>
        <select
          id="lokasi_kerja"
          value={formData.lokasi_kerja}
          onChange={(e) => updateField('lokasi_kerja', e.target.value as LokasiKerja)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading}
        >
          <option value="WFA">WFA</option>
          <option value="Al-Wustho">Al-Wustho</option>
          <option value="Client Site">Client Site</option>
        </select>
        {errors.lokasi_kerja && (
          <p className="text-sm text-destructive">{errors.lokasi_kerja}</p>
        )}
      </div>

      {/* Pekerjaan Dikerjakan */}
      <div className="space-y-2">
        <Label htmlFor="pekerjaan_dikerjakan">
          Pekerjaan yang Dikerjakan <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="pekerjaan_dikerjakan"
          value={formData.pekerjaan_dikerjakan}
          onChange={(e) => updateField('pekerjaan_dikerjakan', e.target.value)}
          placeholder="Deskripsikan pekerjaan yang telah dikerjakan..."
          rows={4}
          disabled={loading}
        />
        {errors.pekerjaan_dikerjakan && (
          <p className="text-sm text-destructive">{errors.pekerjaan_dikerjakan}</p>
        )}
      </div>

      {/* Kendala */}
      <div className="space-y-2">
        <Label htmlFor="kendala">Kendala (Opsional)</Label>
        <Textarea
          id="kendala"
          value={formData.kendala}
          onChange={(e) => updateField('kendala', e.target.value)}
          placeholder="Kendala yang dihadapi (jika ada)..."
          rows={3}
          disabled={loading}
        />
      </div>

      {/* Rencana Kedepan */}
      <div className="space-y-2">
        <Label htmlFor="rencana_kedepan">Rencana Kedepan (Opsional)</Label>
        <Textarea
          id="rencana_kedepan"
          value={formData.rencana_kedepan}
          onChange={(e) => updateField('rencana_kedepan', e.target.value)}
          placeholder="Rencana pekerjaan kedepan..."
          rows={3}
          disabled={loading}
        />
      </div>

      {/* Photo Upload */}
      <div className="space-y-2">
        <Label>
          Foto Bukti <span className="text-destructive">*</span>
        </Label>
        <PhotoUploader
          onFilesSelected={handleFilesSelected}
          initialPhotos={mode === 'edit' ? formData.foto_urls : []}
          error={errors.foto_urls}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : (
            'Simpan'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={loading}
          className="flex-1"
        >
          Batal
        </Button>
      </div>
    </form>
  )
}
