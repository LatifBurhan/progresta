'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ReportForm } from '@/components/reports/ReportForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import type { ProjectReport } from '@/types/report'

export default function EditReportPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const reportId = params.id as string
  
  const [checking, setChecking] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [report, setReport] = useState<ProjectReport | null>(null)
  const [canEdit, setCanEdit] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (authenticated) {
      loadReport()
    }
  }, [authenticated, reportId])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check')
      const data = await res.json()
      
      if (!data.authenticated) {
        router.push('/login')
      } else {
        setAuthenticated(true)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    } finally {
      setChecking(false)
    }
  }

  const loadReport = async () => {
    try {
      const res = await fetch(`/api/reports/list?limit=1000`)
      const data = await res.json()
      
      if (data.success) {
        const foundReport = data.data?.reports?.find((r: any) => r.id === reportId)
        
        if (!foundReport) {
          toast({
            title: 'Error',
            description: 'Laporan tidak ditemukan',
            variant: 'destructive'
          })
          router.push('/reports')
          return
        }
        
        setReport(foundReport)
        setCanEdit(foundReport.can_edit)
        
        if (!foundReport.can_edit) {
          toast({
            title: 'Tidak Dapat Mengedit',
            description: 'Laporan hanya dapat diedit pada hari yang sama',
            variant: 'destructive'
          })
          router.push('/reports')
        }
      } else {
        throw new Error(data.error || 'Gagal memuat laporan')
      }
    } catch (error) {
      console.error('Failed to load report:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat laporan',
        variant: 'destructive'
      })
      router.push('/reports')
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    router.push('/reports')
  }

  const handleCancel = () => {
    router.push('/reports')
  }

  if (checking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!authenticated || !report || !canEdit) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/reports')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Button>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Laporan Progres</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportForm
              mode="edit"
              reportId={reportId}
              initialData={{
                project_id: report.project_id,
                lokasi_kerja: report.lokasi_kerja,
                pekerjaan_dikerjakan: report.pekerjaan_dikerjakan,
                kendala: report.kendala || '',
                rencana_kedepan: report.rencana_kedepan || '',
                foto_urls: report.foto_urls
              }}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
