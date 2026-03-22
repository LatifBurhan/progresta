import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const envCheck = {
      timestamp: new Date().toISOString(),
      nodeEnv: process.env.NODE_ENV,
      environment: {
        NEXT_PUBLIC_SUPABASE_URL: {
          exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          value: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
            `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20)}...` : 
            null,
          length: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0
        },
        NEXT_PUBLIC_SUPABASE_ANON_KEY: {
          exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          value: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
            `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 
            null,
          length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0
        },
        SUPABASE_SERVICE_ROLE_KEY: {
          exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          value: process.env.SUPABASE_SERVICE_ROLE_KEY ? 
            `${process.env.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...` : 
            null,
          length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
        },
        SESSION_SECRET: {
          exists: !!process.env.SESSION_SECRET,
          length: process.env.SESSION_SECRET?.length || 0
        },
        DATABASE_URL: {
          exists: !!process.env.DATABASE_URL,
          value: process.env.DATABASE_URL ? 
            `postgresql://...${process.env.DATABASE_URL.substring(process.env.DATABASE_URL.length - 20)}` : 
            null
        }
      },
      supabaseConfig: {
        canCreateClient: false,
        canCreateAdminClient: false,
        error: null
      }
    }

    // Test Supabase client creation
    try {
      const { createClient } = await import('@/lib/supabase')
      const client = createClient()
      envCheck.supabaseConfig.canCreateClient = !!client
    } catch (error: any) {
      envCheck.supabaseConfig.error = `Client creation error: ${error.message}`
    }

    // Test Supabase admin client
    try {
      const { supabaseAdmin } = await import('@/lib/supabase')
      envCheck.supabaseConfig.canCreateAdminClient = !!supabaseAdmin
      if (!supabaseAdmin) {
        envCheck.supabaseConfig.error = 'Admin client is null - check SUPABASE_SERVICE_ROLE_KEY'
      }
    } catch (error: any) {
      envCheck.supabaseConfig.error = `Admin client error: ${error.message}`
    }

    return NextResponse.json(envCheck)

  } catch (error: any) {
    return NextResponse.json({
      error: 'Failed to check environment',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}