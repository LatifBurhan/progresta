import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { verifySession } from '@/lib/session'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifySession()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Users can only view their own profile unless they're admin
    const adminRoles = ['ADMIN', 'HRD', 'CEO']
    if (params.id !== session.userId && !adminRoles.includes(session.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }

    const supabase = createClient()
    
    // Get user data
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, role, status, divisionId, created_at')
      .eq('id', params.id)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Get division data if user has divisionId
    let division = null
    if (user.divisionId) {
      const { data: divisionData } = await supabase
        .from('divisions')
        .select('id, name, description, color')
        .eq('id', user.divisionId)
        .single()
      
      division = divisionData
    }

    // Combine user and division data
    const userData = {
      ...user,
      divisions: division
    }

    return NextResponse.json({
      success: true,
      data: userData
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
