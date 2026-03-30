import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import { createClient } from '@supabase/supabase-js'
import DivisionManagementClient from './DivisionManagementClient'

export default async function DivisionManagePage() {
  const session = await verifySession()

  if (!session) {
    redirect('/login')
  }

  // Only HRD, CEO, ADMIN can manage divisions
  if (!['HRD', 'CEO', 'ADMIN'].includes(session.role)) {
    redirect('/dashboard')
  }

  let divisionsWithCounts = []

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get all divisions (both active and inactive)
    const { data: divisions, error } = await supabase
      .from('divisions')
      .select('id, name, description, color, createdAt, updatedAt, isActive')
      .order('name', { ascending: true })

    if (error) {
      console.error('Failed to fetch divisions:', error)
      divisionsWithCounts = []
    } else {
      // For each division, get real user count and project count
      const divisionsWithCountsPromises = (divisions || []).map(async (division) => {
        // Count users in this division
        const { count: userCount } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('divisionId', division.id)

        // Count projects in this division (via project_divisions junction table)
        const { count: projectCount } = await supabase
          .from('project_divisions')
          .select('project_id', { count: 'exact', head: true })
          .eq('division_id', division.id)

        return {
          id: division.id,
          name: division.name,
          description: division.description,
          color: division.color || '#3B82F6',
          createdAt: division.createdAt,
          updatedAt: division.updatedAt,
          isActive: division.isActive,
          userCount: userCount || 0,
          projectCount: projectCount || 0,
        }
      })

      divisionsWithCounts = await Promise.all(divisionsWithCountsPromises)
    }

  } catch (error) {
    console.error('Failed to fetch divisions:', error)
    divisionsWithCounts = []
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {divisionsWithCounts.length === 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800">
            ⚠️ Tidak dapat memuat data divisi. Periksa koneksi database.
          </p>
        </div>
      )}
      
      <DivisionManagementClient 
        divisions={divisionsWithCounts}
        currentUserRole={session.role}
      />
    </div>
  )
}