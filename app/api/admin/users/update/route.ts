import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Only HRD, CEO, ADMIN can update users
    if (!['HRD', 'CEO', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 })
    }

    const { userId, email, name, phone, position, role, divisionId, password } = await request.json()

    if (!userId || !email || !name || !role || !divisionId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Missing required fields: userId, email, name, role, divisionId' 
      }, { status: 400 })
    }

    // Validate role
    const validRoles = ['KARYAWAN', 'PM', 'HRD', 'CEO', 'ADMIN']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid role' 
      }, { status: 400 })
    }

    // Permission checks
    if (session.role === 'HRD' && !['KARYAWAN', 'PM'].includes(role)) {
      return NextResponse.json({ 
        success: false, 
        message: 'HRD can only edit KARYAWAN and PM roles' 
      }, { status: 403 })
    }

    if (session.role === 'CEO' && role === 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        message: 'CEO cannot edit ADMIN users' 
      }, { status: 403 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    })

    if (!existingUser) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { status: 404 })
    }

    // Check if email is taken by another user
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      })

      if (emailExists) {
        return NextResponse.json({ 
          success: false, 
          message: 'Email already exists' 
        }, { status: 400 })
      }
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

    // Update user and profile in a transaction
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Prepare user update data
      const userUpdateData: any = {
        email,
        role: role as any,
        divisionId
      }

      // Hash password if provided
      if (password) {
        userUpdateData.password = await bcrypt.hash(password, 12)
      }

      // Update user
      const user = await tx.user.update({
        where: { id: userId },
        data: userUpdateData
      })

      // Update or create profile
      await tx.profile.upsert({
        where: { userId },
        update: {
          name,
          phone: phone || null,
          position: position || null
        },
        create: {
          userId,
          name,
          phone: phone || null,
          position: position || null
        }
      })

      return user
    })

    // Return updated user with profile and division
    const userWithDetails = await prisma.user.findUnique({
      where: { id: updatedUser.id },
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
      message: 'User updated successfully',
      user: {
        ...userWithDetails,
        createdAt: userWithDetails?.createdAt.toISOString()
      }
    })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}