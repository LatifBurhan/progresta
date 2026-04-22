import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { payslipError } from '@/lib/payslip/errors'
import { isPayslipManager } from '@/lib/payslip/roles'
import { validateUpsertPayslip } from '@/lib/payslip/validators'
import { getPayslipsForAdmin } from '@/lib/payslip/queries'

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

    const data = await getPayslipsForAdmin(bulan, tahun, { departemen_id, divisi_id })
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('GET /api/admin/payslips error:', error)
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return payslipError('UNAUTHORIZED', 'Unauthorized', 401)
    }
    if (!isPayslipManager(session.role)) {
      return payslipError('FORBIDDEN', 'Anda tidak memiliki akses untuk operasi ini', 403)
    }

    const body = await request.json()
    const validation = validateUpsertPayslip(body)
    if (!validation.valid) {
      return payslipError('MISSING_FIELDS', 'Validasi gagal', 400, validation.errors)
    }

    const { data, error } = await supabaseAdmin
      .from('payslips')
      .insert({
        user_id: body.user_id,
        created_by: session.userId,
        periode_bulan: Number(body.periode_bulan),
        periode_tahun: Number(body.periode_tahun),
        gaji_pokok: Number(body.gaji_pokok),
        lembur: Number(body.lembur),
        insentif: Number(body.insentif),
        tunjangan: Number(body.tunjangan),
        bonus_kpi: Number(body.bonus_kpi ?? 0),
        dinas_luar: Number(body.dinas_luar),
        potongan_bpjs: Number(body.potongan_bpjs ?? 0),
        potongan_pajak: Number(body.potongan_pajak ?? 0),
        catatan: body.catatan ?? null,
        status: 'draft',
      })
      .select('*')
      .single()

    if (error) {
      if (error.code === '23505') {
        return payslipError(
          'DUPLICATE_PERIODE',
          'Slip gaji untuk karyawan ini pada periode tersebut sudah ada',
          409
        )
      }
      console.error('POST /api/admin/payslips insert error:', error)
      return NextResponse.json({ success: false, message: 'Terjadi kesalahan server' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/payslips error:', error)
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
