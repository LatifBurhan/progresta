import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { overtimeError } from '@/lib/overtime/errors'
import { getActiveSession } from '@/lib/overtime/queries'
import { uploadProofPhoto } from '@/lib/overtime/upload'

export async function POST(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return overtimeError('UNAUTHORIZED', 'Unauthorized', 401)
    }

    // Parse multipart form data
    const formData = await request.formData()
    const location = formData.get('location') as string
    const projectLeader = formData.get('projectLeader') as string
    const purpose = formData.get('purpose') as string
    const startPhoto = formData.get('startPhoto') as File | null
    const clockInLatStr = formData.get('clockInLat') as string | null
    const clockInLngStr = formData.get('clockInLng') as string | null

    if (
      !location || typeof location !== 'string' || location.trim() === '' ||
      !projectLeader || typeof projectLeader !== 'string' || projectLeader.trim() === '' ||
      !purpose || typeof purpose !== 'string' || purpose.trim() === ''
    ) {
      return overtimeError('MISSING_FIELDS', 'location, projectLeader, and purpose are required', 400)
    }

    // Validate coordinates if present
    let clockInLat: number | null = null
    let clockInLng: number | null = null

    if (clockInLatStr !== null || clockInLngStr !== null) {
      // Both must be present or both null
      if (clockInLatStr === null || clockInLngStr === null) {
        return overtimeError('INVALID_COORDINATES', 'Both latitude and longitude must be provided together', 400)
      }

      // Parse coordinates
      clockInLat = parseFloat(clockInLatStr)
      clockInLng = parseFloat(clockInLngStr)

      // Validate numeric values
      if (isNaN(clockInLat) || isNaN(clockInLng)) {
        return overtimeError('INVALID_COORDINATES', 'Coordinates must be valid numbers', 400)
      }

      // Validate coordinate ranges
      if (clockInLat < -90 || clockInLat > 90) {
        return overtimeError('INVALID_COORDINATES', 'Latitude must be between -90 and 90', 400)
      }

      if (clockInLng < -180 || clockInLng > 180) {
        return overtimeError('INVALID_COORDINATES', 'Longitude must be between -180 and 180', 400)
      }
    }

    if (!startPhoto) {
      return overtimeError('MISSING_FIELDS', 'Start photo is required', 400)
    }

    // Check for existing active session
    const activeSession = await getActiveSession(session.userId)
    if (activeSession) {
      return overtimeError('ACTIVE_SESSION_EXISTS', 'You already have an active overtime session', 400)
    }

    // Upload start photo
    let uploadResult: { url: string; fileName: string }
    try {
      uploadResult = await uploadProofPhoto(startPhoto, session.userId)
    } catch (err: any) {
      if (err.message === 'INVALID_FILE') {
        return overtimeError('INVALID_FILE', 'File must be an image (jpeg, png, webp, gif)', 400)
      }
      if (err.message === 'FILE_TOO_LARGE') {
        return overtimeError('FILE_TOO_LARGE', 'File size must not exceed 10MB', 400)
      }
      throw err
    }

    const { data, error } = await supabaseAdmin
      .from('overtime_sessions')
      .insert({
        user_id: session.userId,
        location: location.trim(),
        project_leader: projectLeader.trim(),
        purpose: purpose.trim(),
        status: 'active',
        start_time: new Date().toISOString(),
        start_photo_url: uploadResult.url,
        clock_in_lat: clockInLat,
        clock_in_lng: clockInLng,
      })
      .select('id, start_time')
      .single()

    if (error) {
      console.error('Clock-in insert error:', error)
      return NextResponse.json(
        { success: false, message: 'Gagal memulai sesi lembur' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId: data.id,
        startTime: data.start_time,
      },
    })
  } catch (error) {
    console.error('Clock-in error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
