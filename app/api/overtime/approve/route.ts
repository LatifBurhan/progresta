import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { overtimeError } from '@/lib/overtime/errors'
import { canApproveOvertime } from '@/lib/overtime/roles'

export async function PUT(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return overtimeError('UNAUTHORIZED', 'Unauthorized', 401)
    }

    if (!canApproveOvertime(session.role)) {
      return overtimeError('FORBIDDEN', 'Hanya GENERAL_AFFAIR yang dapat menyetujui lembur', 403)
    }

    const body = await request.json()
    const { requestId, approved } = body

    if (!requestId || typeof approved !== 'boolean') {
      return overtimeError('MISSING_FIELDS', 'requestId and approved are required', 400)
    }

    const updateData = approved
      ? {
          approval_status: 'approved',
          approved_by: session.userId,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      : {
          approval_status: 'pending',
          approved_by: null,
          approved_at: null,
          updated_at: new Date().toISOString(),
        }

    const { data, error } = await supabaseAdmin
      .from('overtime_requests')
      .update(updateData)
      .eq('id', requestId)
      .select('id, approval_status')
      .single()

    if (error) {
      console.error('Approve error:', error)
      return NextResponse.json(
        { success: false, message: 'Gagal memperbarui status persetujuan' },
        { status: 500 }
      )
    }

    if (!data) {
      return overtimeError('NOT_FOUND', 'Permintaan lembur tidak ditemukan', 404)
    }

    return NextResponse.json({
      success: true,
      data: {
        requestId: data.id,
        approvalStatus: data.approval_status,
      },
    })
  } catch (error) {
    console.error('Approve endpoint error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
