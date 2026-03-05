import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import { getCachedUsers } from '@/lib/cache'
import UsersPageClient from './UsersPageClient'

export default async function UsersPage() {
  const session = await verifySession()

  // Only ADMIN can access this page
  if (!session || session.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const users = await getCachedUsers()

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">User Management</h1>
        <UsersPageClient users={users} />
      </div>
    </div>
  )
}
