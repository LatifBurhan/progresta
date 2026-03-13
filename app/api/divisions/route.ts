import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only PM, CEO, HRD, ADMIN can access all divisions
    if (!['PM', 'CEO', 'HRD', 'ADMIN'].includes(session.role)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden' },
        { status: 403 }
      )
    }

    const divisions = await prisma.division.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        color: true,
        description: true
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({
      success: true,
      divisions
    })

  } catch (error) {
    console.error('Get divisions error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}