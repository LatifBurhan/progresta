import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import { Suspense } from 'react'
import AdminDivisionsClient from './AdminDivisionsClient'

export default async function AdminDivisionsPage() {
  const session = await verifySession()

  if (!session) {
    redirect('/login')
  }

  // Only PM, HRD, CEO, ADMIN can access
  if (!['PM', 'HRD', 'CEO', 'ADMIN'].includes(session.role)) {
    redirect('/dashboard')
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
        
        <Suspense fallback={
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        }>
          <AdminDivisionsClient />
        </Suspense>
      </div>
    </div>
  )
}