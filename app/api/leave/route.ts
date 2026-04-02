import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/leave?tahun=... — karyawan fetch data cuti milik sendiri
export async function GET(req: NextRequest) {
  const session = await verifySession()
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const tahun = searchParams.get('tahun')

  if (!tahun) {
    return NextResponse.json({ success: false, message: 'tahun wajib diisi' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('employee_leave')
    .select('*')
    .eq('user_id', session.userId)
    .eq('tahun', Number(tahun))
    .maybeSingle()

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}
