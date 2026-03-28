'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ReportHistory } from '@/components/reports/ReportHistory'
import { Button } from '@/components/ui/button'
import { Loader2, Plus } from 'lucide-react'
import { Toaster } from '@/components/ui/toaster'

export default function ReportsPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

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
        // Check if user is admin (ADMIN, HRD, or CEO)
        const adminRoles = ['ADMIN', 'HRD', 'CEO']
        setIsAdmin(adminRoles.includes(data.user?.role))
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    } finally {
      setChecking(false)
    }
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Laporan Progres</h1>
            <p className="text-muted-foreground mt-1">
              {isAdmin ? 'Kelola semua laporan progres project' : 'Riwayat laporan progres Anda'}
            </p>
          </div>
          <Button onClick={() => router.push('/reports/create')} className="gap-2">
            <Plus className="w-4 h-4" />
            Buat Laporan
          </Button>
        </div>

        {/* Report History */}
        <ReportHistory isAdmin={isAdmin} />
      </div>

      {/* Toast Notifications */}
      <Toaster />
    </div>
  )
}
