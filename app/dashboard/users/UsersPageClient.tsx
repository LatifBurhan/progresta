'use client'

import { useEffect } from 'react'
import { useChatContext } from '../ChatContext'
import CreateUserForm from './CreateUserForm'
import UserList from './UserList'

type User = {
  id: string
  email: string
  role: string
  createdAt: Date
}

export default function UsersPageClient({ users }: { users: User[] }) {
  const { setPageContext } = useChatContext()

  useEffect(() => {
    // Set context when component mounts
    const contextData = `Kamu adalah AI assistant untuk sistem User Management. Kamu memiliki akses ke data user berikut:

TOTAL USERS: ${users.length}

DAFTAR USER:
${users.map((user, idx) => `${idx + 1}. Email: ${user.email} | Role: ${user.role} | Dibuat: ${new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`).join('\n')}

INSTRUKSI:
- Selalu jawab dalam Bahasa Indonesia
- Gunakan data di atas untuk menjawab pertanyaan tentang user
- Berikan analisis dan insight yang berguna
- Jika ditanya tentang user tertentu, cari berdasarkan email atau role
- Jika ditanya statistik, hitung dari data di atas
- Berikan saran yang konstruktif untuk user management

CONTOH PERTANYAAN YANG BISA DIJAWAB:
- Berapa total user?
- Siapa saja user dengan role ADMIN?
- Kapan user terakhir dibuat?
- Berikan analisis distribusi role
- Siapa user dengan email tertentu?`

    setPageContext(contextData)

    // Clear context when component unmounts
    return () => {
      setPageContext(null)
    }
  }, [users, setPageContext])

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
