import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { payslipError } from '@/lib/payslip/errors'
import { isPayslipManager } from '@/lib/payslip/roles'
import { validateUpsertPayslip } from '@/lib/payslip/validators'
import { getPayslipById } from '@/lib/payslip/queries'
import { getAdminDepartment, validateUsersDepartment } from '@/lib/payslip/department'
import { sendNotification, NotificationTemplates } from '@/lib/notifications'

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

    // Validate department access - admin can only update payslips for their department
    // UNLESS they have unrestricted role (GENERAL_AFFAIR, CEO, ADMIN)
    const adminDepartmentId = await getAdminDepartment(session.userId, session.role)
    if (adminDepartmentId) {
      const validation = await validateUsersDepartment([existing.user_id], adminDepartmentId)
      if (!validation.valid) {
        return payslipError(
          'FORBIDDEN',
          'Anda hanya dapat mengubah slip gaji untuk karyawan di departemen Anda',
          403
        )
      }
    }

    const { data, error } = await supabaseAdmin
      .from('payslips')
      .update({
        gaji_pokok: Number(body.gaji_pokok),
        lembur: Number(body.lembur),
        insentif: Number(body.insentif),
        tunjangan: Number(body.tunjangan),
        bonus_kpi: Number(body.bonus_kpi ?? 0),
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

    // Send notification to user if payslip is published
    if (data && existing.status === 'published') {
      try {
        console.log('=== PAYSLIP UPDATE NOTIFICATION START ===')
        console.log('Updated payslip ID:', id)
        console.log('User ID:', existing.user_id)
        console.log('Periode:', `${existing.periode_bulan}/${existing.periode_tahun}`)

        // Format month name
        const monthNames = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ]
        const monthName = monthNames[existing.periode_bulan - 1] || existing.periode_bulan.toString()
        const monthYear = `${monthName} ${existing.periode_tahun}`

        await sendNotification(
          NotificationTemplates.payslipUpdated(monthYear, existing.user_id)
        )

        console.log('✅ Payslip update notification sent')
        console.log('=== PAYSLIP UPDATE NOTIFICATION END ===')
      } catch (notifError) {
        console.error('❌ Failed to send payslip update notification:', notifError)
        // Don't fail the request if notification fails
      }
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('PUT /api/admin/payslips/[id] error:', error)
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Only ADMIN, CEO, and HRD can delete payslips
    if (!['ADMIN', 'CEO', 'GENERAL_AFFAIR'].includes(session.role)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Hanya ADMIN, CEO, atau HRD yang dapat menghapus slip gaji' 
      }, { status: 403 })
    }

    const { id } = await params

    // Get payslip details before deleting
    const { data: payslip, error: fetchError } = await supabaseAdmin
      .from('payslips')
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !payslip) {
      return NextResponse.json({ 
        success: false, 
        message: 'Slip gaji tidak ditemukan' 
      }, { status: 404 })
    }

    // Validate department access - admin can only delete payslips for their department
    // UNLESS they have unrestricted role (GENERAL_AFFAIR, CEO, ADMIN)
    const adminDepartmentId = await getAdminDepartment(session.userId, session.role)
    if (adminDepartmentId) {
      const validation = await validateUsersDepartment([payslip.user_id], adminDepartmentId)
      if (!validation.valid) {
        return NextResponse.json({ 
          success: false, 
          message: 'Anda hanya dapat menghapus slip gaji untuk karyawan di departemen Anda' 
        }, { status: 403 })
      }
    }

    // Delete the payslip
    const { error: deleteError } = await supabaseAdmin
      .from('payslips')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting payslip:', deleteError)
      return NextResponse.json({ 
        success: false, 
        message: 'Gagal menghapus slip gaji' 
      }, { status: 500 })
    }

    // Send notification to user if payslip was published
    if (payslip.status === 'published') {
      try {
        console.log('=== PAYSLIP DELETE NOTIFICATION START ===')
        console.log('Deleted payslip ID:', id)
        console.log('User ID:', payslip.user_id)
        console.log('Periode:', `${payslip.periode_bulan}/${payslip.periode_tahun}`)

        // Format month name
        const monthNames = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ]
        const monthName = monthNames[payslip.periode_bulan - 1] || payslip.periode_bulan.toString()
        const monthYear = `${monthName} ${payslip.periode_tahun}`

        await sendNotification(
          NotificationTemplates.payslipDeleted(monthYear, payslip.user_id)
        )

        console.log('✅ Payslip delete notification sent')
        console.log('=== PAYSLIP DELETE NOTIFICATION END ===')
      } catch (notifError) {
        console.error('❌ Failed to send payslip delete notification:', notifError)
        // Don't fail the request if notification fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Slip gaji berhasil dihapus',
      data: { id }
    })

  } catch (error) {
    console.error('DELETE /api/admin/payslips/[id] error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Terjadi kesalahan server' 
    }, { status: 500 })
  }
}
