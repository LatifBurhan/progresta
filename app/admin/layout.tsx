import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import { logoutAction } from '@/app/actions/auth-actions'
import { createClient } from '@/lib/supabase'
import ResponsiveLayout from '../dashboard/ResponsiveLayout'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await verifySession()

  if (!session) {
    redirect('/login')
  }

  // Only PM, HRD, CEO, ADMIN can access admin routes
  if (!['PM', 'HRD', 'CEO', 'ADMIN'].includes(session.role)) {
    redirect('/dashboard')
  }

  // Get user profile data
  const supabase = createClient()
  let profile = null
  
  try {
    const { data: userData } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('id', session.userId)
      .single()

    if (userData) {
      profile = {
        fotoProfil: null
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