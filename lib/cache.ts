import { unstable_cache } from 'next/cache'
import { createClient } from './supabase'

// Cache profile data for 60 seconds
export const getCachedProfile = unstable_cache(
  async (userId: string) => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('users')
      .select(`
        email,
        name,
        role
      `)
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return {
      fotoProfil: null, // Placeholder for now
      name: data.name,
      user: {
        email: data.email,
        role: data.role
      }
    }
  },
  ['profile'],
  {
    revalidate: 60,
    tags: ['profile'],
  }
)

// Cache users list for 30 seconds
export const getCachedUsers = unstable_cache(
  async () => {
    return await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        profile: {
          select: {
            name: true,
            fotoProfil: true,
          },
        },
        division: {
          select: {
            name: true,
            color: true,
          },
        },
      },
    })
  },
  ['users'],
  {
    revalidate: 30,
    tags: ['users'],
  }
)

export const getCachedUserProjects = unstable_cache(
  async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { division: true }
    })

    if (!user || !user.divisionId) {
      return []
    }

    return await prisma.project.findMany({
      where: {
        divisionId: user.divisionId,
        isActive: true
      },
      select: {
        id: true,
        name: true,
        description: true
      },
      orderBy: { name: 'asc' }
    })
  },
  ['user-projects'],
  { revalidate: 300, tags: ['projects'] }
)

export const getCachedLastReport = unstable_cache(
  async (userId: string) => {
    return await prisma.report.findFirst({
      where: { userId },
      orderBy: { reportTime: 'desc' },
      select: {
        period: true,
        reportDate: true,
        reportTime: true
      }
    })
  },
  ['last-report'],
  { revalidate: 60, tags: ['reports'] }
)
