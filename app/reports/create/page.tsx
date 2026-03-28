'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ReportForm } from '@/components/reports/ReportForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CreateReportPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

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

  const handleSuccess = () => {
    router.push('/reports')
  }

  const handleCancel = () => {
    router.push('/reports')
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!authenticated) {
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
            <CardTitle>Buat Laporan Progres</CardTitle>
          </CardHeader>
          <CardContent>
            <ReportForm
              mode="create"
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
