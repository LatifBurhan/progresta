import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { payslipError } from '@/lib/payslip/errors'
import { isPayslipManager } from '@/lib/payslip/roles'
import { validateBulkGenerate } from '@/lib/payslip/validators'
import { getAdminDepartment, validateUsersDepartment } from '@/lib/payslip/department'

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
    const validation = validateBulkGenerate(body)
    if (!validation.valid) {
      return payslipError('MISSING_FIELDS', 'Validasi gagal', 400, validation.errors)
    }

    const {
      user_ids,
      periode_bulan,
      periode_tahun,
      gaji_pokok,
      lembur,
      insentif,
      tunjangan,
      bonus_kpi = 0,
      dinas_luar,
      potongan_bpjs = 0,
      potongan_pajak = 0,
      catatan = null,
      overwrite = false,
    } = body

    const bulan = Number(periode_bulan)
    const tahun = Number(periode_tahun)

    // Validate department access - admin can only create payslips for their department
    // UNLESS they have unrestricted role (GENERAL_AFFAIR, CEO, ADMIN)
    const adminDepartmentId = await getAdminDepartment(session.userId, session.role)
    if (adminDepartmentId) {
      const validation = await validateUsersDepartment(user_ids, adminDepartmentId)
      if (!validation.valid) {
        return payslipError(
          'FORBIDDEN',
          `Anda hanya dapat membuat slip gaji untuk karyawan di departemen Anda. ${validation.invalidUsers.length} karyawan tidak valid.`,
          403
        )
      }
    }

    // Cek slip yang sudah ada
    const { data: existing } = await supabaseAdmin
      .from('payslips')
      .select('id, user_id')
      .eq('periode_bulan', bulan)
      .eq('periode_tahun', tahun)
      .in('user_id', user_ids)

    const existingUserIds = new Set((existing ?? []).map((p: any) => p.user_id))
    const existingIdMap = new Map((existing ?? []).map((p: any) => [p.user_id, p.id]))

    let created = 0
    let skipped = 0
    let overwritten = 0

    const basePayload = {
      created_by: session.userId,
      periode_bulan: bulan,
      periode_tahun: tahun,
      gaji_pokok: Number(gaji_pokok),
      lembur: Number(lembur),
      insentif: Number(insentif),
      tunjangan: Number(tunjangan),
      bonus_kpi: Number(bonus_kpi),
      dinas_luar: Number(dinas_luar),
      potongan_bpjs: Number(potongan_bpjs),
      potongan_pajak: Number(potongan_pajak),
      catatan,
      status: 'draft',
    }

    for (const userId of user_ids) {
      if (existingUserIds.has(userId)) {
        if (!overwrite) {
          skipped++
          continue
        }
        // Overwrite: update existing
        const existingId = existingIdMap.get(userId)
        const { error } = await supabaseAdmin
          .from('payslips')
          .update({
            gaji_pokok: basePayload.gaji_pokok,
            lembur: basePayload.lembur,
            insentif: basePayload.insentif,
            tunjangan: basePayload.tunjangan,
            bonus_kpi: basePayload.bonus_kpi,
            dinas_luar: basePayload.dinas_luar,
            potongan_bpjs: basePayload.potongan_bpjs,
            potongan_pajak: basePayload.potongan_pajak,
            catatan: basePayload.catatan,
          })
          .eq('id', existingId)
        if (!error) overwritten++
      } else {
        const { error } = await supabaseAdmin
          .from('payslips')
          .insert({ ...basePayload, user_id: userId })
        if (!error) created++
      }
    }

    return NextResponse.json({
      success: true,
      data: { created, skipped, overwritten },
      message: `Berhasil membuat ${created} slip gaji, melewati ${skipped}, menimpa ${overwritten}`,
    })
  } catch (error) {
    console.error('POST /api/admin/payslips/bulk error:', error)
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
