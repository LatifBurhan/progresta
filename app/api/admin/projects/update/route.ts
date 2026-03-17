import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Only PM, HRD, CEO, ADMIN can update projects
    if (!['PM', 'HRD', 'CEO', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 })
    }

    const { projectId, name, description, divisionId, startDate, endDate } = await request.json()

    if (!projectId || !name || !name.trim()) {
      return NextResponse.json({ 
        success: false, 
        message: 'Project ID dan nama project wajib diisi' 
      }, { status: 400 })
    }

    if (!divisionId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Divisi wajib dipilih' 
      }, { status: 400 })
    }

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      if (end <= start) {
        return NextResponse.json({ 
          success: false, 
          message: 'Tanggal selesai harus setelah tanggal mulai' 
        }, { status: 400 })
      }
    }

    // Check if project exists
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

    // Check if division exists and is active
    const division = await prisma.division.findUnique({
      where: { id: divisionId }
    })

    if (!division) {
      return NextResponse.json({ 
        success: false, 
        message: 'Division not found' 
      }, { status: 404 })
    }

    if (!division.isActive) {
      return NextResponse.json({ 
        success: false, 
        message: 'Cannot assign project to inactive division' 
      }, { status: 400 })
    }

    // Update project
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        divisionId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      },
      include: {
        division: {
          select: {
            name: true,
            color: true
          }
        }
      }
    })

    // Return project with formatted dates and report count
    const projectWithDetails = {
      ...updatedProject,
      createdAt: updatedProject.createdAt.toISOString(),
      updatedAt: updatedProject.updatedAt.toISOString(),
      startDate: updatedProject.startDate?.toISOString() || null,
      endDate: updatedProject.endDate?.toISOString() || null,
      reportCount: existingProject.reportDetails.length
    }

    return NextResponse.json({
      success: true,
      message: 'Project updated successfully',
      project: projectWithDetails
    })

  } catch (error) {
    console.error('Update project error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}