import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { overtimeError } from '@/lib/overtime/errors'
import { getOvertimeRequests, getAllOvertimeRequests } from '@/lib/overtime/queries'
import { canApproveOvertime } from '@/lib/overtime/roles'

export async function GET(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return overtimeError('UNAUTHORIZED', 'Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const all = searchParams.get('all') === 'true'
    const dateFrom = searchParams.get('dateFrom') || undefined
    const dateTo = searchParams.get('dateTo') || undefined
    const approvalStatus = searchParams.get('approvalStatus') as 'pending' | 'approved' | undefined
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    if (all && canApproveOvertime(session.role)) {
      const data = await getAllOvertimeRequests({ limit, offset, dateFrom, dateTo, approvalStatus })
      return NextResponse.json({ success: true, data })
    }

    const data = await getOvertimeRequests(session.userId, { limit, offset, dateFrom, dateTo })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Get requests error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
