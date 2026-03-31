import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { DashboardClient } from './DashboardClient'

export default async function DashboardPage() {
  const session = await verifySession()

  if (!session) {
    redirect('/login')
  }

  // Get user name from Supabase Auth user_metadata
  let userName = session.email
  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not initialized')
    }

    // First try to get from Auth user metadata
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(session.userId)
    
    if (!authError && authUser?.user?.user_metadata?.name) {
      userName = authUser.user.user_metadata.name
    } else {
      // Fallback: try to get from users table (for backward compatibility)
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', session.userId)
        .single()
      
      if (user) {
        // User exists in database, use email as fallback
        userName = session.email.split('@')[0]
      }
    }
  } catch (error) {
    console.error('Error fetching user name:', error)
    userName = session.email.split('@')[0]
  }

  return (
    <div className="p-6">
      <DashboardClient userRole={session.role} userName={userName} />
    </div>
  )
}
