import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({
        success: false,
        error: 'No session found'
      })
    }

    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Database configuration error'
      })
    }

    // Get user from database
    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, role, status')
      .eq('id', session.userId)
      .single()

    return NextResponse.json({
      success: true,
      session: {
        userId: session.userId,
        email: session.email,
        role: session.role,
        name: session.name
      },
      database: dbUser || null,
      dbError: dbError?.message || null,
      match: session.role === dbUser?.role
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    })
  }
}
