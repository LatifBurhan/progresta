'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import AdminDivisionsClient from './AdminDivisionsClient'

export default function AdminDivisionsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check')
      const data = await res.json()
      
      if (!data.authenticated) {
        router.push('/login')
        return
      }

      // Only PM, GENERAL_AFFAIR, CEO, ADMIN can access
      const adminRoles = ['PM', 'GENERAL_AFFAIR', 'CEO', 'ADMIN']
      if (!adminRoles.includes(data.user?.role)) {
        router.push('/dashboard')
        return
      }

      setAuthorized(true)
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!authorized) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            🏢 Manajemen Divisi
          </h1>
          <p className="text-gray-600 mt-2">
            Kelola divisi dan struktur organisasi perusahaan
          </p>
        </div>
        
        <AdminDivisionsClient />
      </div>
    </div>
  )
}
