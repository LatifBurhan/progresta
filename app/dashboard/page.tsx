import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { DashboardClient } from './DashboardClient'

export default async function DashboardPage() {
  const session = await verifySession()

  if (!session) {
    redirect('/login')
  }

  // Get user name
  let userName = session.email
  try {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('name')
      .eq('id', session.userId)
      .single()
    
    if (user) {
      userName = user.name || session.email
    }
  } catch (error) {
    console.error('Error fetching user name:', error)
  }

  return (
    <div className="p-6">
      <DashboardClient userRole={session.role} userName={userName} />
    </div>
  )
}
