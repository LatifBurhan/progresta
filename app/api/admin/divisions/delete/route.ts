import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { createClient } from '@supabase/supabase-js'

export async function DELETE(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Only ADMIN can delete divisions
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Only ADMIN can delete divisions' }, { status: 403 })
    }

    const { divisionId } = await request.json()

    if (!divisionId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Division ID is required' 
      }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if division exists
    const { data: existingDivision } = await supabase
      .from('divisions')
      .select('id, name')
      .eq('id', divisionId)
      .single()

    if (!existingDivision) {
      return NextResponse.json({ 
        success: false, 
        message: 'Division not found' 
      }, { status: 404 })
    }

    // Check if division has users
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('division_id', divisionId)

    if (userCount && userCount > 0) {
      return NextResponse.json({ 
        success: false, 
        message: `Cannot delete division. It has ${userCount} users. Please move all users to other divisions first.` 
      }, { status: 400 })
    }

    // Delete division
    const { error } = await supabase
      .from('divisions')
      .delete()
      .eq('id', divisionId)

    if (error) {
      console.error('Supabase delete division error:', error)
      return NextResponse.json({
        success: false,
        message: 'Gagal menghapus divisi: ' + error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Divisi berhasil dihapus'
    })

  } catch (error: any) {
    console.error('Delete division error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error: ' + error.message
    }, { status: 500 })
  }
}