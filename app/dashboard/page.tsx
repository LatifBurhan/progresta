export default async function DashboardPage() {
  const session = {
    userId: '35fd9a31-5400-43f4-8806-8a5356c39579',
    email: 'alwustho1001@gmail.com',
    role: 'HRD',
    name: 'HRD Test'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🎉 Selamat Datang di Dashboard Progresta!
          </h1>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <div>
                <h2 className="font-semibold text-green-800">Login Berhasil!</h2>
                <p className="text-green-700 text-sm">
                  Anda berhasil masuk sebagai <strong>{session?.role}</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">👤 Informasi Akun</h3>
              <div className="space-y-1 text-sm text-blue-700">
                <p><strong>Email:</strong> {session?.email}</p>
                <p><strong>Role:</strong> {session?.role}</p>
                <p><strong>User ID:</strong> {session?.userId}</p>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800 mb-2">🚀 Fitur Tersedia</h3>
              <div className="space-y-1 text-sm text-purple-700">
                <p>• Dashboard Feed (Coming Soon)</p>
                <p>• Laporan Progres (Coming Soon)</p>
                <p>• Admin Panel (Role: {session?.role})</p>
                <p>• Profile Management</p>
              </div>
            </div>
          </div>

          {['PM', 'HRD', 'CEO', 'ADMIN'].includes(session?.role || '') && (
            <div className="mt-6 bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 mb-2">⚙️ Admin Panel</h3>
              <p className="text-orange-700 text-sm mb-3">
                Sebagai {session?.role}, Anda memiliki akses ke admin panel untuk mengelola user dan sistem.
              </p>
              <a 
                href="/admin/users" 
                className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                👥 Kelola User
              </a>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              🎯 Sistem Progresta (Progress & Auto-Attendance) siap digunakan!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
