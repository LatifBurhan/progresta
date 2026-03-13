import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building, Users, Calendar } from 'lucide-react'

export default async function AdminDivisionsPage() {
  const session = await verifySession()

  if (!session) {
    redirect('/login')
  }

  // Only PM, HRD, CEO, ADMIN can access
  if (!['PM', 'HRD', 'CEO', 'ADMIN'].includes(session.role)) {
    redirect('/dashboard')
  }

  // Get divisions with user count
  const divisions = await prisma.division.findMany({
    include: {
      users: {
        where: { status: 'ACTIVE' },
        select: { id: true }
      },
      projects: {
        where: { isActive: true },
        select: { id: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            🏢 Manajemen Divisi
          </h1>
          <p className="text-gray-600 mt-2">
            Kelola divisi dan struktur organisasi perusahaan
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
              Manajemen divisi sedang dalam tahap pengembangan. Saat ini Anda dapat melihat daftar divisi yang ada.
            </p>
          </CardContent>
        </Card>

        {/* Divisions List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {divisions.map((division) => (
            <Card key={division.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: division.color || '#6B7280' }}
                  />
                  {division.name}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {division.description && (
                  <p className="text-sm text-gray-600">
                    {division.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{division.users.length} Karyawan</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-gray-600">
                    <Building className="w-4 h-4" />
                    <span>{division.projects.length} Project</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={division.isActive ? "default" : "secondary"}
                    className={division.isActive ? "bg-green-100 text-green-800" : ""}
                  >
                    {division.isActive ? '✅ Aktif' : '❌ Non-Aktif'}
                  </Badge>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(division.createdAt).toLocaleDateString('id-ID')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {divisions.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum Ada Divisi
              </h3>
              <p className="text-gray-600 text-sm">
                Belum ada divisi yang terdaftar dalam sistem.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}