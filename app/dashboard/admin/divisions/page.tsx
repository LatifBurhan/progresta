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
    
    // Get all divisions
    const { data: divisions, error } = await supabase
      .from('divisions')
      .select('id, name, description, color, createdAt, updatedAt, isActive')
      .eq('isActive', true)  // Only get active divisions
      .order('name', { ascending: true })

    if (error) {
      console.error('Failed to fetch divisions:', error)
      divisionsWithCounts = []
    } else {
      // Transform data to include counts (set to 0 for now)
      divisionsWithCounts = (divisions || []).map(division => ({
        id: division.id,
        name: division.name,
        description: division.description,
        color: division.color || '#3B82F6',
        createdAt: division.createdAt,
        updatedAt: division.updatedAt,
        isActive: division.isActive,
        userCount: 0, // Will be calculated separately if needed
        projectCount: 0, // Will be calculated separately if needed
      }))
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