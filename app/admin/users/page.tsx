import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import UserManagement from './UserManagement'

export default async function AdminUsersPage() {
  const session = await verifySession()

  if (!session) {
    redirect('/login')
  }

  // Only PM, HRD, CEO, ADMIN can access
  if (!['PM', 'HRD', 'CEO', 'ADMIN'].includes(session.role)) {
    redirect('/dashboard')
  }

  // Get pending users and all divisions
  const [pendingUsers, divisions, allUsers] = await Promise.all([
    prisma.user.findMany({
      where: { status: 'PENDING' },
      include: {
        profile: {
          select: {
            name: true,
            fotoProfil: true,
            phone: true,
            position: true
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
    }),
    prisma.user.findMany({
      where: { status: { in: ['ACTIVE', 'INACTIVE'] } },
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
    })))
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            👥 Manajemen User
          </h1>
          <p className="text-gray-600 mt-2">
            Kelola approval akun, role, dan divisi karyawan
          </p>
        </div>

        <UserManagement 
          pendingUsers={pendingUsers}
          allUsers={allUsers}
          divisions={divisions}
          currentUserRole={session.role}
        />
      </div>
    </div>
  )
}