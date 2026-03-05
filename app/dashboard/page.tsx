import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

export default async function DashboardPage() {
  const session = await verifySession()

  const profile = await prisma.profile.findUnique({
    where: { userId: session!.userId },
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Welcome to Dashboard</h1>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* Profile Photo - Full Rounded */}
              {profile?.fotoProfil ? (
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
                  <Image
                    src={profile.fotoProfil}
                    alt="Profile"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-4 border-gray-200 shadow-lg">
                  <span className="text-4xl sm:text-5xl font-bold text-white">
                    {session?.email.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-semibold break-all px-4">{session?.email}</h2>
                <p className="text-gray-600 mt-1">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {session?.role}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm border-t pt-4">
              <p className="text-gray-600 break-all">
                <span className="font-medium">User ID:</span> {session?.userId}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Profile Status:</span>{' '}
                <span className={profile?.fotoProfil ? 'text-green-600' : 'text-orange-600'}>
                  {profile?.fotoProfil ? '✓ Complete' : '○ Incomplete'}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-4 sm:mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-2">
            🎉 Template Ready!
          </h3>
          <p className="text-sm sm:text-base text-blue-800">
            Your authentication system is working. Start building your features here.
          </p>
        </div>
      </div>
    </div>
  )
}
