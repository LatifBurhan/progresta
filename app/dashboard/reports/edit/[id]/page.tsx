'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ReportForm } from '@/components/reports/ReportForm'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Toaster } from '@/components/ui/toaster'
import type { ProjectReport } from '@/types/report'

export default function EditReportPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const reportId = params.id as string

  const [report, setReport] = useState<ProjectReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReport()
  }, [reportId])

  const loadReport = async () => {
    try {
      const res = await fetch(`/api/reports/${reportId}`)
      const data = await res.json()

      if (data.success) {
        setReport(data.data)
      } else {
        setError(data.error || 'Gagal memuat laporan')
        toast({
          title: 'Error',
          description: data.error || 'Gagal memuat laporan',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Failed to load report:', error)
      setError('Gagal memuat laporan')
      toast({
        title: 'Error',
        description: 'Gagal memuat laporan',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    toast({
      title: 'Berhasil',
      description: 'Laporan berhasil diperbarui'
    })
    router.push('/dashboard/reports?view=history')
  }

  const handleCancel = () => {
    router.push('/dashboard/reports?view=history')
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="text-center p-12 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground mb-4">{error || 'Laporan tidak ditemukan'}</p>
          <Button onClick={() => router.push('/dashboard/reports?view=history')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </div>
        <Toaster />
      </div>
    )
  }

  return (
    <>
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div>
          <button
            onClick={() => router.push('/dashboard/reports?view=history')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Riwayat
          </button>
          <h1 className="text-3xl font-bold">Edit Laporan</h1>
          <p className="text-muted-foreground mt-1">
            Perbarui laporan progres Anda
          </p>
        </div>

        {/* Edit Form */}
        <ReportForm
          mode="edit"
          reportId={reportId}
          initialData={report}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>

      {/* Toast Notifications */}
      <Toaster />
    </>
  )
}
