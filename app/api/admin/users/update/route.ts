import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { supabaseAdmin } from '@/lib/supabase'

export async function PUT(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Only HRD, CEO, ADMIN can update users
    if (!['HRD', 'CEO', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 })
    }

    const { userId, email, name, phone, position, role, divisionId, password } = await request.json()

    if (!userId || !email || !name || !role || !divisionId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email, nama, role, dan divisi wajib diisi' 
      }, { status: 400 })
    }

    // Validate role - sesuai dengan constraint database
    const validRoles = ['Karyawan', 'PM', 'HRD', 'CEO', 'ADMIN']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Role tidak valid' 
      }, { status: 400 })
    }

    // Permission checks
    if (session.role === 'HRD' && !['Karyawan', 'PM'].includes(role)) {
      return NextResponse.json({ 
        success: false, 
        message: 'HRD hanya dapat mengedit role Karyawan dan PM' 
      }, { status: 403 })
    }

    if (session.role === 'CEO' && role === 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        message: 'CEO tidak dapat mengedit user ADMIN' 
      }, { status: 403 })
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

    // Check if email is taken by another user
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json({ 
          success: false, 
          message: 'Email sudah digunakan user lain' 
        }, { status: 400 })
      }
    }

    // Check if division exists
    const division = await prisma.division.findUnique({
      where: { id: divisionId }
    })

    if (!division) {
      return NextResponse.json({ 
        success: false, 
        message: 'Divisi tidak ditemukan' 
      }, { status: 404 })
    }

    // Update user data
    const userUpdateData: any = {
      email,
      name,
      role,
      divisionId
    }

    // Update password in Supabase Auth if provided
    if (password && supabaseAdmin) {
      try {
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { 
            password,
            user_metadata: {
              name,
              phone: phone || null,
              position: position || null
            }
          }
        )

        if (authError) {
          console.error('Supabase Auth update error:', authError)
          return NextResponse.json({ 
            success: false, 
            message: `Gagal update password: ${authError.message}` 
          }, { status: 400 })
        }
      } catch (error: any) {
        console.error('Supabase Auth update failed:', error)
        // Continue with user data update even if auth update fails
      }
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: userUpdateData,
      include: {
        division: {
          select: {
            name: true,
            color: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User berhasil diupdate',
      user: {
        ...updatedUser,
        createdAt: updatedUser.createdAt.toISOString(),
        // Create mock profile from user data
        profile: {
          name: updatedUser.name,
          phone: phone || null,
          position: position || null,
          fotoProfil: null
        }
      }
    })

  } catch (error: any) {
    console.error('Update user error:', error)
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json({
        success: false,
        message: 'Email sudah digunakan'
      }, { status: 400 })
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json({
        success: false,
        message: 'User atau divisi tidak ditemukan'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan internal server'
    }, { status: 500 })
  }
}