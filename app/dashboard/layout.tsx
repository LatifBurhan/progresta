import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import { logoutAction } from '@/app/actions/auth-actions'
import { getCachedProfile } from '@/lib/cache'
import { createClient } from '@/lib/supabase'
import ChatBot from './ChatBot'
import { ChatProvider } from './ChatContext'
import InstallPrompt from '@/components/InstallPrompt'
import ResponsiveLayout from './ResponsiveLayout'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Temporary: Skip all checks for debugging
  const session = {
    userId: '35fd9a31-5400-43f4-8806-8a5356c39579',
    email: 'alwustho1001@gmail.com',
    role: 'HRD',
    name: 'HRD Test'
  }

  const profile = {
    fotoProfil: null,
    name: 'HRD Test',
    user: {
      email: 'alwustho1001@gmail.com',
      role: 'HRD'
    }
  }

  return (
    <ChatProvider>
      <div className="min-h-screen bg-gray-50">
        <ResponsiveLayout
          session={session}
          profile={profile}
          logoutAction={logoutAction}
        >
          {children}
        </ResponsiveLayout>
        <InstallPrompt />
        <ChatBot />
      </div>
    </ChatProvider>
  )
}
