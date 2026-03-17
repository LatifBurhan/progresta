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

  // Get all users with their profiles and divisions
  const [allUsers, divisions] = await Promise.all([
    prisma.user.findMany({
      where: { 
        status: { in: ['ACTIVE', 'INACTIVE'] }
      },
      include: {
        profile: {
          select: {
            name: true,
            fotoProfil: true,
            phone: true,
            position: true
          }
        },
        division: {
          select: {
            name: true,
            color: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }).then(users => users.map(user => ({
      ...user,
      createdAt: user.createdAt.toISOString()
    }))),
    prisma.division.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <UserManagementClient 
        allUsers={allUsers}
        divisions={divisions}
        currentUserRole={session.role}
      />
    </div>
  )
}