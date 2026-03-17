import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Only HRD, CEO, ADMIN can create users directly
    if (!['HRD', 'CEO', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 })
    }

    const { email, password, name, phone, position, role, divisionId } = await request.json()

    if (!email || !password || !name || !role || !divisionId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields: email, password, name, role, divisionId' 
      }, { status: 400 })
    }

    // Validate role
    const validRoles = ['KARYAWAN', 'PM', 'HRD', 'CEO']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid role' 
      }, { status: 400 })
    }

    // Only ADMIN can create ADMIN users
    if (role === 'ADMIN' && session.role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        message: 'Only ADMIN can create ADMIN users' 
      }, { status: 403 })
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email already exists' 
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user with profile in a transaction
    const newUser = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: role as any,
          status: 'ACTIVE', // Direct creation = active immediately
          divisionId,
          createdBy: session.userId
        }
      })

      // Create profile
      await tx.profile.create({
        data: {
          userId: user.id,
          name,
          phone: phone || null,
          position: position || null
        }
      })

      return user
    })

    // Return user data with profile and division
    const userWithDetails = await prisma.user.findUnique({
      where: { id: newUser.id },
      include: {
        profile: {
          select: {
            name: true,
            phone: true,
            position: true,
            fotoProfil: true
          }
        },
        division: {
          select: {
            name: true,
            color: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        ...userWithDetails,
        createdAt: userWithDetails?.createdAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}