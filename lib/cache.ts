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
    const supabase = createClient()
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        role,
        status_pending,
        created_at
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return []
    }

    return data.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status_pending ? 'PENDING' : 'ACTIVE',
      createdAt: user.created_at,
      profile: {
        name: user.name,
        fotoProfil: null
      },
      division: null // Placeholder
    }))
  },
  ['users'],
  {
    revalidate: 30,
    tags: ['users'],
  }
)

export const getCachedUserProjects = unstable_cache(
  async (userId: string) => {
    // Placeholder implementation
    return []
  },
  ['user-projects'],
  { revalidate: 300, tags: ['projects'] }
)

export const getCachedLastReport = unstable_cache(
  async (userId: string) => {
    // Placeholder implementation
    return null
  },
  ['last-report'],
  { revalidate: 60, tags: ['reports'] }
)
