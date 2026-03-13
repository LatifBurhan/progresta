export default function TestDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            🧪 Test Dashboard
          </h1>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">
              Jika Anda bisa melihat halaman ini, berarti server berjalan dengan baik!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}