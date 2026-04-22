import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Only ADMIN and GENERAL_AFFAIR can delete users
    if (!['ADMIN', 'GENERAL_AFFAIR'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'Hanya ADMIN atau HRD yang dapat menghapus user' }, { status: 403 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'User ID wajib diisi' 
      }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Database configuration error'
      }, { status: 500 })
    }

    // Check if user exists in database
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('id', userId)
      .single()

    if (fetchError || !existingUser) {
      return NextResponse.json({ 
        success: false, 
        message: 'User tidak ditemukan' 
      }, { status: 404 })
    }

    // Prevent self-deletion
    if (userId === session.userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Tidak dapat menghapus akun sendiri' 
      }, { status: 400 })
    }

    // Delete user from Supabase Auth first
    try {
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
      if (authError) {
        console.error('Supabase Auth delete error:', authError)
        return NextResponse.json({
          success: false,
          message: 'Gagal menghapus user dari sistem autentikasi: ' + authError.message
        }, { status: 500 })
      }
    } catch (error: any) {
      console.error('Supabase Auth delete failed:', error)
      return NextResponse.json({
        success: false,
        message: 'Gagal menghapus user dari sistem autentikasi'
      }, { status: 500 })
    }

    // Delete user from database
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)

    if (dbError) {
      console.error('Database delete error:', dbError)
      return NextResponse.json({
        success: false,
        message: 'Gagal menghapus user dari database: ' + dbError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'User berhasil dihapus secara permanen'
    })

  } catch (error: any) {
    console.error('Delete user error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan internal server: ' + error.message
    }, { status: 500 })
  }
}