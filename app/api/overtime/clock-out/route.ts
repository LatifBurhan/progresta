import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { overtimeError } from '@/lib/overtime/errors'
import { getActiveSession } from '@/lib/overtime/queries'
import { uploadProofPhoto } from '@/lib/overtime/upload'
import { calculateDuration } from '@/lib/overtime/duration'

export async function POST(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return overtimeError('UNAUTHORIZED', 'Unauthorized', 401)
    }

    // Get active session
    const activeSession = await getActiveSession(session.userId)
    if (!activeSession) {
      return overtimeError('NO_ACTIVE_SESSION', 'No active overtime session found', 400)
    }

    // Parse multipart form data
    const formData = await request.formData()
    const proofPhoto = formData.get('proofPhoto') as File | null
    const clockOutLatStr = formData.get('clockOutLat') as string | null
    const clockOutLngStr = formData.get('clockOutLng') as string | null

    if (!proofPhoto) {
      return overtimeError('MISSING_FIELDS', 'Proof photo is required', 400)
    }

    // Validate coordinates if present
    let clockOutLat: number | null = null
    let clockOutLng: number | null = null

    if (clockOutLatStr !== null || clockOutLngStr !== null) {
      // Both must be present or both null
      if (clockOutLatStr === null || clockOutLngStr === null) {
        return overtimeError('INVALID_COORDINATES', 'Both latitude and longitude must be provided together', 400)
      }

      // Parse coordinates
      clockOutLat = parseFloat(clockOutLatStr)
      clockOutLng = parseFloat(clockOutLngStr)

      // Validate numeric values
      if (isNaN(clockOutLat) || isNaN(clockOutLng)) {
        return overtimeError('INVALID_COORDINATES', 'Coordinates must be valid numbers', 400)
      }

      // Validate coordinate ranges
      if (clockOutLat < -90 || clockOutLat > 90) {
        return overtimeError('INVALID_COORDINATES', 'Latitude must be between -90 and 90', 400)
      }

      if (clockOutLng < -180 || clockOutLng > 180) {
        return overtimeError('INVALID_COORDINATES', 'Longitude must be between -180 and 180', 400)
      }
    }

    // Upload proof photo (throws on invalid type or size)
    let uploadResult: { url: string; fileName: string }
    try {
      uploadResult = await uploadProofPhoto(proofPhoto, session.userId)
    } catch (err: any) {
      if (err.message === 'INVALID_FILE') {
        return overtimeError('INVALID_FILE', 'File must be an image (jpeg, png, webp, gif)', 400)
      }
      if (err.message === 'FILE_TOO_LARGE') {
        return overtimeError('FILE_TOO_LARGE', 'File size must not exceed 10MB', 400)
      }
      throw err
    }

    const endTime = new Date()
    const startTime = new Date(activeSession.start_time)
    const durationStr = calculateDuration(startTime, endTime)

    // Calculate PostgreSQL interval from ms
    const diffMs = endTime.getTime() - startTime.getTime()
    const totalSeconds = Math.floor(diffMs / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const pgInterval = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

    // Update session to completed
    const { error: sessionError } = await supabaseAdmin
      .from('overtime_sessions')
      .update({
        end_time: endTime.toISOString(),
        status: 'completed',
        clock_out_lat: clockOutLat,
        clock_out_lng: clockOutLng,
        updated_at: endTime.toISOString(),
      })
      .eq('id', activeSession.id)

    if (sessionError) {
      console.error('Session update error:', sessionError)
      return NextResponse.json(
        { success: false, message: 'Gagal mengakhiri sesi lembur' },
        { status: 500 }
      )
    }

    // Create overtime request
    const { data: requestData, error: requestError } = await supabaseAdmin
      .from('overtime_requests')
      .insert({
        session_id: activeSession.id,
        user_id: session.userId,
        location: activeSession.location,
        project_leader: activeSession.project_leader,
        purpose: activeSession.purpose,
        duration: pgInterval,
        start_photo_url: activeSession.start_photo_url,
        proof_photo_url: uploadResult.url,
        approval_status: 'pending',
      })
      .select('id')
      .single()

    if (requestError) {
      console.error('Request insert error:', requestError)
      return NextResponse.json(
        { success: false, message: 'Gagal membuat permintaan lembur' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        requestId: requestData.id,
        duration: durationStr,
        proofPhotoUrl: uploadResult.url,
      },
    })
  } catch (error) {
    console.error('Clock-out error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
