import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function PUT(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Only GENERAL_AFFAIR, CEO, ADMIN can toggle division status
    if (!['GENERAL_AFFAIR', 'CEO', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 })
    }

    const { divisionId, isActive } = await request.json()

    console.log('Toggle request:', { divisionId, isActive })

    if (!divisionId || typeof isActive !== 'boolean') {
      return NextResponse.json({ 
        success: false, 
        message: 'Division ID and isActive status are required' 
      }, { status: 400 })
    }

    // Check if division exists
    const { data: existingDivision, error: fetchError } = await supabaseAdmin
      .from('divisions')
      .select('*')
      .eq('id', divisionId)
      .maybeSingle()

    console.log('Fetch result:', { existingDivision, fetchError })

    if (fetchError) {
      console.error('Fetch error:', fetchError)
      return NextResponse.json({ 
        success: false, 
        message: 'Error fetching division: ' + fetchError.message 
      }, { status: 500 })
    }

    if (!existingDivision) {
      return NextResponse.json({ 
        success: false, 
        message: 'Division not found' 
      }, { status: 404 })
    }

    // Check if division has users (only if deactivating)
    if (!isActive) {
      const { count: userCount } = await supabaseAdmin
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('divisionId', divisionId)

      if (userCount && userCount > 0) {
        return NextResponse.json({ 
          success: false, 
          message: `Tidak dapat menonaktifkan divisi. Masih ada ${userCount} karyawan aktif. Pindahkan semua karyawan ke divisi lain terlebih dahulu.` 
        }, { status: 400 })
      }
    }

    // Update division status
    const { data: updatedDivision, error: updateError } = await supabaseAdmin
      .from('divisions')
      .update({ 
        isActive: isActive,
        updatedAt: new Date().toISOString()
      })
      .eq('id', divisionId)
      .select()
      .maybeSingle()

    console.log('Update result:', { updatedDivision, updateError })

    if (updateError) {
      console.error('Update division error:', updateError)
      return NextResponse.json({
        success: false,
        message: 'Gagal mengupdate status divisi: ' + updateError.message
      }, { status: 500 })
    }

    if (!updatedDivision) {
      return NextResponse.json({
        success: false,
        message: 'Gagal mengupdate divisi'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Divisi berhasil ${isActive ? 'diaktifkan' : 'dinonaktifkan'}`,
      division: {
        id: updatedDivision.id,
        name: updatedDivision.name,
        isActive: updatedDivision.isActive,
        createdAt: updatedDivision.createdAt,
        updatedAt: updatedDivision.updatedAt
      }
    })

  } catch (error) {
    console.error('Toggle division status error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}