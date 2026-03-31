import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, Calendar, FileSpreadsheet, Users, Building } from 'lucide-react'

export default async function AdminReportsPage() {
  const session = await verifySession()

  if (!session) {
    redirect('/login')
  }

  // Only PM, GENERAL_AFFAIR, CEO, ADMIN can access
  if (!['PM', 'GENERAL_AFFAIR', 'CEO', 'ADMIN'].includes(session.role)) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            📊 Export Laporan
          </h1>
          <p className="text-gray-600 mt-2">
            Export data laporan untuk backup dan analisis
          </p>
        </div>

        {/* Coming Soon Notice */}
        <Card className="border-blue-200 bg-blue-50 mb-6">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="text-lg font-medium text-blue-800 mb-2">
              Fitur Dalam Pengembangan
            </h3>
            <p className="text-blue-700 text-sm">
              Fitur export laporan sedang dalam tahap pengembangan. Akan segera tersedia untuk membantu analisis data.
            </p>
          </CardContent>
        </Card>

        {/* Export Options Preview */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Monthly Report Export */}
          <Card className="opacity-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Laporan Bulanan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Export laporan progres karyawan berdasarkan bulan dan tahun tertentu.
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pilih Bulan & Tahun
                  </label>
                  <Input 
                    type="month" 
                    disabled
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Format Export
                  </label>
                  <select disabled className="w-full p-2 border border-gray-300 rounded-md bg-gray-100">
                    <option>Excel (.xlsx)</option>
                    <option>CSV (.csv)</option>
                    <option>PDF (.pdf)</option>
                  </select>
                </div>
              </div>
              
              <Button disabled className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Laporan Bulanan
              </Button>
            </CardContent>
          </Card>

          {/* User Performance Export */}
          <Card className="opacity-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-green-600" />
                Performa Karyawan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Export data performa dan produktivitas karyawan per divisi.
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Periode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="date" disabled />
                    <Input type="date" disabled />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Filter Divisi
                  </label>
                  <select disabled className="w-full p-2 border border-gray-300 rounded-md bg-gray-100">
                    <option>Semua Divisi</option>
                    <option>Frontend</option>
                    <option>Backend</option>
                    <option>Mobile</option>
                    <option>UI/UX</option>
                  </select>
                </div>
              </div>
              
              <Button disabled className="w-full">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export Performa Karyawan
              </Button>
            </CardContent>
          </Card>

          {/* Project Summary Export */}
          <Card className="opacity-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5 text-purple-600" />
                Ringkasan Project
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Export ringkasan progres dan status semua project yang sedang berjalan.
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Project
                  </label>
                  <select disabled className="w-full p-2 border border-gray-300 rounded-md bg-gray-100">
                    <option>Semua Status</option>
                    <option>Aktif</option>
                    <option>Selesai</option>
                    <option>Ditunda</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Include Detail
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" disabled className="rounded" />
                      Timeline Project
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" disabled className="rounded" />
                      Anggota Tim
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" disabled className="rounded" />
                      Kendala & Issues
                    </label>
                  </div>
                </div>
              </div>
              
              <Button disabled className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Ringkasan Project
              </Button>
            </CardContent>
          </Card>

          {/* Attendance Summary */}
          <Card className="opacity-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-600" />
                Rekap Absensi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Export data absensi dan jam kerja karyawan berdasarkan laporan harian.
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Periode Absensi
                  </label>
                  <Input 
                    type="month" 
                    disabled
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Include Data
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" disabled className="rounded" />
                      Jam Masuk/Pulang
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" disabled className="rounded" />
                      Total Jam Kerja
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" disabled className="rounded" />
                      Overtime Hours
                    </label>
                  </div>
                </div>
              </div>
              
              <Button disabled className="w-full">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export Rekap Absensi
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info Box */}
        <Card className="mt-6 border-gray-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Fitur Export Akan Segera Hadir
                </h4>
                <p className="text-sm text-gray-600">
                  Tim development sedang mengembangkan fitur export yang komprehensif dengan berbagai format dan filter. 
                  Fitur ini akan membantu Anda menganalisis produktivitas tim dan membuat laporan untuk klien dengan mudah.
                </p>
                <div className="mt-3 text-xs text-gray-500">
                  <strong>Rencana Fitur:</strong> Export Excel/CSV/PDF, Filter berdasarkan divisi/project/periode, 
                  Grafik produktivitas, Template laporan klien, dan Scheduled export otomatis.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}