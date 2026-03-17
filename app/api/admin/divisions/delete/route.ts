import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Only ADMIN can delete divisions
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Only ADMIN can delete divisions' }, { status: 403 })
    }

    const { divisionId } = await request.json()

    if (!divisionId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Division ID is required' 
      }, { status: 400 })
    }

    // Check if division exists and get counts
    const existingDivision = await prisma.division.findUnique({
      where: { id: divisionId },
      include: {
        users: { select: { id: true } },
        projects: { select: { id: true } }
      }
    })

    if (!existingDivision) {
      return NextResponse.json({ 
        success: false, 
        message: 'Division not found' 
      }, { status: 404 })
    }

    // Check if division has users or projects
    if (existingDivision.users.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: `Cannot delete division. It has ${existingDivision.users.length} users. Please move all users to other divisions first.` 
      }, { status: 400 })
    }

    if (existingDivision.projects.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: `Cannot delete division. It has ${existingDivision.projects.length} projects. Please move all projects to other divisions first.` 
      }, { status: 400 })
    }

    // Delete division
    await prisma.division.delete({
      where: { id: divisionId }
    })

    return NextResponse.json({
      success: true,
      message: 'Division deleted successfully'
    })

  } catch (error) {
    console.error('Delete division error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}