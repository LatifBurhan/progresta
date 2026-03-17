import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Only HRD, CEO, ADMIN can create divisions
    if (!['HRD', 'CEO', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 })
    }

    const { name, description, color } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ 
        success: false, 
        message: 'Nama divisi wajib diisi' 
      }, { status: 400 })
    }

    // Check if division name already exists
    const existingDivision = await prisma.division.findUnique({
      where: { name: name.trim() }
    })

    if (existingDivision) {
      return NextResponse.json({ 
        success: false, 
        message: 'Nama divisi sudah digunakan' 
      }, { status: 400 })
    }

    // Create division
    const newDivision = await prisma.division.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6',
        isActive: true
      }
    })

    // Return division with counts (new division has 0 users and projects)
    const divisionWithCounts = {
      ...newDivision,
      createdAt: newDivision.createdAt.toISOString(),
      updatedAt: newDivision.updatedAt.toISOString(),
      userCount: 0,
      projectCount: 0
    }

    return NextResponse.json({
      success: true,
      message: 'Division created successfully',
      division: divisionWithCounts
    })

  } catch (error) {
    console.error('Create division error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}