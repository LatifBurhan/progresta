import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import { getActiveSession } from '@/lib/overtime/queries'
import OvertimeDashboardClient from './OvertimeDashboardClient'

export default async function OvertimePage() {
  const session = await verifySession()
  if (!session) {
    redirect('/login')
  }

  let activeSession = null
  try {
    activeSession = await getActiveSession(session.userId)
  } catch {
    // proceed with null
  }

  return <OvertimeDashboardClient initialSession={activeSession} />
}
