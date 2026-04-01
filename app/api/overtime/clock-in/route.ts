import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { overtimeError } from '@/lib/overtime/errors'
import { getActiveSession } from '@/lib/overtime/queries'

export async function POST(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return overtimeError('UNAUTHORIZED', 'Unauthorized', 401)
    }

    const body = await request.json()
    const { location, projectLeader, purpose } = body

    if (
      !location || typeof location !== 'string' || location.trim() === '' ||
      !projectLeader || typeof projectLeader !== 'string' || projectLeader.trim() === '' ||
      !purpose || typeof purpose !== 'string' || purpose.trim() === ''
    ) {
      return overtimeError('MISSING_FIELDS', 'location, projectLeader, and purpose are required', 400)
    }

    // Check for existing active session
    const activeSession = await getActiveSession(session.userId)
    if (activeSession) {
      return overtimeError('ACTIVE_SESSION_EXISTS', 'You already have an active overtime session', 400)
    }

    const { data, error } = await supabaseAdmin
      .from('overtime_sessions')
      .insert({
        user_id: session.userId,
        location: location.trim(),
        project_leader: projectLeader.trim(),
        purpose: purpose.trim(),
        status: 'active',
        start_time: new Date().toISOString(),
      })
      .select('id, start_time')
      .single()

    if (error) {
      console.error('Clock-in insert error:', error)
      return NextResponse.json(
        { success: false, message: 'Gagal memulai sesi lembur' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId: data.id,
        startTime: data.start_time,
      },
    })
  } catch (error) {
    console.error('Clock-in error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
