import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { overtimeError } from '@/lib/overtime/errors'
import { getAllActiveSessions } from '@/lib/overtime/queries'
import { canApproveOvertime } from '@/lib/overtime/roles'

export async function GET() {
  try {
    const session = await verifySession()
    if (!session || !canApproveOvertime(session.role)) {
      return overtimeError('UNAUTHORIZED', 'Unauthorized', 401)
    }

    const data = await getAllActiveSessions()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Get active sessions error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
