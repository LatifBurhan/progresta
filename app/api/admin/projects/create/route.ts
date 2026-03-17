import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Only PM, HRD, CEO, ADMIN can create projects
    if (!['PM', 'HRD', 'CEO', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 })
    }

    const { name, description, divisionId, startDate, endDate } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ 
        success: false, 
        message: 'Nama project wajib diisi' 
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

    // Create project
    const newProject = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        divisionId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: true
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
      ...newProject,
      createdAt: newProject.createdAt.toISOString(),
      updatedAt: newProject.updatedAt.toISOString(),
      startDate: newProject.startDate?.toISOString() || null,
      endDate: newProject.endDate?.toISOString() || null,
      reportCount: 0 // New project has no reports
    }

    return NextResponse.json({
      success: true,
      message: 'Project created successfully',
      project: projectWithDetails
    })

  } catch (error) {
    console.error('Create project error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}