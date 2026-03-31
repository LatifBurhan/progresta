import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST(request: NextRequest) {
  console.log('📸 Profile photo upload started')
  
  try {
    // Verify user session
    const session = await verifySession()
    console.log('Session verified:', session ? 'Yes' : 'No')
    
    if (!session) {
      console.error('❌ No session found')
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('User ID:', session.userId)

    // Get form data
    const formData = await request.formData()
    const photo = formData.get('photo') as File

    if (!photo) {
      console.error('❌ No photo in form data')
      return NextResponse.json(
        { success: false, error: 'No photo provided' },
        { status: 400 }
      )
    }

    console.log('Photo received:', photo.name, photo.type, photo.size, 'bytes')

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if (!validTypes.includes(photo.type)) {
      console.error('❌ Invalid file type:', photo.type)
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPG, JPEG, and PNG are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (photo.size > maxSize) {
      console.error('❌ File too large:', photo.size)
      return NextResponse.json(
        { success: false, error: 'File size exceeds 5MB limit' },
        { status: 400 }
      )
    }

    console.log('✅ Validation passed')

    // Check environment variables
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Missing Supabase credentials')
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    console.log('Supabase URL:', supabaseUrl)

    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    console.log('✅ Supabase client created')

    // Generate unique filename
    const fileExt = photo.name.split('.').pop()
    const fileName = `${session.userId}-${Date.now()}.${fileExt}`
    const filePath = `profile-photos/${fileName}`

    console.log('File path:', filePath)

    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await photo.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log('✅ File converted to buffer')

    // Get user's current photo URL to delete old photo
    const { data: userData } = await supabase
      .from('users')
      .select('fotoProfil')
      .eq('id', session.userId)
      .single()

    console.log('Current photo URL:', userData?.fotoProfil || 'none')

    // Upload new photo to Supabase Storage
    console.log('📤 Uploading to storage...')
    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, buffer, {
        contentType: photo.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      console.error('❌ Upload error:', uploadError)
      return NextResponse.json(
        { success: false, error: `Failed to upload photo: ${uploadError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Upload successful')

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath)

    console.log('Public URL:', publicUrl)

    // Update user's fotoProfil in database
    console.log('💾 Updating database...')
    const { error: updateError } = await supabase
      .from('users')
      .update({ fotoProfil: publicUrl })
      .eq('id', session.userId)

    if (updateError) {
      console.error('❌ Database update error:', updateError)
      // Try to delete uploaded file
      await supabase.storage.from('profile-photos').remove([filePath])
      return NextResponse.json(
        { success: false, error: `Failed to update profile: ${updateError.message}` },
        { status: 500 }
      )
    }

    console.log('✅ Database updated')

    // Delete old photo if exists
    if (userData?.fotoProfil) {
      try {
        const oldFileName = userData.fotoProfil.split('/profile-photos/')[1]
        if (oldFileName) {
          console.log('🗑️ Deleting old photo:', oldFileName)
          await supabase.storage
            .from('profile-photos')
            .remove([oldFileName])
          console.log('✅ Old photo deleted')
        }
      } catch (err) {
        console.error('⚠️ Failed to delete old photo:', err)
        // Don't fail the request if old photo deletion fails
      }
    }

    console.log('🎉 Upload complete!')
    return NextResponse.json({
      success: true,
      photoUrl: publicUrl,
      message: 'Photo uploaded successfully'
    })

  } catch (error: any) {
    console.error('❌ Profile photo upload error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
