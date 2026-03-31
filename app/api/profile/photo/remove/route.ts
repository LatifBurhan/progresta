import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function DELETE(request: NextRequest) {
  try {
    // Verify user session
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create Supabase admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Get user's current photo URL
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('fotoProfil')
      .eq('id', session.userId)
      .single()

    if (fetchError || !userData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Update database to remove photo URL
    const { error: updateError } = await supabase
      .from('users')
      .update({ fotoProfil: null })
      .eq('id', session.userId)

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json(
        { success: false, error: 'Failed to update profile' },
        { status: 500 }
      )
    }

    // Delete photo from storage if exists
    if (userData.fotoProfil) {
      try {
        const fileName = userData.fotoProfil.split('/profile-photos/')[1]
        if (fileName) {
          await supabase.storage
            .from('profile-photos')
            .remove([`profile-photos/${fileName}`])
        }
      } catch (err) {
        console.error('Failed to delete photo from storage:', err)
        // Don't fail the request if storage deletion fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Photo removed successfully'
    })

  } catch (error: any) {
    console.error('Profile photo removal error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
