import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { overtimeError } from '@/lib/overtime/errors'
import { getActiveSession } from '@/lib/overtime/queries'

export async function GET() {
  try {
    const session = await verifySession()
    if (!session) {
      return overtimeError('UNAUTHORIZED', 'Unauthorized', 401)
    }

    const activeSession = await getActiveSession(session.userId)

    return NextResponse.json({
      success: true,
      data: activeSession ?? null,
    })
  } catch (error) {
    console.error('Get active session error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
