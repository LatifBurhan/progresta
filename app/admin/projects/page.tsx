import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building, Calendar, FileText } from 'lucide-react'

export default async function AdminProjectsPage() {
  const session = await verifySession()

  if (!session) {
    redirect('/login')
  }

  // Only PM, HRD, CEO, ADMIN can access
  if (!['PM', 'HRD', 'CEO', 'ADMIN'].includes(session.role)) {
    redirect('/dashboard')
  }

  // Get projects with division info and report count
  const projects = await prisma.project.findMany({
    include: {
      division: {
        select: {
          name: true,
          color: true
        }
      },
      reportDetails: {
        select: { id: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            📋 Manajemen Project
          </h1>
          <p className="text-gray-600 mt-2">
            Kelola project dan assignment tim
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
              Manajemen project sedang dalam tahap pengembangan. Saat ini Anda dapat melihat daftar project yang ada.
            </p>
          </CardContent>
        </Card>

        {/* Projects List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  {project.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline"
                    className="text-xs"
                    style={{
                      borderColor: project.division.color || '#6B7280',
                      color: project.division.color || '#6B7280'
                    }}
                  >
                    <Building className="w-3 h-3 mr-1" />
                    {project.division.name}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {project.description && (
                  <p className="text-sm text-gray-600">
                    {project.description}
                  </p>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{project.reportDetails.length} Laporan</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Badge 
                    variant={project.isActive ? "default" : "secondary"}
                    className={project.isActive ? "bg-green-100 text-green-800" : ""}
                  >
                    {project.isActive ? '✅ Aktif' : '❌ Non-Aktif'}
                  </Badge>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(project.createdAt).toLocaleDateString('id-ID')}
                  </div>
                </div>

                {project.startDate && (
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    <div className="flex justify-between">
                      <span>Mulai: {new Date(project.startDate).toLocaleDateString('id-ID')}</span>
                      {project.endDate && (
                        <span>Selesai: {new Date(project.endDate).toLocaleDateString('id-ID')}</span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {projects.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum Ada Project
              </h3>
              <p className="text-gray-600 text-sm">
                Belum ada project yang terdaftar dalam sistem.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}