import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import { createClient } from '@supabase/supabase-js'
import UserManagementClient from './UserManagementClient'

export default async function UserManagePage() {
  const session = await verifySession()

  if (!session) {
    redirect('/login')
  }

  // Only GENERAL_AFFAIR, CEO, ADMIN can manage users
  if (!['GENERAL_AFFAIR', 'CEO', 'ADMIN'].includes(session.role)) {
    redirect('/dashboard')
  }

  // Get all users with their divisions using Supabase client
  let allUsers: any[] = []
  let divisions: any[] = []

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get all users with their divisions
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
        fotoProfil,
        name,
        phone,
        employee_status,
        address,
        notes,
        divisions!inner(name, color)
      `)
      .order('createdAt', { ascending: false })

    if (usersError) {
      console.error('Failed to fetch users:', usersError)
      allUsers = []
    } else {
      // Get today's reports count for each user
      const userIds = (users || []).map(u => u.id)
      
      const { data: reportsData } = await supabase
        .from('reports')
        .select('userId')
        .in('userId', userIds)
        .gte('createdAt', today.toISOString())
        .lt('createdAt', tomorrow.toISOString())

      // Count reports per user
      const reportCounts: Record<string, number> = {}
      reportsData?.forEach(report => {
        reportCounts[report.userId] = (reportCounts[report.userId] || 0) + 1
      })

      // Transform users to match expected format
      allUsers = (users || []).map(user => {
        const todayReports = reportCounts[user.id] || 0
        const todayProgress = Math.min(Math.round((todayReports / 3) * 100), 100)
        
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          divisionId: user.divisionId,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          employee_status: user.employee_status || undefined,
          address: user.address || undefined,
          notes: user.notes || undefined,
          division: user.divisions,
          todayReports,
          todayProgress,
          profile: {
            name: user.name || user.email.split('@')[0],
            fotoProfil: user.fotoProfil || null,
            phone: user.phone || null,
            position: null
          }
        }
      })
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