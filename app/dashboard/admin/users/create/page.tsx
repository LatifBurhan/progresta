import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import { createClient } from '@supabase/supabase-js'
import CreateUserForm from './CreateUserForm'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function CreateUserPage() {
  const session = await verifySession()

  if (!session) {
    redirect('/login')
  }

  // Only GENERAL_AFFAIR, CEO, ADMIN can create users
  if (!['GENERAL_AFFAIR', 'CEO', 'ADMIN'].includes(session.role)) {
    redirect('/dashboard')
  }

  // Get all divisions with department info using Supabase client
  let divisions: Array<{ id: string; name: string; color: string | null; department_id: string }> = []
  
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const { data, error } = await supabase
      .from('divisions')
      .select('id, name, color, department_id')
      .eq('isActive', true)
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Failed to fetch divisions:', error)
      divisions = []
    } else {
      divisions = data || []
    }
  } catch (error) {
    console.error('Failed to fetch divisions:', error)
    divisions = []
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
          <span>/</span>
          <Link href="/dashboard/admin/users/manage" className="hover:text-blue-600">Database Karyawan</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Tambah User</span>
        </nav>
        
        <Link href="/dashboard/admin/users/manage">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Database Karyawan
          </Button>
        </Link>
      </div>

      {divisions.length === 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800">
            ⚠️ Tidak dapat memuat data divisi. Periksa koneksi database.
          </p>
        </div>
      )}

      <CreateUserForm divisions={divisions} />
    </div>
  )
}