import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Only PM, GENERAL_AFFAIR, CEO, ADMIN can approve users
    if (!['PM', 'GENERAL_AFFAIR', 'CEO', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 })
    }

    const { userId, role, divisionId } = await request.json()

    if (!userId || !role || !divisionId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields: userId, role, divisionId' 
      }, { status: 400 })
    }

    // Validate role
    const validRoles = ['STAFF', 'PM', 'GENERAL_AFFAIR', 'CEO', 'ADMIN']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid role' 
      }, { status: 400 })
    }

    // Check if user exists and is pending
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

    if (user.status !== 'PENDING') {
      return NextResponse.json({ 
        success: false, 
        message: 'User is not pending approval' 
      }, { status: 400 })
    }

    // Check if division exists
    const division = await prisma.division.findUnique({
      where: { id: divisionId }
    })

    if (!division) {
      return NextResponse.json({ 
        success: false, 
        message: 'Division not found' 
      }, { status: 404 })
    }

    // Update user status, role, and division
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status: 'ACTIVE',
        role: role as any,
        divisionId: divisionId,
        createdBy: session.userId // Track who approved this user
      },
      include: {
        profile: true,
        division: true
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'User approved successfully',
      user: updatedUser
    })

  } catch (error) {
    console.error('User approval error:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}