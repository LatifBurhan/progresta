'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { 
  Building, Users, FolderOpen, Search, Plus, 
  Edit, Trash2, ArrowLeft, Eye, EyeOff, Loader2
} from 'lucide-react'
import CreateDivisionModal from './CreateDivisionModal'
import EditDivisionModal from './EditDivisionModal'
import DeleteDivisionModal from './DeleteDivisionModal'
import { useToast } from '@/components/ui/use-toast'

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
  department_id?: string
  departments?: {
    id: string
    name: string
    color: string
  }
}

interface DivisionManagementClientProps {
  divisions: Division[]
  currentUserRole: string
}

export default function DivisionManagementClient({ divisions: initialDivisions, currentUserRole }: DivisionManagementClientProps) {
  const [divisions, setDivisions] = useState(initialDivisions)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [createModal, setCreateModal] = useState(false)
  const [editModal, setEditModal] = useState<{ open: boolean; division: Division | null }>({ open: false, division: null })
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; division: Division | null }>({ open: false, division: null })
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const { toast } = useToast()

  const filteredDivisions = divisions.filter(division => {
    const matchesSearch = division.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         division.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && division.isActive) || 
                         (statusFilter === 'inactive' && !division.isActive)
    return matchesSearch && matchesStatus
  })

  const handleCreateSuccess = (newDivision: Division) => {
    setDivisions(prev => [newDivision, ...prev])
  }

  const handleEditSuccess = (updatedDivision: Division) => {
    setDivisions(prev => prev.map(d => d.id === updatedDivision.id ? updatedDivision : d))
  }

  const handleDeleteSuccess = (deletedDivisionId: string) => {
    setDivisions(prev => prev.filter(d => d.id !== deletedDivisionId))
  }

  const handleToggleStatus = async (divisionId: string, currentStatus: boolean, divisionName: string, userCount: number) => {
    const newStatus = !currentStatus
    
    // Validasi: tidak bisa nonaktifkan divisi yang masih punya user
    if (!newStatus && userCount > 0) {
      toast({
        title: "Tidak dapat menonaktifkan divisi",
        description: `Divisi "${divisionName}" masih memiliki ${userCount} karyawan aktif. Pindahkan semua karyawan ke divisi lain terlebih dahulu.`,
        variant: "destructive"
      })
      return
    }

    setTogglingId(divisionId)
    
    try {
      const response = await fetch('/api/admin/divisions/toggle', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ divisionId, isActive: newStatus })
      })
      
      const result = await response.json()
      
      if (response.ok && result.success) {
        setDivisions(prev => prev.map(d => 
          d.id === divisionId ? { ...d, isActive: newStatus } : d
        ))
        
        toast({
          title: "Berhasil!",
          description: result.message || `Divisi "${divisionName}" berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`,
          variant: "default"
        })
      } else {
        toast({
          title: "Gagal",
          description: result.message || "Terjadi kesalahan saat mengubah status divisi",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Toggle status error:', error)
      toast({
        title: "Error",
        description: "Terjadi kesalahan sistem. Silakan coba lagi.",
        variant: "destructive"
      })
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/admin/overview">
              <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm border border-slate-200">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Data Departemen</h1>
          </div>
          <p className="text-base font-medium text-slate-500">Kelola struktur organisasi dan distribusi personel Al-Wustho.</p>
        </div>

        {['HRD', 'CEO', 'ADMIN', 'GENERAL_AFFAIR'].includes(currentUserRole) && (
          <Button 
            onClick={() => setCreateModal(true)}
            className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xl shadow-blue-200 gap-3 active:scale-95 transition-all text-base"
          >
            <Plus className="w-6 h-6" />
            <span>Tambah Divisi Baru</span>
          </Button>
        )}
      </div>

      {/* Control Panel (Search & Filter) */}
      <div className="flex flex-col lg:flex-row gap-4 bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <Input
            placeholder="Cari nama divisi atau deskripsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 rounded-2xl border-none bg-slate-50 focus:ring-4 focus:ring-blue-50 transition-all text-base font-medium"
          />
        </div>
        
        <div className="flex bg-slate-100 p-1.5 rounded-2xl">
          {(['all', 'active', 'inactive'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                statusFilter === s ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {s === 'all' ? 'Semua' : s === 'active' ? 'Operational' : 'Non-Active'}
            </button>
          ))}
        </div>
      </div>

      {/* List Layout (Menggantikan Card-Grid) */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50 text-slate-400 font-black text-[11px] uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Divisi & Informasi</th>
                <th className="px-8 py-6">Personnel</th>
                <th className="px-8 py-6">Projects</th>
                <th className="px-8 py-6 text-right">Aksi Terintegrasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDivisions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <Building className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Data Tidak Ditemukan</p>
                  </td>
                </tr>
              ) : (
                filteredDivisions.map((division) => (
                  <tr key={division.id} className="group hover:bg-slate-50/50 transition-colors">
                    {/* Divisi & Info */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-5">
                        <div 
                          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shrink-0"
                          style={{ backgroundColor: division.color || '#3B82F6' }}
                        >
                          {division.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-extrabold text-slate-900 text-lg md:text-xl group-hover:text-blue-600 transition-colors">
                            {division.name}
                          </h3>
                          <div className="flex items-center gap-3 flex-wrap">
                            {division.departments && (
                              <span 
                                className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded text-white"
                                style={{ backgroundColor: division.departments.color || '#3B82F6' }}
                              >
                                {division.departments.name}
                              </span>
                            )}
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                              division.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                              {division.isActive ? 'Active' : 'Disabled'}
                            </span>
                            {division.description && (
                              <p className="text-sm text-slate-400 font-medium line-clamp-1">{division.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Personnel Count */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                          <Users className="w-5 h-5" />
                        </div>
                        <span className="text-lg font-black text-slate-700">{division.userCount}</span>
                      </div>
                    </td>

                    {/* Project Count */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                          <FolderOpen className="w-5 h-5" />
                        </div>
                        <span className="text-lg font-black text-slate-700">{division.projectCount}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setEditModal({ open: true, division })}
                          className="rounded-xl h-12 px-5 font-bold border-slate-100 hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                        >
                          <Edit className="w-4 h-4 mr-2" /> Settings
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleToggleStatus(division.id, division.isActive, division.name, division.userCount)}
                          disabled={togglingId === division.id}
                          className={`h-12 w-12 rounded-xl border-slate-100 transition-all ${
                            togglingId === division.id 
                              ? "opacity-50 cursor-not-allowed" 
                              : division.isActive 
                                ? "text-amber-500 hover:bg-amber-50" 
                                : "text-emerald-500 hover:bg-emerald-50"
                          }`}
                          title={division.isActive ? "Nonaktifkan divisi" : "Aktifkan divisi"}
                        >
                          {togglingId === division.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : division.isActive ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </Button>

                        {['ADMIN', 'CEO', 'GENERAL_AFFAIR'].includes(currentUserRole) && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setDeleteModal({ open: true, division })}
                            className={`h-12 w-12 rounded-xl border-slate-100 transition-all ${
                              division.userCount === 0 && division.projectCount === 0
                                ? 'text-rose-500 hover:bg-rose-50 hover:text-rose-600'
                                : 'text-rose-300 hover:bg-rose-50 hover:text-rose-400'
                            }`}
                            title={
                              division.userCount > 0 || division.projectCount > 0
                                ? `Divisi masih memiliki ${division.userCount} karyawan dan ${division.projectCount} project`
                                : 'Hapus divisi'
                            }
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals tetap sama ... */}
      <CreateDivisionModal open={createModal} onClose={() => setCreateModal(false)} onSuccess={handleCreateSuccess} />
      <EditDivisionModal open={editModal.open} division={editModal.division} onClose={() => setEditModal({ open: false, division: null })} onSuccess={handleEditSuccess} />
      <DeleteDivisionModal open={deleteModal.open} division={deleteModal.division} onClose={() => setDeleteModal({ open: false, division: null })} onSuccess={handleDeleteSuccess} />
    </div>
  )
}