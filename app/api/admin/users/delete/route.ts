import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Only ADMIN can delete users
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Only ADMIN can delete users' }, { status: 403 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required field: userId' 
      }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    })

    if (!existingUser) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 })
    }

    // Prevent self-deletion
    if (userId === session.userId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Cannot delete your own account' 
      }, { status: 400 })
    }

    // Delete user (cascade will handle profile deletion)
    // Reports will remain but user reference will be null
    await prisma.user.delete({
      where: { id: userId }
    })

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}