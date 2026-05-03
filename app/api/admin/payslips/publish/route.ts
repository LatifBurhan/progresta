import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { payslipError } from '@/lib/payslip/errors'
import { isPayslipManager } from '@/lib/payslip/roles'
import { validatePublishRequest } from '@/lib/payslip/validators'
import { getAdminDepartment } from '@/lib/payslip/department'
import { sendNotification, NotificationTemplates } from '@/lib/notifications'

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
    let publishedUserIds: string[] = []
    let periodeBulan = 0
    let periodeTahun = 0

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

      const { data, error } = await query.select('id, user_id, periode_bulan, periode_tahun')

      if (error) {
        console.error('Publish individual error:', error)
        return NextResponse.json({ success: false, message: 'Terjadi kesalahan server' }, { status: 500 })
      }
      published_count = (data ?? []).length
      publishedUserIds = [...new Set((data ?? []).map((p: any) => p.user_id))]
      
      // Get periode from first payslip
      if (data && data.length > 0) {
        periodeBulan = data[0].periode_bulan
        periodeTahun = data[0].periode_tahun
      }
    } else {
      // Bulk publish per periode
      const bulan = Number(body.periode_bulan)
      const tahun = Number(body.periode_tahun)
      periodeBulan = bulan
      periodeTahun = tahun

      let query = supabaseAdmin
        .from('payslips')
        .update({ status: 'published', published_at: now })
        .eq('periode_bulan', bulan)
        .eq('periode_tahun', tahun)
        .eq('status', 'draft')

      if (allowedUserIds) {
        query = query.in('user_id', allowedUserIds)
      }

      const { data, error } = await query.select('id, user_id')

      if (error) {
        console.error('Bulk publish error:', error)
        return NextResponse.json({ success: false, message: 'Terjadi kesalahan server' }, { status: 500 })
      }
      published_count = (data ?? []).length
      publishedUserIds = [...new Set((data ?? []).map((p: any) => p.user_id))]
    }

    // Send notifications to users who received payslips
    if (publishedUserIds.length > 0 && periodeBulan > 0 && periodeTahun > 0) {
      try {
        console.log('=== PAYSLIP NOTIFICATION START ===')
        console.log('Published payslips:', published_count)
        console.log('Users to notify:', publishedUserIds.length)
        console.log('User IDs:', publishedUserIds)
        console.log('Periode:', `${periodeBulan}/${periodeTahun}`)

        // Format month name
        const monthNames = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ]
        const monthName = monthNames[periodeBulan - 1] || periodeBulan.toString()
        const monthYear = `${monthName} ${periodeTahun}`

        console.log('Month/Year formatted:', monthYear)

        // Send notification to each user
        let successCount = 0
        let failCount = 0
        
        for (const userId of publishedUserIds) {
          try {
            console.log(`📧 Sending notification to user: ${userId}`)
            await sendNotification(
              NotificationTemplates.payslipAvailable(monthYear, userId)
            )
            successCount++
            console.log(`✅ Notification sent to user: ${userId}`)
          } catch (userNotifError) {
            failCount++
            console.error(`❌ Failed to send notification to user ${userId}:`, userNotifError)
          }
        }

        console.log(`✅ Payslip notifications: ${successCount} success, ${failCount} failed`)
        console.log('=== PAYSLIP NOTIFICATION END ===')
      } catch (notifError) {
        console.error('❌ Failed to send payslip notifications:', notifError)
        console.error('Error stack:', notifError)
        // Don't fail the request if notification fails
      }
    } else {
      console.log('⚠️ Skipping notifications:')
      console.log('  - publishedUserIds.length:', publishedUserIds.length)
      console.log('  - periodeBulan:', periodeBulan)
      console.log('  - periodeTahun:', periodeTahun)
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
