import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
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

    if (!userId || !email || !role || !divisionId) {
      console.log('Validation failed:', { userId, email, name, role, divisionId }); // Debug
      return NextResponse.json({ 
        success: false, 
        message: 'Email, role, dan divisi wajib diisi' 
      }, { status: 400 })
    }

    // Validate role - sesuai dengan constraint database
    const validRoles = ['KARYAWAN', 'PM', 'HRD', 'CEO', 'ADMIN']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Role tidak valid. Valid roles: ' + validRoles.join(', ')
      }, { status: 400 })
    }

    // Permission checks
    if (session.role === 'HRD' && !['KARYAWAN', 'PM'].includes(role)) {
      return NextResponse.json({ 
        success: false, 
        message: 'HRD hanya dapat mengedit role KARYAWAN dan PM' 
      }, { status: 403 })
    }

    if (session.role === 'CEO' && role === 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        message: 'CEO tidak dapat mengedit user ADMIN' 
      }, { status: 403 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ 
        success: false, 
        message: 'Database client not configured' 
      }, { status: 500 })
    }

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single()

    if (fetchError || !existingUser) {
      return NextResponse.json({ 
        success: false, 
        message: 'User tidak ditemukan' 
      }, { status: 404 })
    }

    // Check if email is taken by another user
    if (email !== existingUser.email) {
      const { data: emailExists } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .single()

      if (emailExists) {
        return NextResponse.json({ 
          success: false, 
          message: 'Email sudah digunakan user lain' 
        }, { status: 400 })
      }
    }

    // Check if division exists
    const { data: division, error: divError } = await supabaseAdmin
      .from('divisions')
      .select('id, name, color')
      .eq('id', divisionId)
      .single()

    if (divError || !division) {
      return NextResponse.json({ 
        success: false, 
        message: 'Divisi tidak ditemukan' 
      }, { status: 404 })
    }

    // Update password in Supabase Auth if provided
    if (password) {
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
        return NextResponse.json({ 
          success: false, 
          message: 'Gagal update password' 
        }, { status: 500 })
      }
    } else {
      // Update user metadata even without password change
      try {
        await supabaseAdmin.auth.admin.updateUserById(
          userId,
          { 
            user_metadata: {
              name,
              phone: phone || null,
              position: position || null
            }
          }
        )
      } catch (error: any) {
        console.error('Supabase Auth metadata update failed:', error)
        // Continue with user data update
      }
    }

    // Update user in database using Supabase
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        email,
        role,
        divisionId,
        updatedAt: new Date().toISOString()
      })
      .eq('id', userId)
      .select(`
        id,
        email,
        role,
        status,
        divisionId,
        createdAt,
        updatedAt
      `)
      .single()

    if (updateError) {
      console.error('Supabase update error:', updateError)
      return NextResponse.json({ 
        success: false, 
        message: 'Gagal update user: ' + updateError.message 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'User berhasil diupdate',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status || 'ACTIVE',
        divisionId: updatedUser.divisionId,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
        division: division,
        profile: {
          name: name,
          phone: phone || null,
          position: position || null,
          fotoProfil: null
        }
      }
    })

  } catch (error: any) {
    console.error('Update user error:', error)
    console.error('Error stack:', error.stack)
    
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan internal server: ' + error.message
    }, { status: 500 })
  }
}