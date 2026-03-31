import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Only GENERAL_AFFAIR, CEO, ADMIN can toggle division status
    if (!['GENERAL_AFFAIR', 'CEO', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 })
    }

    const { divisionId, isActive } = await request.json()

    if (!divisionId || typeof isActive !== 'boolean') {
      return NextResponse.json({ 
        success: false, 
        message: 'Division ID and isActive status are required' 
      }, { status: 400 })
    }

    // Check if division exists
    const existingDivision = await prisma.division.findUnique({
      where: { id: divisionId },
      include: {
        users: { select: { id: true } }
      }
    })

    if (!existingDivision) {
      return NextResponse.json({ 
        success: false, 
        message: 'Division not found' 
      }, { status: 404 })
    }

    // Warning if deactivating division with users
    if (!isActive && existingDivision.users.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: `Cannot deactivate division. It has ${existingDivision.users.length} active users. Please move all users to other divisions first.` 
      }, { status: 400 })
    }

    // Update division status
    const updatedDivision = await prisma.division.update({
      where: { id: divisionId },
      data: { isActive }
    })

    return NextResponse.json({
      success: true,
      message: `Division ${isActive ? 'activated' : 'deactivated'} successfully`,
      division: {
        ...updatedDivision,
        createdAt: updatedDivision.createdAt.toISOString(),
        updatedAt: updatedDivision.updatedAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Toggle division status error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}