import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabase'

export async function DELETE(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Only ADMIN can delete users
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Hanya ADMIN yang dapat menghapus user' }, { status: 403 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'User ID wajib diisi' 
      }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
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

    // Delete user from database first
    await prisma.user.delete({
      where: { id: userId }
    })

    // Delete user from Supabase Auth if admin client available
    if (supabaseAdmin) {
      try {
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
        if (authError) {
          console.error('Supabase Auth delete error:', authError)
          // Continue even if auth deletion fails
        }
      } catch (error: any) {
        console.error('Supabase Auth delete failed:', error)
        // Continue even if auth deletion fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User berhasil dihapus'
    })

  } catch (error: any) {
    console.error('Delete user error:', error)
    
    // Handle specific Prisma errors
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        message: 'User tidak ditemukan'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan internal server'
    }, { status: 500 })
  }
}