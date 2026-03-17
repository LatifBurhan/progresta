import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Only HRD, CEO, ADMIN can update divisions
    if (!['HRD', 'CEO', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 })
    }

    const { divisionId, name, description, color } = await request.json()

    if (!divisionId || !name || !name.trim()) {
      return NextResponse.json({ 
        success: false, 
        message: 'Division ID dan nama divisi wajib diisi' 
      }, { status: 400 })
    }

    // Check if division exists
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

    // Check if new name is taken by another division
    if (name.trim() !== existingDivision.name) {
      const nameExists = await prisma.division.findUnique({
        where: { name: name.trim() }
      })

      if (nameExists) {
        return NextResponse.json({ 
          success: false, 
          message: 'Nama divisi sudah digunakan' 
        }, { status: 400 })
      }
    }

    // Update division
    const updatedDivision = await prisma.division.update({
      where: { id: divisionId },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6'
      }
    })

    // Return division with counts
    const divisionWithCounts = {
      ...updatedDivision,
      createdAt: updatedDivision.createdAt.toISOString(),
      updatedAt: updatedDivision.updatedAt.toISOString(),
      userCount: existingDivision.users.length,
      projectCount: existingDivision.projects.length
    }

    return NextResponse.json({
      success: true,
      message: 'Division updated successfully',
      division: divisionWithCounts
    })

  } catch (error) {
    console.error('Update division error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}