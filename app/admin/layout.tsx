import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import { createClient } from '@/lib/supabase'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await verifySession()

  if (!session) {
    redirect('/login')
  }

  // Check user status and role using Supabase client
  const supabase = createClient()
  const { data: userData, error } = await supabase
    .from('users')
    .select('role, status_pending')
    .eq('id', session.userId)
    .single()

  if (error || !userData) {
    redirect('/login')
  }

  if (userData.status_pending) {
    redirect('/waiting-room')
  }

  // Only PM, HRD, CEO, ADMIN can access admin routes
  if (!['PM', 'HRD', 'CEO', 'ADMIN'].includes(userData.role)) {
    redirect('/dashboard')
  }

  return <>{children}</>
}