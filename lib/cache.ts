import { unstable_cache } from 'next/cache'
import prisma from './prisma'

// Cache profile data for 60 seconds
export const getCachedProfile = unstable_cache(
  async (userId: string) => {
    return await prisma.profile.findUnique({
      where: { userId },
    })
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
        createdAt: true,
      },
    })
  },
  ['users'],
  {
    revalidate: 30,
    tags: ['users'],
  }
)
