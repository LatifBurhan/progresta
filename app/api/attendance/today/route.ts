import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session.userId

    // Only allow users to see their own attendance or admin/PM/CEO to see others
    if (userId !== session.userId && !['ADMIN', 'PM', 'CEO', 'HRD'].includes(session.role)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      )
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: 'Database configuration error' },
        { status: 500 }
      )
    }

    // Get today's date in Jakarta timezone
    const now = new Date()
    const jakartaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Jakarta"}))
    const today = new Date(jakartaTime.getFullYear(), jakartaTime.getMonth(), jakartaTime.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get all reports for today
    const { data: reports, error } = await supabaseAdmin
      .from('project_reports')
      .select('report_time, total_hours')
      .eq('user_id', userId)
      .gte('report_date', today.toISOString())
      .lt('report_date', tomorrow.toISOString())
      .order('report_time', { ascending: true })

    if (error) {
      console.error('Error fetching reports:', error)
      return NextResponse.json(
        { success: false, message: 'Gagal mengambil data laporan' },
        { status: 500 }
      )
    }

    let attendance = {
      clockIn: null as string | null,
      clockOut: null as string | null,
      workDuration: 0, // in hours
      totalHours: 0,
      isOvertime: false,
      reportCount: reports?.length || 0,
      lastUpdated: new Date().toISOString()
    }

    if (reports && reports.length > 0) {
      // Clock in = first report time
      attendance.clockIn = reports[0].report_time
      
      // Clock out = last report time
      attendance.clockOut = reports[reports.length - 1].report_time
      
      // Work duration = time between first and last report
      const firstReport = new Date(reports[0].report_time)
      const lastReport = new Date(reports[reports.length - 1].report_time)
      const durationMs = lastReport.getTime() - firstReport.getTime()
      attendance.workDuration = durationMs / (1000 * 60 * 60) // Convert to hours
      
      // Total hours = sum of all report hours
      attendance.totalHours = reports.reduce((sum: number, report: any) => sum + (report.total_hours || 0), 0)
      
      // Check if overtime (last report after 16:00 WIB)
      const lastReportTime = new Date(reports[reports.length - 1].report_time)
      const lastReportHour = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Jakarta',
        hour: 'numeric',
        hour12: false
      }).format(lastReportTime)
      
      attendance.isOvertime = parseInt(lastReportHour) >= 16
    }

    return NextResponse.json({
      success: true,
      attendance
    })

  } catch (error) {
    console.error('Get attendance error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}