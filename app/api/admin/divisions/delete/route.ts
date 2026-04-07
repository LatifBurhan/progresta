import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { createClient } from '@supabase/supabase-js'

export async function DELETE(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Only ADMIN, CEO, GENERAL_AFFAIR can delete divisions
    if (!['ADMIN', 'CEO', 'GENERAL_AFFAIR'].includes(session.role)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Hanya ADMIN, CEO, atau GENERAL_AFFAIR yang dapat menghapus divisi' 
      }, { status: 403 })
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
    const { data: existingDivision, error: fetchError } = await supabase
      .from('divisions')
      .select('id, name')
      .eq('id', divisionId)
      .single()

    if (fetchError || !existingDivision) {
      return NextResponse.json({ 
        success: false, 
        message: 'Divisi tidak ditemukan' 
      }, { status: 404 })
    }

    // Check if division has users
    const { count: userCount } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('division_id', divisionId)

    if (userCount && userCount > 0) {
      return NextResponse.json({ 
        success: false, 
        message: `Tidak dapat menghapus divisi. Masih ada ${userCount} karyawan. Pindahkan semua karyawan ke divisi lain terlebih dahulu.` 
      }, { status: 400 })
    }

    // Check if division has projects
    const { count: projectCount } = await supabase
      .from('project_divisions')
      .select('project_id', { count: 'exact', head: true })
      .eq('division_id', divisionId)

    if (projectCount && projectCount > 0) {
      return NextResponse.json({ 
        success: false, 
        message: `Tidak dapat menghapus divisi. Masih ada ${projectCount} project terkait. Pindahkan atau hapus semua project terlebih dahulu.` 
      }, { status: 400 })
    }

    // Delete division
    const { error: deleteError } = await supabase
      .from('divisions')
      .delete()
      .eq('id', divisionId)

    if (deleteError) {
      console.error('Supabase delete division error:', deleteError)
      return NextResponse.json({
        success: false,
        message: 'Gagal menghapus divisi: ' + deleteError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Divisi "${existingDivision.name}" berhasil dihapus`
    })

  } catch (error: any) {
    console.error('Delete division error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error: ' + error.message
    }, { status: 500 })
  }
}