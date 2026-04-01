import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { payslipError } from '@/lib/payslip/errors'
import { getPayslipById } from '@/lib/payslip/queries'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession()
    if (!session) {
      return payslipError('UNAUTHORIZED', 'Unauthorized', 401)
    }

    const { id } = await params
    const payslip = await getPayslipById(id)

    if (!payslip) {
      return payslipError('NOT_FOUND', 'Slip gaji tidak ditemukan', 404)
    }

    if (payslip.user_id !== session.userId) {
      return payslipError('FORBIDDEN', 'Akses ditolak', 403)
    }

    if (payslip.status !== 'published') {
      return payslipError(
        'ACKNOWLEDGE_NON_PUBLISHED',
        'Hanya slip gaji berstatus published yang dapat dikonfirmasi',
        400
      )
    }

    const now = new Date().toISOString()
    const { data, error } = await supabaseAdmin
      .from('payslips')
      .update({ status: 'acknowledged', acknowledged_at: now })
      .eq('id', id)
      .select('id, status, acknowledged_at')
      .single()

    if (error) {
      console.error('Acknowledge error:', error)
      return NextResponse.json({ success: false, message: 'Terjadi kesalahan server' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: { acknowledged_at: data.acknowledged_at },
    })
  } catch (error) {
    console.error('POST /api/payslips/[id]/acknowledge error:', error)
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
