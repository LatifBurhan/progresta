'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, UserPlus, Eye, EyeOff, ShieldCheck, Phone, Briefcase, Mail, Loader2, Sparkles, Hash } from 'lucide-react'

interface Division {
  id: string
  name: string
  color: string | null
}

interface CreateUserModalProps {
  open: boolean
  divisions: Division[]
  onClose: () => void
}

export default function CreateUserModal({ open, divisions, onClose }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    position: '',
    role: 'STAFF',
    divisionId: ''
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.password || !formData.name || !formData.divisionId) {
      setError('Mohon lengkapi semua field wajib (*)')
      return
    }
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const result = await response.json()
      if (result.success) {
        onClose()
        window.location.reload()
      } else {
        setError(result.message || 'Gagal membuat user')
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi sistem')
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    { value: 'STAFF', label: 'Staff', icon: '👨‍💻', color: 'blue' },
    { value: 'PM', label: 'Manager', icon: '📊', color: 'emerald' },
    { value: 'GENERAL_AFFAIR', label: 'General Affair', icon: '👥', color: 'indigo' },
    { value: 'CEO', label: 'CEO', icon: '👑', color: 'purple' }
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop: Darker with stronger blur for focus */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Container: Full width on mobile, max-height focus */}
      <div className="relative bg-white w-full sm:max-w-lg h-[92vh] sm:h-auto sm:max-h-[90vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-500">
        
        {/* Mobile Indicator Bar */}
        <div className="sm:hidden flex justify-center py-4 shrink-0 bg-white">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
        </div>

        {/* Header: Fixed at top */}
        <div className="px-8 pb-5 flex items-center justify-between border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200 ring-4 ring-blue-50">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Tambah Anggota</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Sistem Database Karyawan</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar bg-white">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in shake duration-300">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
              <p className="text-xs font-bold leading-tight">{error}</p>
            </div>
          )}

          <form id="create-user-form" onSubmit={handleSubmit} className="space-y-10">
            
            {/* Group 1: Kredensial */}
            <section className="space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-500 rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Autentikasi</span>
              </div>
              
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Email Perusahaan *</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    type="email"
                    className="pl-11 h-13 rounded-xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all text-sm md:text-base"
                    placeholder="ex: Latif@al-wustho.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Password *</Label>
                <div className="relative group">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    className="pl-11 pr-12 h-13 rounded-xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-sm md:text-base"
                    placeholder="Minimal 6 karakter"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-300 hover:text-slate-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </section>

            {/* Group 2: Biodata */}
            <section className="space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-emerald-500 rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Biodata</span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Nama Lengkap *</Label>
                <Input
                  className="h-13 rounded-xl border-slate-100 bg-slate-50 focus:bg-white transition-all text-sm md:text-base"
                  placeholder="Nama Lengkap Karyawan"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-wider">No. WhatsApp</Label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
                    <Input
                      className="pl-11 h-13 rounded-xl border-slate-100 bg-slate-50 text-sm md:text-base"
                      placeholder="08..."
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Jabatan</Label>
                  <div className="relative group">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <Input
                      className="pl-11 h-13 rounded-xl border-slate-100 bg-slate-50 text-sm md:text-base"
                      placeholder="e.g. Senior Dev"
                      value={formData.position}
                      onChange={(e) => setFormData({...formData, position: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Group 3: Penugasan */}
            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-indigo-500 rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Penugasan & Role</span>
              </div>

              <div className="space-y-3">
                <Label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Otoritas Sistem *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setFormData({...formData, role: r.value})}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left group ${
                        formData.role === r.value 
                        ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200' 
                        : 'border-slate-50 bg-slate-50 text-slate-500 hover:border-slate-200 active:scale-95'
                      }`}
                    >
                      <span className={`text-xl transition-transform group-hover:scale-125 ${formData.role === r.value ? 'scale-110' : ''}`}>
                        {r.icon}
                      </span>
                      <span className="text-[11px] font-black uppercase tracking-tight">{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[11px] font-bold text-slate-500 ml-1 uppercase tracking-wider">Penempatan Divisi *</Label>
                <div className="flex flex-wrap gap-2">
                  {divisions.map((div) => (
                    <button
                      key={div.id}
                      type="button"
                      onClick={() => setFormData({...formData, divisionId: div.id})}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 transition-all active:scale-95 ${
                        formData.divisionId === div.id
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xl'
                        : 'border-slate-100 bg-white text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <Hash className={`w-3 h-3 ${formData.divisionId === div.id ? 'text-blue-400' : 'text-slate-200'}`} />
                      {div.name}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </form>
        </div>

        {/* Footer: Action Buttons (Sticky at bottom) */}
        <div className="p-6 sm:p-8 bg-white border-t border-slate-50 shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              form="create-user-form"
              disabled={loading}
              className="flex-[2] h-15 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-100 transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:translate-y-0"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Memproses...</>
              ) : (
                'Daftarkan Anggota'
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-15 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 active:scale-95"
            >
              Batal
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}