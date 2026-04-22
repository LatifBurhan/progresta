import { redirect } from 'next/navigation'
import { verifySession, deleteSession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
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

  if (!supabaseAdmin) {
    redirect('/login')
  }

  // Get user data from Supabase
  const { data: user } = await supabaseAdmin
    .from('users')
    .select('id, email, role, status')
    .eq('id', session.userId)
    .single()

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

  // Get user metadata from Supabase Auth
  const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(session.userId)
  const userMetadata = authUser?.user?.user_metadata || {}
  const userName = userMetadata.name || user.email.split('@')[0]
  const userPhoto = userMetadata.fotoProfil || null
  const userPosition = userMetadata.position || null

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {userPhoto ? (
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-red-200 grayscale">
                <Image
                  src={userPhoto}
                  alt={userName}
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center border-4 border-red-200">
                <span className="text-2xl font-bold text-white">
                  {userName.charAt(0).toUpperCase()}
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
              Halo, {userName}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Akun Anda telah dinonaktifkan oleh Admin/HRD.
            </p>
          </div>

          <div className="text-left space-y-2 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">👤 Informasi Akun:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Email:</span> {user.email}</p>
              <p><span className="font-medium">Nama:</span> {userName}</p>
              {userPosition && (
                <p><span className="font-medium">Posisi:</span> {userPosition}</p>
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