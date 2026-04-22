import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { overtimeError } from '@/lib/overtime/errors'
import { canApproveOvertime } from '@/lib/overtime/roles'

export async function DELETE(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return overtimeError('UNAUTHORIZED', 'Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get('requestId')

    if (!requestId) {
      return overtimeError('INVALID_INPUT', 'Request ID is required', 400)
    }

    // Get overtime request details
    const { data: overtimeRequest, error: fetchError } = await supabaseAdmin
      .from('overtime_requests')
      .select('*, overtime_sessions(*)')
      .eq('id', requestId)
      .single()

    if (fetchError || !overtimeRequest) {
      return overtimeError('NOT_FOUND', 'Overtime request not found', 404)
    }

    // Check permission: Admin/CEO/HRD can delete any, user can only delete their own
    const canDelete = canApproveOvertime(session.role) || overtimeRequest.user_id === session.userId

    if (!canDelete) {
      return overtimeError('FORBIDDEN', 'Anda tidak memiliki izin untuk menghapus lembur ini', 403)
    }

    // Delete photos from storage if exists
    const photosToDelete: string[] = []
    
    if (overtimeRequest.start_photo_url) {
      const fileName = overtimeRequest.start_photo_url.split('/').pop()
      if (fileName) photosToDelete.push(fileName)
    }
    
    if (overtimeRequest.proof_photo_url) {
      const fileName = overtimeRequest.proof_photo_url.split('/').pop()
      if (fileName) photosToDelete.push(fileName)
    }

    // Delete photos from storage
    if (photosToDelete.length > 0) {
      await supabaseAdmin.storage
        .from('overtime-proofs')
        .remove(photosToDelete)
    }

    // Delete overtime_requests (will cascade to related data if configured)
    const { error: deleteRequestError } = await supabaseAdmin
      .from('overtime_requests')
      .delete()
      .eq('id', requestId)

    if (deleteRequestError) {
      console.error('Error deleting overtime request:', deleteRequestError)
      return overtimeError('DATABASE_ERROR', 'Gagal menghapus pengajuan lembur', 500)
    }

    // Delete overtime_sessions if exists
    if (overtimeRequest.session_id) {
      const { error: deleteSessionError } = await supabaseAdmin
        .from('overtime_sessions')
        .delete()
        .eq('id', overtimeRequest.session_id)

      if (deleteSessionError) {
        console.error('Error deleting overtime session:', deleteSessionError)
        // Don't fail the request if session deletion fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Lembur berhasil dihapus'
    })

  } catch (error) {
    console.error('Delete overtime error:', error)
    return overtimeError('INTERNAL_ERROR', 'Internal server error', 500)
  }
}
