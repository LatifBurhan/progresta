'use client'

import CreateUserForm from './CreateUserForm'
import UserList from './UserList'

type User = {
  id: string
  email: string
  role: string
  createdAt: Date
}

export default function UsersPageClient({ users }: { users: User[] }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
      {/* Create User Form */}
      <div>
        <CreateUserForm />
      </div>

      {/* User List */}
      <div>
        <UserList users={users} />
      </div>
    </div>
  )
}
