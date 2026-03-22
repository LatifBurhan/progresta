import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin, createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get('email')

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
    }

    const results: any = {
      email,
      timestamp: new Date().toISOString(),
      checks: {}
    }

    // Check 1: Supabase Admin Client
    results.checks.supabaseAdmin = {
      configured: !!supabaseAdmin,
      error: !supabaseAdmin ? 'SUPABASE_SERVICE_ROLE_KEY not configured' : null
    }

    if (supabaseAdmin) {
      // Check 2: User in public.users
      try {
        const { data: publicUser, error: publicError } = await supabaseAdmin
          .from('users')
          .select('id, email, name, role, status_pending')
          .eq('email', email)
          .single()

        results.checks.publicUser = {
          exists: !!publicUser,
          data: publicUser,
          error: publicError?.message || null
        }
      } catch (error: any) {
        results.checks.publicUser = {
          exists: false,
          error: error.message
        }
      }

      // Check 3: User in auth.users (if accessible)
      try {
        const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
        const authUser = authUsers?.users?.find(u => u.email === email)
        
        results.checks.authUser = {
          exists: !!authUser,
          data: authUser ? {
            id: authUser.id,
            email: authUser.email,
            email_confirmed_at: authUser.email_confirmed_at,
            last_sign_in_at: authUser.last_sign_in_at,
            created_at: authUser.created_at
          } : null,
          error: authError?.message || null
        }
      } catch (error: any) {
        results.checks.authUser = {
          exists: false,
          error: error.message
        }
      }
    }

    // Check 4: Regular client
    const supabase = createClient()
    results.checks.regularClient = {
      configured: !!supabase
    }

    // Check 5: Environment variables
    results.checks.environment = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      SESSION_SECRET: !!process.env.SESSION_SECRET
    }

    return NextResponse.json(results, { status: 200 })

  } catch (error: any) {
    console.error('Debug auth error:', error)
    return NextResponse.json({
      error: 'Debug failed',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}