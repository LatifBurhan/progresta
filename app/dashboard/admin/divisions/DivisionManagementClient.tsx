'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { 
  Building, 
  Users, 
  FolderOpen,
  Search,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react'
import CreateDivisionModal from './CreateDivisionModal'
import EditDivisionModal from './EditDivisionModal'
import DeleteDivisionModal from './DeleteDivisionModal'

interface Division {
  id: string
  name: string
  description: string | null
  color: string | null
  createdAt: string
  updatedAt: string
  isActive: boolean
  userCount: number
  projectCount: number
}

interface DivisionManagementClientProps {
  divisions: Division[]
  currentUserRole: string
}

export default function DivisionManagementClient({ 
  divisions: initialDivisions, 
  currentUserRole 
}: DivisionManagementClientProps) {
  const [divisions, setDivisions] = useState(initialDivisions)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [createModal, setCreateModal] = useState(false)
  const [editModal, setEditModal] = useState<{
    open: boolean
    division: Division | null
  }>({ open: false, division: null })
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean
    division: Division | null
  }>({ open: false, division: null })

  const handleCreateSuccess = (newDivision: Division) => {
    setDivisions(prev => [newDivision, ...prev])
    setCreateModal(false)
  }

  const handleEditSuccess = (updatedDivision: Division) => {
    setDivisions(prev => prev.map(d => 
      d.id === updatedDivision.id ? updatedDivision : d
    ))
    setEditModal({ open: false, division: null })
  }

  const handleDeleteSuccess = (divisionId: string) => {
    setDivisions(prev => prev.filter(d => d.id !== divisionId))
    setDeleteModal({ open: false, division: null })
  }

  const handleToggleStatus = async (divisionId: string, newStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/divisions/toggle', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ divisionId, isActive: newStatus })
      })

      const result = await response.json()
      
      if (result.success) {
        setDivisions(prev => prev.map(d => 
          d.id === divisionId ? { ...d, isActive: newStatus } : d
        ))
        alert(`Divisi berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}!`)
      } else {
        alert(result.message || 'Gagal mengubah status divisi')
      }
    } catch (error) {
      console.error('Toggle division status error:', error)
      alert('Terjadi kesalahan saat mengubah status divisi')
    }
  }

  const filteredDivisions = divisions.filter(division => {
    const matchesSearch = division.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         division.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         false
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && division.isActive) ||
                         (statusFilter === 'inactive' && !division.isActive)
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (isActive: boolean) => {
    return isActive 
      ? { label: '✅ Aktif', color: 'bg-green-100 text-green-800' }
      : { label: '❌ Non-Aktif', color: 'bg-red-100 text-red-800' }
  }

  const canEditDivision = () => {
    // HRD, CEO, ADMIN can edit divisions
    return ['HRD', 'CEO', 'ADMIN'].includes(currentUserRole)
  }

  const canDeleteDivision = (division: Division) => {
    // Only ADMIN can delete divisions, and only if no users or projects
    return currentUserRole === 'ADMIN' && division.userCount === 0 && division.projectCount === 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Link href="/admin/divisions">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Kembali
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Divisi</h1>
          </div>
          <p className="text-gray-600">
            Kelola divisi perusahaan, tambah divisi baru, dan atur struktur organisasi
          </p>
        </div>
        {canEditDivision() && (
          <Button 
            onClick={() => setCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Divisi
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Cari nama atau deskripsi divisi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Status Filter */}
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                Semua
              </Button>
              <Button
                variant={statusFilter === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('active')}
              >
                Aktif
              </Button>
              <Button
                variant={statusFilter === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('inactive')}
              >
                Non-Aktif
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Divisions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Daftar Divisi ({filteredDivisions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDivisions.length === 0 ? (
            <div className="text-center py-8">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Tidak ada divisi yang ditemukan</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredDivisions.map((division) => (
                <Card key={division.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    {/* Division Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                          style={{ backgroundColor: division.color || '#3B82F6' }}
                        >
                          {division.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{division.name}</h3>
                          <Badge className={getStatusBadge(division.isActive).color}>
                            {getStatusBadge(division.isActive).label}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {division.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {division.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex gap-4 mb-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{division.userCount} Karyawan</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FolderOpen className="w-4 h-4" />
                        <span>{division.projectCount} Project</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t">
                      {canEditDivision() && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditModal({ open: true, division })}
                          className="flex-1"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                      )}
                      
                      {canEditDivision() && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(division.id, !division.isActive)}
                          className={division.isActive 
                            ? "text-orange-600 hover:text-orange-700" 
                            : "text-green-600 hover:text-green-700"
                          }
                        >
                          {division.isActive ? (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" />
                              Nonaktif
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              Aktifkan
                            </>
                          )}
                        </Button>
                      )}

                      {canDeleteDivision(division) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteModal({ open: true, division })}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>

                    {/* Delete Warning */}
                    {division.userCount > 0 || division.projectCount > 0 ? (
                      <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                        ⚠️ Tidak dapat dihapus (ada karyawan/project)
                      </p>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateDivisionModal
        open={createModal}
        onClose={() => setCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditDivisionModal
        open={editModal.open}
        division={editModal.division}
        onClose={() => setEditModal({ open: false, division: null })}
        onSuccess={handleEditSuccess}
      />

      <DeleteDivisionModal
        open={deleteModal.open}
        division={deleteModal.division}
        onClose={() => setDeleteModal({ open: false, division: null })}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  )
}