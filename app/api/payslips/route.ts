import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { payslipError } from '@/lib/payslip/errors'
import { getPayslipsByUser } from '@/lib/payslip/queries'

export async function GET(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return payslipError('UNAUTHORIZED', 'Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const data = await getPayslipsByUser(session.userId, { limit, offset })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET /api/payslips error:', error)
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
