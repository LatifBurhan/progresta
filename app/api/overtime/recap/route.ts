import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { overtimeError } from '@/lib/overtime/errors'
import { canApproveOvertime } from '@/lib/overtime/roles'

export async function GET() {
  try {
    const session = await verifySession()
    if (!session) {
      return overtimeError('UNAUTHORIZED', 'Unauthorized', 401)
    }

    if (!canApproveOvertime(session.role)) {
      return overtimeError('FORBIDDEN', 'Hanya GENERAL_AFFAIR yang dapat mengakses rekap lembur', 403)
    }

    // Get today's date range in Jakarta timezone
    const now = new Date()
    const jakartaOffset = 7 * 60 // UTC+7 in minutes
    const jakartaNow = new Date(now.getTime() + jakartaOffset * 60 * 1000)
    const todayStr = jakartaNow.toISOString().split('T')[0] // YYYY-MM-DD

    // Start of today in Jakarta = todayStr 00:00:00 UTC+7 = todayStr - 7h UTC
    const startOfDay = new Date(`${todayStr}T00:00:00+07:00`).toISOString()
    const endOfDay = new Date(`${todayStr}T23:59:59+07:00`).toISOString()

    const { data, error } = await supabaseAdmin
      .from('overtime_requests')
      .select('id, duration, approval_status, created_at, users(email, name)')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Recap query error:', error)
      return NextResponse.json({ success: false, message: 'Terjadi kesalahan server' }, { status: 500 })
    }

    const recap = (data || []).map((r: any) => ({
      id: r.id,
      submitter: r.users?.name || r.users?.email || 'Unknown',
      duration: r.duration,
      approvalStatus: r.approval_status,
      createdAt: r.created_at,
    }))

    return NextResponse.json({ success: true, data: recap })
  } catch (error) {
    console.error('Recap endpoint error:', error)
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
