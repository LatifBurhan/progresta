import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { payslipError } from '@/lib/payslip/errors'
import { isPayslipManager } from '@/lib/payslip/roles'
import { validateUpsertPayslip } from '@/lib/payslip/validators'
import { getPayslipById } from '@/lib/payslip/queries'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession()
    if (!session) {
      return payslipError('UNAUTHORIZED', 'Unauthorized', 401)
    }
    if (!isPayslipManager(session.role)) {
      return payslipError('FORBIDDEN', 'Anda tidak memiliki akses untuk operasi ini', 403)
    }

    const { id } = await params
    const existing = await getPayslipById(id)
    if (!existing) {
      return payslipError('NOT_FOUND', 'Slip gaji tidak ditemukan', 404)
    }

    if (existing.status === 'acknowledged') {
      return payslipError(
        'ACKNOWLEDGED_IMMUTABLE',
        'Slip gaji yang sudah dikonfirmasi tidak dapat diubah statusnya',
        400
      )
    }

    const body = await request.json()
    const validation = validateUpsertPayslip({ ...body, user_id: existing.user_id })
    if (!validation.valid) {
      return payslipError('MISSING_FIELDS', 'Validasi gagal', 400, validation.errors)
    }

    const { data, error } = await supabaseAdmin
      .from('payslips')
      .update({
        gaji_pokok: Number(body.gaji_pokok),
        lembur: Number(body.lembur),
        insentif: Number(body.insentif),
        tunjangan: Number(body.tunjangan),
        dinas_luar: Number(body.dinas_luar),
        potongan_bpjs: Number(body.potongan_bpjs ?? 0),
        potongan_pajak: Number(body.potongan_pajak ?? 0),
        catatan: body.catatan ?? null,
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('PUT /api/admin/payslips/[id] error:', error)
      return NextResponse.json({ success: false, message: 'Terjadi kesalahan server' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('PUT /api/admin/payslips/[id] error:', error)
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
