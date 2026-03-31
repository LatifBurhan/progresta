import { redirect } from 'next/navigation'
import { verifySession, deleteSession } from '@/lib/session'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function logoutAction() {
  'use server'
  await deleteSession()
  redirect('/login')
}

export default async function WaitingRoomPage() {
  const session = await verifySession()

  if (!session) {
    redirect('/login')
  }

  // Get user data using Supabase client
  const supabase = createClient()
  const { data: userData, error } = await supabase
    .from('users')
    .select('email, name, role, status_pending')
    .eq('id', session.userId)
    .single()

  if (error || !userData) {
    redirect('/login')
  }

  // If user is no longer pending, redirect to dashboard
  if (!userData.status_pending) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border-4 border-yellow-200">
              <span className="text-2xl font-bold text-white">
                {(userData.name || userData.email).charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          
          <CardTitle className="text-xl text-gray-900">
            ⏳ Menunggu Persetujuan
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-4xl mb-2">🕐</div>
            <p className="text-gray-700 font-medium">
              Halo, {userData.name || userData.email.split('@')[0]}!
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Akun Anda sedang menunggu persetujuan dari Admin/General Affair.
            </p>
          </div>

          <div className="text-left space-y-2 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">📋 Data Pendaftaran:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium">Email:</span> {userData.email}</p>
              {userData.name && (
                <p><span className="font-medium">Nama:</span> {userData.name}</p>
              )}
              <p><span className="font-medium">Status:</span> 
                <span className="ml-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                  ⏳ Pending
                </span>
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-2xl mb-2">💡</div>
            <p className="text-sm text-blue-800">
              <strong>Apa yang terjadi selanjutnya?</strong>
            </p>
            <ul className="text-xs text-blue-700 mt-2 space-y-1 text-left">
              <li>• Admin/General Affair akan meninjau data pendaftaran Anda</li>
              <li>• Anda akan diberikan role dan divisi yang sesuai</li>
              <li>• Setelah disetujui, Anda dapat mengakses dashboard</li>
              <li>• Proses ini biasanya memakan waktu 1-2 hari kerja</li>
            </ul>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500 mb-3">
              Jika ada pertanyaan, hubungi Admin/General Affair melalui WhatsApp atau email.
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