import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { createSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email and password required' 
      }, { status: 400 })
    }

    const results: any = {
      steps: [],
      success: false,
      email
    }

    const supabase = createClient()

    // Step 1: Try Supabase Auth login
    results.steps.push('Attempting Supabase Auth login...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      results.authError = authError?.message || 'No user returned'
      return NextResponse.json({ 
        success: false, 
        message: 'Auth login failed: ' + (authError?.message || 'Unknown error'),
        results
      }, { status: 400 })
    }

    results.authUser = {
      id: authData.user.id,
      email: authData.user.email,
      created_at: authData.user.created_at
    }

    // Step 2: Get user data from public.users
    results.steps.push('Fetching user data from public.users...')
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, name, role, status_pending, division_id')
      .eq('id', authData.user.id)
      .single()

    if (userError || !userData) {
      results.userError = userError?.message || 'User not found in public.users'
      return NextResponse.json({ 
        success: false, 
        message: 'User data fetch failed: ' + (userError?.message || 'User not found'),
        results
      }, { status: 400 })
    }

    results.publicUser = userData

    // Step 3: Check status_pending
    if (userData.status_pending) {
      return NextResponse.json({ 
        success: false, 
        message: 'Account pending approval',
        results
      }, { status: 400 })
    }

    // Step 4: Create session
    results.steps.push('Creating session...')
    await createSession({
      userId: authData.user.id,
      email: authData.user.email!,
      role: userData.role,
      name: userData.name || authData.user.user_metadata?.name || authData.user.email!.split('@')[0]
    })

    results.success = true
    results.steps.push('Login successful!')

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role
      },
      results
    })

  } catch (error: any) {
    console.error('Test login error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error.message
    }, { status: 500 })
  }
}