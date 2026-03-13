import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')!
    const filter = searchParams.get('filter') || 'division' // 'division' or 'all'
    const divisionId = searchParams.get('divisionId')
    const search = searchParams.get('search') || ''
    const projectId = searchParams.get('projectId')

    // Get user's division
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { division: true }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      )
    }

    // Build where clause based on permissions and filter
    let whereClause: any = {}

    if (filter === 'all' && ['PM', 'CEO', 'HRD', 'ADMIN'].includes(session.role)) {
      // PM/CEO/HRD can see all divisions
      if (divisionId && divisionId !== 'all') {
        whereClause = {
          user: {
            divisionId: divisionId
          }
        }
      }
      // If divisionId is 'all' or empty, no additional filter (see all)
    } else {
      // Regular users or division filter
      if (user.divisionId) {
        whereClause = {
          user: {
            divisionId: user.divisionId
          }
        }
      } else {
        // User has no division, only see their own reports
        whereClause = {
          userId: userId
        }
      }
    }

    // Get today's date for filtering recent reports
    const now = new Date()
    const jakartaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Jakarta"}))
    const today = new Date(jakartaTime.getFullYear(), jakartaTime.getMonth(), jakartaTime.getDate())
    const threeDaysAgo = new Date(today)
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    // Add date filter to show recent reports
    whereClause.reportDate = {
      gte: threeDaysAgo
    }

    // Add search filter
    if (search.trim()) {
      whereClause.OR = [
        {
          user: {
            email: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          user: {
            profile: {
              name: {
                contains: search,
                mode: 'insensitive'
              }
            }
          }
        }
      ]
    }

    // Add project filter
    if (projectId && projectId !== 'all') {
      whereClause.reportDetails = {
        some: {
          projectId: projectId
        }
      }
    }

    const reports = await prisma.report.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            email: true,
            profile: {
              select: {
                name: true,
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
        },
        reportDetails: {
          include: {
            project: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        reportTime: 'desc'
      },
      take: 50 // Limit to 50 most recent reports
    })

    // Get divisions for filter dropdown (if user has permission)
    let divisions: Array<{id: string, name: string, color: string | null}> = []
    let projects: Array<{id: string, name: string}> = []
    
    if (['PM', 'CEO', 'HRD', 'ADMIN'].includes(session.role)) {
      divisions = await prisma.division.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          color: true
        },
        orderBy: { name: 'asc' }
      })

      // Get projects for filter
      projects = await prisma.project.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true
        },
        orderBy: { name: 'asc' },
        take: 20 // Limit to prevent too many options
      })
    }

    return NextResponse.json({
      success: true,
      reports,
      divisions,
      projects
    })

  } catch (error) {
    console.error('Get reports feed error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}