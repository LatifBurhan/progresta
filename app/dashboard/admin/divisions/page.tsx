import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import DivisionManagementClient from './DivisionManagementClient'

export default async function DivisionManagePage() {
  const session = await verifySession()

  if (!session) {
    redirect('/login')
  }

  // Only HRD, CEO, ADMIN can manage divisions
  if (!['HRD', 'CEO', 'ADMIN'].includes(session.role)) {
    redirect('/dashboard')
  }

  // Get all divisions with user and project counts
  const divisions = await prisma.division.findMany({
    include: {
      users: {
        select: { id: true }
      },
      projects: {
        select: { id: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  // Transform data to include counts
  const divisionsWithCounts = divisions.map(division => ({
    ...division,
    createdAt: division.createdAt.toISOString(),
    updatedAt: division.updatedAt.toISOString(),
    userCount: division.users.length,
    projectCount: division.projects.length,
    users: undefined, // Remove the full users array
    projects: undefined // Remove the full projects array
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <DivisionManagementClient 
        divisions={divisionsWithCounts}
        currentUserRole={session.role}
      />
    </div>
  )
}