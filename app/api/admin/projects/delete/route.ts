import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Only ADMIN can delete projects
    if (session.role !== 'ADMIN') {
      return NextResponse.json({ success: false, message: 'Only ADMIN can delete projects' }, { status: 403 })
    }

    const { projectId } = await request.json()

    if (!projectId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Project ID is required' 
      }, { status: 400 })
    }

    // Check if project exists and get report count
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        reportDetails: { select: { id: true } }
      }
    })

    if (!existingProject) {
      return NextResponse.json({ 
        success: false, 
        message: 'Project not found' 
      }, { status: 404 })
    }

    // Check if project has reports
    if (existingProject.reportDetails.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: `Cannot delete project. It has ${existingProject.reportDetails.length} reports. Please remove all reports first or contact administrator.` 
      }, { status: 400 })
    }

    // Delete project
    await prisma.project.delete({
      where: { id: projectId }
    })

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    })

  } catch (error) {
    console.error('Delete project error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}