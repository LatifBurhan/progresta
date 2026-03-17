'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Trash2, Users, FolderOpen } from 'lucide-react'
import DivisionModal from './DivisionModal'
import { useToast } from '@/components/ui/use-toast'

interface Division {
  id: string
  name: string
  description: string | null
  color: string
  userCount: number
  projectCount: number
  createdAt: string
  updatedAt: string
}

export default function DivisionsPageClient() {
  const [divisions, setDivisions] = useState<Division[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDivision, setEditingDivision] = useState<Division | null>(null)
  const { toast } = useToast()

  const fetchDivisions = async () => {
    try {
      const response = await fetch('/api/divisions')
      const data = await response.json()
      
      if (data.success) {
        setDivisions(data.divisions)
      } else {
        toast({
          title: "Error",
          description: data.message || "Gagal memuat divisi",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching divisions:', error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat memuat divisi",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (division: Division) => {
    if (division.userCount > 0 || division.projectCount > 0) {
      toast({
        title: "Tidak dapat menghapus",
        description: `Divisi masih memiliki ${division.userCount} karyawan dan ${division.projectCount} project`,
        variant: "destructive"
      })
      return
    }

    if (!confirm(`Yakin ingin menghapus divisi "${division.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/divisions?id=${division.id}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Berhasil",
          description: data.message
        })
        fetchDivisions()
      } else {
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting division:', error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus divisi",
        variant: "destructive"
      })
    }
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingDivision(null)
  }

  const handleModalSuccess = () => {
    handleModalClose()
    fetchDivisions()
  }

  useEffect(() => {
    fetchDivisions()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1">
            {divisions.length} Divisi
          </Badge>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Divisi
        </Button>
      </div>

      {/* Divisions Grid */}
      {divisions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada divisi</h3>
            <p className="text-gray-500 text-center mb-4">
              Mulai dengan membuat divisi pertama untuk mengorganisir tim Anda
            </p>
            <Button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Buat Divisi Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {divisions.map((division) => (
            <Card key={division.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: division.color }}
                    />
                    <CardTitle className="text-lg">{division.name}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingDivision(division)
                        setIsModalOpen(true)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(division)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {division.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {division.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{division.userCount} Karyawan</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <FolderOpen className="w-4 h-4" />
                    <span>{division.projectCount} Project</span>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 pt-2 border-t">
                  Dibuat: {new Date(division.createdAt).toLocaleDateString('id-ID')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Division Modal */}
      <DivisionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        division={editingDivision}
      />
    </div>
  )
}