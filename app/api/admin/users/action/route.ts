import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Only PM, HRD, CEO, ADMIN can perform user actions
    if (!['PM', 'HRD', 'CEO', 'ADMIN'].includes(session.role)) {
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
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    })

    if (!user) {
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

    // Only ADMIN can delete users
    if (action === 'delete' && session.role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        message: 'Only ADMIN can delete users' 
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
        
        result = await prisma.user.update({
          where: { id: userId },
          data: { status: 'ACTIVE' },
          include: { profile: true, division: true }
        })
        break

      case 'deactivate':
        if (user.status === 'INACTIVE') {
          return NextResponse.json({ 
            success: false, 
            message: 'User is already inactive' 
          }, { status: 400 })
        }
        
        result = await prisma.user.update({
          where: { id: userId },
          data: { status: 'INACTIVE' },
          include: { profile: true, division: true }
        })
        break

      case 'delete':
        // Delete user and all related data (cascade will handle profile)
        // Note: Reports will remain but user reference will be null
        await prisma.user.delete({
          where: { id: userId }
        })
        
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
    
    // Handle specific Prisma errors
    if (error?.code === 'P2025') {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}