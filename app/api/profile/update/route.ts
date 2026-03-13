import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { deleteAvatar, getFileNameFromUrl } from '@/lib/supabase'
import { z } from 'zod'

const UpdateProfileSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
  fotoProfil: z.string().nullable().optional(),
})

export async function PUT(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = UpdateProfileSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        { success: false, message: 'Data tidak valid' },
        { status: 400 }
      )
    }

    const updateData = validatedData.data

    // Check if profile exists
    let profile = await prisma.profile.findUnique({
      where: { userId: session.userId },
    })

    // Handle photo deletion
    if (updateData.fotoProfil === null && profile?.fotoProfil) {
      console.log('Deleting photo:', profile.fotoProfil)
      const oldFileName = getFileNameFromUrl(profile.fotoProfil)
      console.log('Extracted filename:', oldFileName)
      
      if (oldFileName) {
        const deleteResult = await deleteAvatar(oldFileName)
        console.log('Delete result:', deleteResult)
      }
    }

    if (profile) {
      // Update existing profile
      profile = await prisma.profile.update({
        where: { userId: session.userId },
        data: {
          ...(updateData.name !== undefined && { name: updateData.name || null }),
          ...(updateData.phone !== undefined && { phone: updateData.phone || null }),
          ...(updateData.position !== undefined && { position: updateData.position || null }),
          ...(updateData.fotoProfil !== undefined && { fotoProfil: updateData.fotoProfil }),
        },
      })
    } else {
      // Create new profile
      profile = await prisma.profile.create({
        data: {
          userId: session.userId,
          name: updateData.name || null,
          phone: updateData.phone || null,
          position: updateData.position || null,
          fotoProfil: updateData.fotoProfil || null,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: updateData.fotoProfil === null ? 'Foto profil berhasil dihapus' : 'Profile berhasil diperbarui',
      profile,
    })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
