import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Only PM, GENERAL_AFFAIR, CEO, ADMIN can perform user actions
    if (!['PM', 'GENERAL_AFFAIR', 'CEO', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 })
    }

    const { userId, action } = await request.json()

    if (!userId || !action) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields: userId, action' 
      }, { status: 400 })
    }

    // Validate action
    const validActions = ['activate', 'deactivate', 'delete']
    if (!validActions.includes(action)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid action. Must be: activate, deactivate, or delete' 
      }, { status: 400 })
    }

    // Check if user exists
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 })
    }

    // Prevent self-action (users can't deactivate/delete themselves)
    if (user.id === session.userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'You cannot perform this action on your own account' 
      }, { status: 400 })
    }

    // Only ADMIN and GENERAL_AFFAIR can delete users
    if (action === 'delete' && !['ADMIN', 'GENERAL_AFFAIR'].includes(session.role)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Only ADMIN and GENERAL_AFFAIR can delete users' 
      }, { status: 403 })
    }

    let result

    switch (action) {
      case 'activate':
        if (user.status === 'ACTIVE') {
          return NextResponse.json({ 
            success: false, 
            message: 'User is already active' 
          }, { status: 400 })
        }
        
        const { data: activatedUser, error: activateError } = await supabaseAdmin
          .from('users')
          .update({ status: 'ACTIVE' })
          .eq('id', userId)
          .select()
          .single()

        if (activateError) {
          console.error('Activate error:', activateError)
          return NextResponse.json({ 
            success: false, 
            message: 'Failed to activate user' 
          }, { status: 500 })
        }

        result = activatedUser
        break

      case 'deactivate':
        if (user.status === 'INACTIVE') {
          return NextResponse.json({ 
            success: false, 
            message: 'User is already inactive' 
          }, { status: 400 })
        }
        
        const { data: deactivatedUser, error: deactivateError } = await supabaseAdmin
          .from('users')
          .update({ status: 'INACTIVE' })
          .eq('id', userId)
          .select()
          .single()

        if (deactivateError) {
          console.error('Deactivate error:', deactivateError)
          return NextResponse.json({ 
            success: false, 
            message: 'Failed to deactivate user' 
          }, { status: 500 })
        }

        result = deactivatedUser
        break

      case 'delete':
        const { error: deleteError } = await supabaseAdmin
          .from('users')
          .delete()
          .eq('id', userId)

        if (deleteError) {
          console.error('Delete error:', deleteError)
          return NextResponse.json({ 
            success: false, 
            message: 'Failed to delete user' 
          }, { status: 500 })
        }
        
        result = { id: userId, deleted: true }
        break

      default:
        return NextResponse.json({ 
          success: false, 
          message: 'Invalid action' 
        }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `User ${action}d successfully`,
      user: result
    })

  } catch (error: any) {
    console.error('User action error:', error)
    
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    }, { status: 500 })
  }
}