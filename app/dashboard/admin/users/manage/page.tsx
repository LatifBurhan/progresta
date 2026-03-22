import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import UserManagementClient from './UserManagementClient'

export default async function UserManagePage() {
  const session = await verifySession()

  if (!session) {
    redirect('/login')
  }

  // Only HRD, CEO, ADMIN can manage users
  if (!['HRD', 'CEO', 'ADMIN'].includes(session.role)) {
    redirect('/dashboard')
  }

  // Get all users with their divisions (no profiles table in current schema)
  let allUsers = []
  let divisions = []

  try {
    const users = await prisma.user.findMany({
      where: { 
        statusPending: false // Only active users (not pending approval)
      },
      include: {
        division: {
          select: {
            name: true,
            color: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform users to match expected format
    allUsers = users.map(user => ({
      ...user,
      createdAt: user.createdAt.toISOString(),
      // Get name from Supabase Auth metadata atau gunakan email
      profile: {
        name: user.email.split('@')[0], // Fallback: gunakan bagian email sebelum @
        fotoProfil: null,
        phone: null,
        position: null
      }
    }))

    // Get all active divisions
    divisions = await prisma.division.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })

  } catch (error) {
    console.error('Failed to fetch users or divisions:', error)
    // Return empty arrays if database fails
    allUsers = []
    divisions = []
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {allUsers.length === 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800">
            ⚠️ Tidak dapat memuat data user. Periksa koneksi database.
          </p>
        </div>
      )}
      
      <UserManagementClient 
        allUsers={allUsers}
        divisions={divisions}
        currentUserRole={session.role}
      />
    </div>
  )
}