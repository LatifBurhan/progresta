import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { payslipError } from '@/lib/payslip/errors'
import { isPayslipManager } from '@/lib/payslip/roles'
import { validatePublishRequest } from '@/lib/payslip/validators'
import { getAdminDepartment } from '@/lib/payslip/department'

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
    const validation = validatePublishRequest(body)
    if (!validation.valid) {
      return payslipError('INVALID_REQUEST', 'Validasi gagal', 400, validation.errors)
    }

    const now = new Date().toISOString()
    let published_count = 0

    // Get admin's department for filtering
    // Unrestricted roles (GENERAL_AFFAIR, CEO, ADMIN) can publish all departments
    const adminDepartmentId = await getAdminDepartment(session.userId, session.role)
    let allowedUserIds: string[] | null = null

    if (adminDepartmentId) {
      // Get all user IDs in admin's department
      const { data: userDepts } = await supabaseAdmin
        .from('user_departments')
        .select('user_id')
        .eq('department_id', adminDepartmentId)
      
      allowedUserIds = (userDepts ?? []).map((d: any) => d.user_id)
      if (allowedUserIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: { published_count: 0 },
          message: 'Tidak ada slip gaji yang dapat diterbitkan',
        })
      }
    }

    if (Array.isArray(body.payslip_ids) && body.payslip_ids.length > 0) {
      // Publish individual
      let query = supabaseAdmin
        .from('payslips')
        .update({ status: 'published', published_at: now })
        .in('id', body.payslip_ids)
        .eq('status', 'draft')

      if (allowedUserIds) {
        query = query.in('user_id', allowedUserIds)
      }

      const { data, error } = await query.select('id')

      if (error) {
        console.error('Publish individual error:', error)
        return NextResponse.json({ success: false, message: 'Terjadi kesalahan server' }, { status: 500 })
      }
      published_count = (data ?? []).length
    } else {
      // Bulk publish per periode
      const bulan = Number(body.periode_bulan)
      const tahun = Number(body.periode_tahun)

      let query = supabaseAdmin
        .from('payslips')
        .update({ status: 'published', published_at: now })
        .eq('periode_bulan', bulan)
        .eq('periode_tahun', tahun)
        .eq('status', 'draft')

      if (allowedUserIds) {
        query = query.in('user_id', allowedUserIds)
      }

      const { data, error } = await query.select('id')

      if (error) {
        console.error('Bulk publish error:', error)
        return NextResponse.json({ success: false, message: 'Terjadi kesalahan server' }, { status: 500 })
      }
      published_count = (data ?? []).length
    }

    return NextResponse.json({
      success: true,
      data: { published_count },
      message: `Berhasil menerbitkan ${published_count} slip gaji`,
    })
  } catch (error) {
    console.error('POST /api/admin/payslips/publish error:', error)
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
