import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Only PM, HRD, CEO, ADMIN can toggle project status
    if (!['PM', 'HRD', 'CEO', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 })
    }

    const { projectId, isActive } = await request.json()

    if (!projectId || typeof isActive !== 'boolean') {
      return NextResponse.json({ 
        success: false, 
        message: 'Project ID and isActive status are required' 
      }, { status: 400 })
    }

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!existingProject) {
      return NextResponse.json({ 
        success: false, 
        message: 'Project not found' 
      }, { status: 404 })
    }

    // Update project status
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { isActive }
    })

    return NextResponse.json({
      success: true,
      message: `Project ${isActive ? 'activated' : 'deactivated'} successfully`,
      project: {
        ...updatedProject,
        createdAt: updatedProject.createdAt.toISOString(),
        updatedAt: updatedProject.updatedAt.toISOString(),
        startDate: updatedProject.startDate?.toISOString() || null,
        endDate: updatedProject.endDate?.toISOString() || null
      }
    })

  } catch (error) {
    console.error('Toggle project status error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}