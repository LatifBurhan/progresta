import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import { createClient } from '@supabase/supabase-js'
import UserManagementClient from './UserManagementClient'

export default async function UserManagePage() {
  const session = await verifySession()

  if (!session) {
    redirect('/login')
  }

  // Only HRD, CEO, ADMIN can manage users
  if (!['HRD', 'CEO', 'ADMIN'].includes(session.role)) {
    redirect('/dashboard')
  }

  // Get all users with their divisions using Supabase client
  let allUsers: any[] = []
  let divisions: any[] = []

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get all active users with their divisions
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        role,
        status,
        divisionId,
        createdAt,
        updatedAt,
        divisions!inner(name, color)
      `)
      .eq('status', 'ACTIVE') // Only active users
      .order('createdAt', { ascending: false })

    if (usersError) {
      console.error('Failed to fetch users:', usersError)
      allUsers = []
    } else {
      // Transform users to match expected format
      allUsers = (users || []).map(user => ({
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        divisionId: user.divisionId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        division: user.divisions,
        profile: {
          name: user.email.split('@')[0], // Fallback: use email prefix as name
          fotoProfil: null,
          phone: null,
          position: null
        }
      }))
    }

    // Get all divisions with department info
    const { data: divisionsData, error: divisionsError } = await supabase
      .from('divisions')
      .select('id, name, color, department_id')
      .eq('isActive', true)
      .order('name', { ascending: true })

    if (divisionsError) {
      console.error('Failed to fetch divisions:', divisionsError)
      divisions = []
    } else {
      divisions = divisionsData || []
    }

  } catch (error) {
    console.error('Failed to fetch users or divisions:', error)
    allUsers = []
    divisions = []
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {allUsers.length === 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800">
            ⚠️ Tidak dapat memuat data user. Periksa koneksi database.
          </p>
        </div>
      )}
      
      <UserManagementClient 
        allUsers={allUsers}
        divisions={divisions}
        currentUserRole={session.role}
      />
    </div>
  )
}