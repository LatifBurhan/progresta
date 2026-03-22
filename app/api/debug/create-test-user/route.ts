import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json()

    if (!email || !password || !name || !role) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields' 
      }, { status: 400 })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ 
        success: false, 
        message: 'Supabase admin client not configured. Check SUPABASE_SERVICE_ROLE_KEY in .env' 
      }, { status: 500 })
    }

    const results: any = {
      steps: [],
      success: false
    }

    // Step 1: Check if user already exists
    results.steps.push('Checking existing user...')
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        message: 'User already exists',
        results
      }, { status: 400 })
    }

    // Step 2: Get active division
    results.steps.push('Getting active division...')
    const { data: division, error: divisionError } = await supabaseAdmin
      .from('divisions')
      .select('id, name')
      .eq('is_active', true)
      .limit(1)
      .single()

    if (divisionError || !division) {
      return NextResponse.json({ 
        success: false, 
        message: 'No active division found',
        error: divisionError?.message,
        results
      }, { status: 400 })
    }

    results.division = division

    // Step 3: Create user in Supabase Auth
    results.steps.push('Creating user in Supabase Auth...')
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name
      },
      email_confirm: true
    })

    if (authError || !authData.user) {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to create auth user',
        error: authError?.message,
        results
      }, { status: 400 })
    }

    results.authUser = {
      id: authData.user.id,
      email: authData.user.email
    }

    // Step 4: Create user in public.users
    results.steps.push('Creating user in public.users...')
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        name: name,
        role: role,
        division_id: division.id,
        status_pending: false
      })
      .select()
      .single()

    if (userError) {
      // Clean up auth user if public user creation failed
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to create public user',
        error: userError.message,
        results
      }, { status: 500 })
    }

    results.publicUser = userData
    results.success = true
    results.steps.push('User created successfully!')

    return NextResponse.json({
      success: true,
      message: 'Test user created successfully',
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role
      },
      results
    })

  } catch (error: any) {
    console.error('Create test user error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error.message
    }, { status: 500 })
  }
}