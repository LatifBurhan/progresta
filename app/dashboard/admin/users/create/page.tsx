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
    <div className="container mx-auto px-6 py-10 max-w-5xl">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <nav className="flex items-center space-x-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
            <span className="text-slate-300">/</span>
            <Link href="/dashboard/admin/users/manage" className="hover:text-blue-600 transition-colors">Database Karyawan</Link>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">Tambah User</span>
          </nav>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Manajemen Personel</h1>
        </div>
        
        <Link href="/dashboard/admin/users/manage">
          <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all flex items-center gap-3 font-bold shadow-sm">
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            Kembali ke Database
          </Button>
        </Link>
      </div>

      {divisions.length === 0 && (
        <div className="mb-8 p-5 bg-amber-50/50 border border-amber-100 rounded-[1.5rem] flex items-center gap-4 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-xl">
            ⚠️
          </div>
          <p className="text-sm text-amber-800 font-bold tracking-tight">
            Koneksi Database Terganggu: Tidak dapat memuat data divisi saat ini.
          </p>
        </div>
      )}

      <CreateUserForm divisions={divisions} />
    </div>
  )
}