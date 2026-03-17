import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import ProjectManagementClient from './ProjectManagementClient'

export default async function ProjectManagePage() {
  const session = await verifySession()

  if (!session) {
    redirect('/login')
  }

  // Only PM, HRD, CEO, ADMIN can manage projects
  if (!['PM', 'HRD', 'CEO', 'ADMIN'].includes(session.role)) {
    redirect('/dashboard')
  }

  // Get all projects with division info and report counts
  const [projects, divisions] = await Promise.all([
    prisma.project.findMany({
      include: {
        division: {
          select: {
            name: true,
            color: true
          }
        },
        reportDetails: {
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }).then(projects => projects.map(project => ({
      ...project,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      startDate: project.startDate?.toISOString() || null,
      endDate: project.endDate?.toISOString() || null,
      reportCount: project.reportDetails.length,
      reportDetails: undefined // Remove the full reportDetails array
    }))),
    prisma.division.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <ProjectManagementClient 
        projects={projects}
        divisions={divisions}
        currentUserRole={session.role}
      />
    </div>
  )
}