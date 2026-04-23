import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('=== GET /api/admin/departments called ===')
    
    const session = await verifySession()
    console.log('Session:', session)

    if (!session) {
      console.log('No session found - unauthorized')
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Allow ADMIN, GENERAL_AFFAIR, CEO, and PM to access departments
    if (!['ADMIN', 'GENERAL_AFFAIR', 'CEO', 'PM'].includes(session.role)) {
      console.log('Insufficient role:', session.role)
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    console.log('Fetching departments from database...')
    console.log('supabaseAdmin is null?', supabaseAdmin === null)
    
    if (!supabaseAdmin) {
      console.error('supabaseAdmin is not configured!')
      return NextResponse.json({ 
        success: false, 
        message: 'Database client not configured' 
      }, { status: 500 })
    }
    
    const { data: departments, error } = await supabaseAdmin
      .from('departments')
      .select('*')
      .eq('isActive', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching departments:', error)
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to fetch departments', 
        error: error.message,
        details: error 
      }, { status: 500 })
    }

    console.log('Departments fetched successfully:', departments)

    return NextResponse.json({ success: true, departments: departments || [] })
  } catch (error) {
    console.error('Error in GET /api/admin/departments:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
