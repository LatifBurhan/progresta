import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import CreateUserForm from './CreateUserForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function CreateUserPage() {
  const session = await verifySession()

  if (!session) {
    redirect('/login')
  }

  // Only HRD, CEO, ADMIN can create users
  if (!['HRD', 'CEO', 'ADMIN'].includes(session.role)) {
    redirect('/dashboard')
  }

  // Get all active divisions
  const divisions = await prisma.division.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
          <span>/</span>
          <Link href="/admin/users" className="hover:text-blue-600">Manajemen User</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Tambah User</span>
        </nav>
        
        <Link href="/admin/users">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Manajemen User
          </Button>
        </Link>
      </div>

      <CreateUserForm divisions={divisions} />
    </div>
  )
}