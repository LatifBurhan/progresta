import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import { logoutAction } from '@/app/actions/auth-actions'
import prisma from '@/lib/prisma'
import ChatBot from './ChatBot'
import { ChatProvider } from './ChatContext'
import InstallPrompt from '@/components/InstallPrompt'
import ResponsiveLayout from './ResponsiveLayout'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await verifySession()

  if (!session) {
    redirect('/login')
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.userId },
  })

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
