import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Only GENERAL_AFFAIR, CEO, ADMIN can create users directly
    if (!['GENERAL_AFFAIR', 'CEO', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 })
    }

    const { email, password, name, phone, position, employee_status, address, notes, role, divisionId } = await request.json()

    if (!email || !password || !name || !role || !divisionId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email, password, nama, role, dan divisi wajib diisi' 
      }, { status: 400 })
    }

    // Validate role - sesuai dengan constraint database (uppercase)
    const validRoles = ['STAFF', 'PM', 'GENERAL_AFFAIR', 'CEO', 'ADMIN']
    if (!validRoles.includes(role.toUpperCase())) {
      return NextResponse.json({ 
        success: false, 
        message: 'Role tidak valid' 
      }, { status: 400 })
    }

    const normalizedRole = role.toUpperCase() // Convert to uppercase

    // Only ADMIN can create ADMIN users
    if (normalizedRole === 'ADMIN' && session.role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        message: 'Hanya ADMIN yang dapat membuat user ADMIN' 
      }, { status: 403 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if division exists
    const { data: division } = await supabase
      .from('divisions')
      .select('id, name')
      .eq('id', divisionId)
      .single()

    if (!division) {
      return NextResponse.json({ 
        success: false, 
        message: 'Divisi tidak ditemukan' 
      }, { status: 404 })
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email sudah terdaftar' 
      }, { status: 400 })
    }

    // Create user in Supabase Auth first
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name,
        phone: phone || null,
        position: position || null
      },
      email_confirm: true
    })

    if (authError) {
      console.error('Supabase Auth error:', authError)
      return NextResponse.json({ 
        success: false, 
        message: `Gagal membuat user di sistem autentikasi: ${authError.message}` 
      }, { status: 400 })
    }

    // Hash password for database storage
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user record in database
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: email,
        password: hashedPassword, // Include hashed password
        role: normalizedRole, // Use normalized (uppercase) role
        divisionId: divisionId,
        employee_status: employee_status || null,
        address: address || null,
        notes: notes || null,
        status: 'ACTIVE', // Use 'ACTIVE' instead of status_pending: false
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: authData.user.id // Set createdBy to the user's own ID for admin-created users
      }])
      .select(`
        id,
        email,
        role,
        divisionId,
        employee_status,
        address,
        notes,
        status,
        createdAt,
        divisions!inner(name, color)
      `)
      .single()

    if (dbError) {
      console.error('Database user creation error:', dbError)
      // Try to delete the auth user if database creation failed
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ 
        success: false, 
        message: `Gagal membuat user di database: ${dbError.message}` 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'User berhasil dibuat dan dapat langsung login',
      user: {
        id: userData.id,
        email: userData.email,
        name: name,
        role: userData.role,
        divisionId: userData.divisionId,
        status: userData.status,
        createdAt: userData.createdAt,
        division: userData.divisions,
        profile: {
          name: name,
          phone: phone || null,
          position: position || null,
          fotoProfil: null
        }
      }
    })

  } catch (error: any) {
    console.error('Create user error:', error)
    return NextResponse.json({
      success: false,
      message: 'Terjadi kesalahan internal server: ' + error.message
    }, { status: 500 })
  }
}