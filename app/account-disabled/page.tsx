import { redirect } from 'next/navigation'
import { verifySession, deleteSession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

async function logoutAction() {
  'use server'
  await deleteSession()
  redirect('/login')
}

export default async function AccountDisabledPage() {
  const session = await verifySession()

  if (!session) {
    redirect('/login')
  }

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      profile: {
        select: {
          name: true,
          fotoProfil: true,
          phone: true,
          position: true
        }
      }
    }
  })

  if (!user) {
    redirect('/login')
  }

  // If user is active, redirect to dashboard
  if (user.status === 'ACTIVE') {
    redirect('/dashboard')
  }

  // If user is pending, redirect to waiting room
  if (user.status === 'PENDING') {
    redirect('/waiting-room')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {user.profile?.fotoProfil ? (
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-red-200 grayscale">
                <Image
                  src={user.profile.fotoProfil}
                  alt={user.profile.name || user.email}
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center border-4 border-red-200">
                <span className="text-2xl font-bold text-white">
                  {(user.profile?.name || user.email).charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          <CardTitle className="text-xl text-gray-900">
            🚫 Akun Dinonaktifkan
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-4xl mb-2">⛔</div>
            <p className="text-gray-700 font-medium">
              Halo, {user.profile?.name || user.email.split('@')[0]}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Akun Anda telah dinonaktifkan oleh Admin/HRD.
            </p>
          </div>

          <div className="text-left space-y-2 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">👤 Informasi Akun:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Email:</span> {user.email}</p>
              {user.profile?.name && (
                <p><span className="font-medium">Nama:</span> {user.profile.name}</p>
              )}
              {user.profile?.position && (
                <p><span className="font-medium">Posisi:</span> {user.profile.position}</p>
              )}
              <p><span className="font-medium">Status:</span> 
                <span className="ml-1 px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                  ❌ Non-Aktif
                </span>
              </p>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-2xl mb-2">📞</div>
            <p className="text-sm text-orange-800">
              <strong>Butuh bantuan?</strong>
            </p>
            <p className="text-xs text-orange-700 mt-2">
              Hubungi Admin/HRD untuk informasi lebih lanjut mengenai status akun Anda. 
              Mereka dapat memberikan penjelasan dan membantu mengaktifkan kembali akun jika diperlukan.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl mb-2">🔄</div>
            <p className="text-sm text-blue-800">
              <strong>Kemungkinan Penyebab:</strong>
            </p>
            <ul className="text-xs text-blue-700 mt-2 space-y-1 text-left">
              <li>• Pelanggaran kebijakan perusahaan</li>
              <li>• Masa kontrak kerja telah berakhir</li>
              <li>• Perpindahan divisi atau role</li>
              <li>• Pemeliharaan sistem sementara</li>
            </ul>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500 mb-3">
              Jika Anda merasa ini adalah kesalahan, segera hubungi Admin/HRD.
            </p>
            
            <form action={logoutAction}>
              <Button 
                type="submit"
                variant="outline" 
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                🚪 Logout
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}