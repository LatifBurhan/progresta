import { verifySession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { NotificationsClient } from './NotificationsClient'

export default async function NotificationsPage() {
  const session = await verifySession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="p-6">
      <NotificationsClient userId={session.userId} />
    </div>
  )
}
