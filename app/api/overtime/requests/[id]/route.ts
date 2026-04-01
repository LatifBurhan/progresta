import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { overtimeError } from '@/lib/overtime/errors'
import { uploadProofPhoto } from '@/lib/overtime/upload'

const EDIT_WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifySession()
    if (!session) {
      return overtimeError('UNAUTHORIZED', 'Unauthorized', 401)
    }

    const { id } = params

    // Fetch the overtime request
    const { data: overtimeRequest, error: fetchError } = await supabaseAdmin
      .from('overtime_requests')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (fetchError) {
      console.error('Fetch request error:', fetchError)
      return NextResponse.json({ success: false, message: 'Terjadi kesalahan server' }, { status: 500 })
    }

    if (!overtimeRequest) {
      return overtimeError('NOT_FOUND', 'Permintaan lembur tidak ditemukan', 404)
    }

    // Authorization: only the original submitter
    if (overtimeRequest.user_id !== session.userId) {
      return overtimeError('FORBIDDEN', 'Anda tidak memiliki izin untuk mengedit permintaan ini', 403)
    }

    // Check approval status
    if (overtimeRequest.approval_status === 'approved') {
      return overtimeError('ALREADY_APPROVED', 'Permintaan yang sudah disetujui tidak dapat diedit', 403)
    }

    // Check 24-hour edit window
    const createdAt = new Date(overtimeRequest.created_at).getTime()
    if (Date.now() - createdAt > EDIT_WINDOW_MS) {
      return overtimeError('EDIT_WINDOW_EXPIRED', 'Waktu edit 24 jam telah habis', 403)
    }

    // Parse body - support both JSON and FormData
    const contentType = request.headers.get('content-type') || ''
    let location: string
    let projectLeader: string
    let purpose: string
    let proofPhotoUrl: string = overtimeRequest.proof_photo_url

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      location = (formData.get('location') as string) || ''
      projectLeader = (formData.get('projectLeader') as string) || ''
      purpose = (formData.get('purpose') as string) || ''

      const proofPhoto = formData.get('proofPhoto') as File | null
      if (proofPhoto) {
        try {
          const uploadResult = await uploadProofPhoto(proofPhoto, session.userId)
          proofPhotoUrl = uploadResult.url
        } catch (err: any) {
          if (err.message === 'INVALID_FILE') {
            return overtimeError('INVALID_FILE', 'File harus berupa gambar', 400)
          }
          if (err.message === 'FILE_TOO_LARGE') {
            return overtimeError('FILE_TOO_LARGE', 'Ukuran file maksimal 10MB', 400)
          }
          throw err
        }
      }
    } else {
      const body = await request.json()
      location = body.location || ''
      projectLeader = body.projectLeader || ''
      purpose = body.purpose || ''
      if (body.proofPhotoUrl) proofPhotoUrl = body.proofPhotoUrl
    }

    // Validate required fields
    const validationErrors: Record<string, string> = {}
    if (!location.trim()) validationErrors.location = 'Lokasi wajib diisi'
    if (!projectLeader.trim()) validationErrors.projectLeader = 'Nama project leader wajib diisi'
    if (!purpose.trim()) validationErrors.purpose = 'Tujuan wajib diisi'

    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json(
        { success: false, message: 'Validasi gagal', errors: validationErrors },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('overtime_requests')
      .update({
        location: location.trim(),
        project_leader: projectLeader.trim(),
        purpose: purpose.trim(),
        proof_photo_url: proofPhotoUrl,
        updated_at: now,
      })
      .eq('id', id)
      .select('id, location, project_leader, purpose, proof_photo_url, updated_at')
      .single()

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json({ success: false, message: 'Gagal memperbarui permintaan lembur' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        location: updated.location,
        projectLeader: updated.project_leader,
        purpose: updated.purpose,
        proofPhotoUrl: updated.proof_photo_url,
        updatedAt: updated.updated_at,
      },
    })
  } catch (error) {
    console.error('Edit request error:', error)
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
