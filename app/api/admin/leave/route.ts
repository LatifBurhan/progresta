import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

const ALLOWED_ROLES = ['GENERAL_AFFAIR', 'CEO', 'ADMIN']

// GET /api/admin/leave?tahun=...              → semua karyawan (untuk tabel)
// GET /api/admin/leave?user_id=...&tahun=...  → satu karyawan (untuk modal)
export async function GET(req: NextRequest) {
  const session = await verifySession()
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const user_id = searchParams.get('user_id')
  const tahun = searchParams.get('tahun')

  if (!tahun) {
    return NextResponse.json({ success: false, message: 'tahun wajib diisi' }, { status: 400 })
  }

  // Satu karyawan
  if (user_id) {
    const { data, error } = await supabaseAdmin
      .from('employee_leave')
      .select('*')
      .eq('user_id', user_id)
      .eq('tahun', Number(tahun))
      .maybeSingle()

    if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  }

  // Semua karyawan untuk tahun tersebut
  const { data, error } = await supabaseAdmin
    .from('employee_leave')
    .select('*')
    .eq('tahun', Number(tahun))

  if (error) return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  return NextResponse.json({ success: true, data })
}

// POST /api/admin/leave — upsert
export async function POST(req: NextRequest) {
  const session = await verifySession()
  if (!session || !ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { user_id, tahun, jatah_cuti = 12, cuti_terpakai, jumlah_sakit, jumlah_izin, jumlah_alpha, catatan } = body

  if (!user_id || !tahun) {
    return NextResponse.json({ success: false, message: 'user_id dan tahun wajib diisi' }, { status: 400 })
  }

  // Hitung sisa cuti (tidak perlu dikirim karena GENERATED column)
  const cutiTerpakaiValue = cuti_terpakai ?? 0

  const { data, error } = await supabaseAdmin
    .from('employee_leave')
    .upsert(
      {
        user_id,
        tahun,
        jatah_cuti,
        cuti_terpakai: cutiTerpakaiValue,
        jumlah_sakit: jumlah_sakit ?? 0,
        jumlah_izin: jumlah_izin ?? 0,
        jumlah_alpha: jumlah_alpha ?? 0,
        catatan: catatan || null,
        created_by: session.userId,
      },
      { onConflict: 'user_id,tahun' }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data })
}
