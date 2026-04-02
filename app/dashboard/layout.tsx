import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import { logoutAction } from '@/app/actions/auth-actions'
import { getCachedProfile } from '@/lib/cache'
import { createClient } from '@/lib/supabase'
import ResponsiveLayout from './ResponsiveLayout'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get real session data
  const session = await verifySession()

  if (!session) {
    redirect('/login')
  }

  // Get user profile data
  let profile = null
  try {
    const supabase = createClient()
    const { data: userData } = await supabase
      .from('users')
      .select('id, email, role, fotoProfil')
      .eq('id', session.userId)
      .single()

    if (userData) {
      profile = {
        fotoProfil: userData.fotoProfil
      }
    }
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
    // Fallback profile
    profile = {
      fotoProfil: null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ResponsiveLayout
        session={session}
        profile={profile}
        logoutAction={logoutAction}
      >
        {children}
      </ResponsiveLayout>
    </div>
  )
}
