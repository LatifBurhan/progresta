import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { payslipError } from '@/lib/payslip/errors'
import { isPayslipManager } from '@/lib/payslip/roles'
import { getRecapData } from '@/lib/payslip/queries'

export async function GET(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return payslipError('UNAUTHORIZED', 'Unauthorized', 401)
    }
    if (!isPayslipManager(session.role)) {
      return payslipError('FORBIDDEN', 'Anda tidak memiliki akses untuk operasi ini', 403)
    }

    const { searchParams } = new URL(request.url)
    const bulan = parseInt(searchParams.get('bulan') || '0', 10)
    const tahun = parseInt(searchParams.get('tahun') || '0', 10)
    const departemen_id = searchParams.get('departemen_id') || undefined
    const divisi_id = searchParams.get('divisi_id') || undefined

    if (!bulan || bulan < 1 || bulan > 12) {
      return payslipError('INVALID_PERIODE', 'Parameter bulan tidak valid (1-12)', 400)
    }
    if (!tahun || tahun < 2020) {
      return payslipError('INVALID_PERIODE', 'Parameter tahun tidak valid (>= 2020)', 400)
    }

    const data = await getRecapData(bulan, tahun, { departemen_id, divisi_id })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET /api/admin/payslips/recap error:', error)
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
