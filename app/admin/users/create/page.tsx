import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import CreateUserForm from '../CreateUserForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function CreateUserPage() {
  const session = await verifySession()

  if (!session) {
    redirect('/login')
  }

  if (!supabaseAdmin) {
    return <div>Database configuration error</div>
  }

  // Check user status and role using Supabase
  const { data: userData, error } = await supabaseAdmin
    .from('users')
    .select('role, status')
    .eq('id', session.userId)
    .single()

  if (error || !userData) {
    redirect('/login')
  }

  if (userData.status === 'PENDING') {
    redirect('/waiting-room')
  }

  // Only GENERAL_AFFAIR, CEO, ADMIN can create users
  if (!['GENERAL_AFFAIR', 'CEO', 'ADMIN'].includes(userData.role)) {
    redirect('/admin/users')
  }

  if (!supabaseAdmin) {
    return <div>Database configuration error</div>
  }

  // Get all active divisions from Supabase
  const { data: divisions } = await supabaseAdmin
    .from('divisions')
    .select('id, name, color')
    .eq('isActive', true)
    .order('name', { ascending: true })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
          <span>/</span>
          <Link href="/admin/users" className="hover:text-blue-600">Database Karyawan</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Tambah User</span>
        </nav>
        
        <Link href="/admin/users">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Database Karyawan
          </Button>
        </Link>
      </div>

      <CreateUserForm divisions={divisions || []} />
    </div>
  )
}