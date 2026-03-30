import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Only ADMIN, HRD, CEO can access departments
    if (!['ADMIN', 'HRD', 'CEO'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
    }

    const { data: departments, error } = await supabaseAdmin
      .from('departments')
      .select('id, name, description, color, "isActive"')
      .eq('isActive', true)
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching departments:', error)
      return NextResponse.json({ success: false, message: 'Failed to fetch departments' }, { status: 500 })
    }

    return NextResponse.json({ success: true, departments: departments || [] })
  } catch (error) {
    console.error('Error in GET /api/admin/departments:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
