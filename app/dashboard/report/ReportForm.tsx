'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Camera, Copy, Save, AlertCircle } from 'lucide-react'
import { compressImage } from '@/lib/image-utils'
import { submitReport } from '@/app/actions/report-actions'
import { generateWhatsAppText } from '@/lib/whatsapp-utils'

const PERIODS = [
  { value: '08:00-10:00', label: '08-10' },
  { value: '10:00-12:00', label: '10-12' },
  { value: '13:00-15:00', label: '13-15' },
  { value: '15:00-17:00', label: '15-17' },
  { value: '17:00-19:00', label: '17-19' },
]

const LOCATIONS = [
  { value: 'Al-Wustho', label: '🏢 Al-Wustho' },
  { value: 'WFA', label: '🏠 WFA' },
  { value: 'Client Site', label: '🏛️ Client Site' },
]

interface ProjectDetail {
  id: string
  projectId: string
  task: string
  progress: string
  issue: string
  evidence: File | null
  hoursSpent: number
}

interface ReportFormProps {
  userId: string
  lastReport: any
  availableProjects: Array<{ id: string; name: string }>
  initialHistory: any[]
}
export default function ReportForm({ userId, lastReport, availableProjects, initialHistory }: ReportFormProps) {
  const [period, setPeriod] = useState('')
  const [location, setLocation] = useState(lastReport?.location || 'Al-Wustho')
  const [futurePlan, setFuturePlan] = useState('')
  const [projectDetails, setProjectDetails] = useState<ProjectDetail[]>([
    {
      id: '1',
      projectId: '',
      task: '',
      progress: '',
      issue: '',
      evidence: null,
      hoursSpent: 2
    }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [whatsappText, setWhatsappText] = useState('')
  const [historyReports, setHistoryReports] = useState<any[]>(initialHistory || [])
  const [historyProjectFilter, setHistoryProjectFilter] = useState<string>('all')

  // Auto-save to localStorage
  useEffect(() => {
    const savedData = localStorage.getItem(`report-draft-${userId}`)
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setPeriod(parsed.period || '')
        setLocation(parsed.location || lastReport?.location || 'Al-Wustho')
        setFuturePlan(parsed.futurePlan || '')
        setProjectDetails(parsed.projectDetails || projectDetails)
      } catch (error) {
        console.error('Failed to load saved data:', error)
      }
    }
  }, [userId, lastReport])

  // Save to localStorage on changes
  useEffect(() => {
    const dataToSave = {
      period,
      location,
      futurePlan,
      projectDetails: projectDetails.map(p => ({
        ...p,
        evidence: null // Don't save file objects
      }))
    }
    localStorage.setItem(`report-draft-${userId}`, JSON.stringify(dataToSave))
  }, [period, location, futurePlan, projectDetails, userId])

  const addProjectDetail = () => {
    const newDetail: ProjectDetail = {
      id: Date.now().toString(),
      projectId: '',
      task: '',
      progress: '',
      issue: '',
      evidence: null,
      hoursSpent: 1
    }
    setProjectDetails([...projectDetails, newDetail])
  }

  const removeProjectDetail = (id: string) => {
    if (projectDetails.length > 1) {
      setProjectDetails(projectDetails.filter(p => p.id !== id))
    }
  }

  const updateProjectDetail = (id: string, field: keyof ProjectDetail, value: any) => {
    setProjectDetails(projectDetails.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ))
  }
  const handleImageUpload = async (id: string, file: File) => {
    try {
      const compressedFile = await compressImage(file, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8
      })
      updateProjectDetail(id, 'evidence', compressedFile)
    } catch (error) {
      console.error('Image compression failed:', error)
      updateProjectDetail(id, 'evidence', file)
    }
  }

  const handleSubmit = async () => {
    if (!period) {
      alert('Pilih periode waktu terlebih dahulu')
      return
    }

    const hasValidProject = projectDetails.some(p => 
      p.projectId && p.task.trim() && p.progress.trim()
    )

    if (!hasValidProject) {
      alert('Minimal satu project harus diisi lengkap')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await submitReport({
        userId,
        period,
        location,
        futurePlan,
        projectDetails: projectDetails.filter(p => 
          p.projectId && p.task.trim() && p.progress.trim()
        )
      })

      if (result.success) {
        setSubmitSuccess(true)
        const waText = generateWhatsAppText({
          period,
          location,
          projects: availableProjects,
          projectDetails: projectDetails.filter(p => 
            p.projectId && p.task.trim() && p.progress.trim()
          )
        })
        setWhatsappText(waText)
        
        // Clear localStorage
        localStorage.removeItem(`report-draft-${userId}`)
        
        // Reset form
        setPeriod('')
        setFuturePlan('')
        setProjectDetails([{
          id: '1',
          projectId: '',
          task: '',
          progress: '',
          issue: '',
          evidence: null,
          hoursSpent: 2
        }])

        if (result.report) {
          setHistoryReports(prev => [result.report, ...prev])
        }
      } else {
        alert(result.message || 'Gagal menyimpan laporan')
      }
    } catch (error) {
      console.error('Submit error:', error)
      alert('Terjadi kesalahan saat menyimpan')
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToWhatsApp = () => {
    navigator.clipboard.writeText(whatsappText)
    alert('Teks berhasil disalin ke clipboard!')
  }
  if (submitSuccess) {
    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Laporan Berhasil Dikirim!
            </h3>
            <p className="text-green-700 text-sm">
              Progres kerja Anda telah tersimpan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Copy className="w-4 h-4" />
              Salin ke WhatsApp
            </h4>
            <div className="bg-gray-50 p-3 rounded-lg text-sm font-mono mb-4 max-h-40 overflow-y-auto">
              {whatsappText}
            </div>
            <Button 
              onClick={copyToWhatsApp}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Copy className="w-4 h-4 mr-2" />
              Salin Teks WhatsApp
            </Button>
          </CardContent>
        </Card>

        <Button 
          onClick={() => setSubmitSuccess(false)}
          variant="outline"
          className="w-full"
        >
          Buat Laporan Baru
        </Button>
      </div>
    )
  }

  const filteredHistory = historyReports.filter((report) => {
    if (historyProjectFilter === 'all') return true
    return (report.reportDetails || []).some((detail: any) => detail.projectId === historyProjectFilter)
  })

  return (
    <div className="space-y-6">
      {/* Period Selection */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            🕒 Periode Waktu
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`p-3 rounded-lg border-2 transition-all ${
                  period === p.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium">{p.label}</div>
                <div className="text-xs text-gray-500">{p.value}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Location Selection */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3 flex items-center gap-2">
            📍 Lokasi Kerja
          </h3>
          <div className="flex gap-2 flex-wrap">
            {LOCATIONS.map((loc) => (
              <Badge
                key={loc.value}
                variant={location === loc.value ? "default" : "outline"}
                className={`cursor-pointer px-4 py-2 text-sm ${
                  location === loc.value 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => setLocation(loc.value)}
              >
                {loc.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Project Details */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium flex items-center gap-2">
              👨‍💻 Detail Project
            </h3>
            <Button
              onClick={addProjectDetail}
              size="sm"
              variant="outline"
              className="text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              Tambah
            </Button>
          </div>

          <div className="space-y-4">
            {projectDetails.map((detail, index) => (
              <div key={detail.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600">
                    Project {index + 1}
                  </span>
                  {projectDetails.length > 1 && (
                    <button
                      onClick={() => removeProjectDetail(detail.id)}
                      className="text-red-500 text-xs hover:text-red-700"
                    >
                      Hapus
                    </button>
                  )}
                </div>

                {/* Project Selection */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pilih Project Aktif
                  </label>
                  <select
                    value={detail.projectId}
                    onChange={(e) => updateProjectDetail(detail.id, 'projectId', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Pilih Project --</option>
                    {availableProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Task Description */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Yang Sudah Dikerjakan
                  </label>
                  <textarea
                    value={detail.task}
                    onChange={(e) => updateProjectDetail(detail.id, 'task', e.target.value)}
                    placeholder="Jelaskan apa yang sudah dikerjakan..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px] resize-none"
                    rows={3}
                  />
                </div>

                {/* Progress Description */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Progress/Hasil
                  </label>
                  <textarea
                    value={detail.progress}
                    onChange={(e) => updateProjectDetail(detail.id, 'progress', e.target.value)}
                    placeholder="Jelaskan progress atau hasil yang dicapai..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px] resize-none"
                    rows={3}
                  />
                </div>

                {/* Issue/Kendala (Optional) */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    Kendala (Opsional)
                  </label>
                  <textarea
                    value={detail.issue}
                    onChange={(e) => updateProjectDetail(detail.id, 'issue', e.target.value)}
                    placeholder="Ada kendala atau masalah? Jelaskan di sini..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent min-h-[60px] resize-none"
                    rows={2}
                  />
                </div>

                {/* Hours Spent */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jam Kerja (dalam jam)
                  </label>
                  <Input
                    type="number"
                    min="0.5"
                    max="8"
                    step="0.5"
                    value={detail.hoursSpent}
                    onChange={(e) => updateProjectDetail(detail.id, 'hoursSpent', parseFloat(e.target.value) || 0)}
                    className="w-full"
                  />
                </div>
                {/* Evidence Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bukti Kerja (Foto)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleImageUpload(detail.id, file)
                        }
                      }}
                      className="hidden"
                      id={`evidence-camera-${detail.id}`}
                    />
                    <label
                      htmlFor={`evidence-camera-${detail.id}`}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm"
                    >
                      <Camera className="w-4 h-4" />
                      Ambil Foto
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          handleImageUpload(detail.id, file)
                        }
                      }}
                      className="hidden"
                      id={`evidence-gallery-${detail.id}`}
                    />
                    <label
                      htmlFor={`evidence-gallery-${detail.id}`}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm"
                    >
                      Pilih Galeri
                    </label>
                    {detail.evidence && (
                      <span className="text-xs text-green-600">
                        ✓ {detail.evidence.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">🎯 Rencana Ke Depan (Opsional)</h3>
          <textarea
            value={futurePlan}
            onChange={(e) => setFuturePlan(e.target.value)}
            placeholder="Rencana kerja berikutnya (opsional)..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[80px] resize-none"
            rows={3}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">📚 Riwayat Laporan</h3>

          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter Project
            </label>
            <select
              value={historyProjectFilter}
              onChange={(e) => setHistoryProjectFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              <option value="all">Semua Project</option>
              {availableProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {filteredHistory.length === 0 && (
              <p className="text-sm text-gray-500">Belum ada riwayat laporan.</p>
            )}

            {filteredHistory.map((report: any) => (
              <div key={report.id} className="border rounded-lg p-3 bg-gray-50">
                <div className="text-xs text-gray-500 mb-2">
                  {new Date(report.reportDate).toLocaleDateString('id-ID')} • {report.period}
                </div>
                <div className="text-sm font-medium text-gray-800 mb-1">
                  Total Jam: {report.totalHours} jam
                </div>
                <div className="space-y-1">
                  {(report.reportDetails || []).map((detail: any) => (
                    <div key={detail.id} className="text-sm text-gray-700">
                      • {detail.project?.name || 'Project'}: {detail.progress}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="sticky bottom-4 bg-white p-4 rounded-lg shadow-lg border">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !period}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 py-3 text-base font-medium"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Menyimpan...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Kirim Laporan
            </div>
          )}
        </Button>
        
        {!period && (
          <p className="text-xs text-red-500 text-center mt-2">
            Pilih periode waktu terlebih dahulu
          </p>
        )}
      </div>
    </div>
  )
}
