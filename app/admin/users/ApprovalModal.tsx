'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  Building2, 
  Loader2, 
  Sparkles, 
  Info,
  CalendarDays
} from 'lucide-react'

interface UserData {
  id: string
  email: string
  role: string
  status: string
  createdAt: string
  profile: {
    name: string | null
    fotoProfil: string | null
    phone: string | null
    position: string | null
  } | null
}

interface Division {
  id: string
  name: string
  color: string | null
}

interface ApprovalModalProps {
  open: boolean
  user: UserData | null
  divisions: Division[]
  onClose: () => void
  onApprove: (userId: string, role: string, divisionId: string) => void
}

export default function ApprovalModal({ 
  open, 
  user, 
  divisions, 
  onClose, 
  onApprove 
}: ApprovalModalProps) {
  const [selectedRole, setSelectedRole] = useState('KARYAWAN')
  const [selectedDivision, setSelectedDivision] = useState('')
  const [loading, setLoading] = useState(false)
  const [showError, setShowError] = useState(false)

  if (!open || !user) return null

  const handleApprove = async () => {
    if (!selectedDivision) {
      setShowError(true)
      setTimeout(() => setShowError(false), 2000)
      return
    }
    setLoading(true)
    try {
      await onApprove(user.id, selectedRole, selectedDivision)
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    { value: 'KARYAWAN', label: 'Staff', icon: '👨‍💻', desc: 'Akses Pelaporan' },
    { value: 'PM', label: 'Manager', icon: '📊', desc: 'Lead Project' },
    { value: 'HRD', label: 'HRD', icon: '👥', desc: 'People Ops' },
    { value: 'CEO', label: 'CEO', icon: '👑', desc: 'Full Access' }
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div className={`relative bg-white w-full sm:max-w-lg h-[94vh] sm:h-auto sm:max-h-[90vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-500 ${showError ? 'shake' : ''}`}>
        
        <div className="sm:hidden flex justify-center py-3 shrink-0">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-8 pt-2 pb-6 flex items-center justify-between border-b border-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-100 ring-4 ring-emerald-50">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1">Verifikasi Akun</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Sistem Manajemen Personel</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar space-y-8">
          
          {/* 1. User Insight Card */}
          <div className="relative overflow-hidden group p-5 bg-gradient-to-br from-slate-50 to-white rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex items-start gap-4 relative z-10">
              {user.profile?.fotoProfil ? (
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md shrink-0">
                  <Image src={user.profile.fotoProfil} alt="profile" fill className="object-cover" unoptimized />
                </div>
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shrink-0">
                  {(user.profile?.name || user.email).charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <h4 className="font-black text-slate-900 truncate text-lg">
                  {user.profile?.name || user.email.split('@')[0]}
                </h4>
                <div className="flex flex-wrap gap-2 mt-1">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase">
                    <CalendarDays className="w-3 h-3" />
                    Daftar: {formatDate(user.createdAt)}
                  </div>
                </div>
                {user.profile?.position && (
                  <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-black text-blue-600 uppercase tracking-wider shadow-sm">
                    <Info className="w-3 h-3" /> {user.profile.position}
                  </div>
                )}
              </div>
            </div>
            {/* Background Accent */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          </div>

          <div className="space-y-8 px-1">
            {/* 2. Role Selector */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-4 h-4 text-indigo-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Otoritas Akses</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => setSelectedRole(role.value)}
                    className={`group relative flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                      selectedRole === role.value 
                      ? 'border-blue-600 bg-blue-50/50 text-blue-700 ring-4 ring-blue-50 shadow-md shadow-blue-100/50' 
                      : 'border-slate-50 bg-slate-50/30 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    <span className={`text-xl transition-transform duration-300 ${selectedRole === role.value ? 'scale-110' : 'group-hover:scale-110'}`}>
                      {role.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-tight leading-none">{role.label}</p>
                      <p className="text-[9px] opacity-60 mt-1 truncate font-medium">{role.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* 3. Division Selector */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Penempatan Divisi</span>
                </div>
                {selectedDivision && (
                  <span className="text-[9px] font-black text-emerald-500 uppercase animate-in fade-in zoom-in">Terpilih</span>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2.5">
                {divisions.length > 0 ? (
                  divisions.map((division) => (
                    <button
                      key={division.id}
                      onClick={() => setSelectedDivision(division.id)}
                      className={`relative px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all active:scale-95 ${
                        selectedDivision === division.id
                        ? 'border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-200 ring-4 ring-slate-100'
                        : 'border-slate-100 bg-white text-slate-400 hover:border-slate-300'
                      }`}
                      style={selectedDivision !== division.id ? { color: division.color || '#64748b' } : {}}
                    >
                      {division.name}
                    </button>
                  ))
                ) : (
                  <div className="w-full p-4 rounded-xl border-2 border-dashed border-slate-100 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Data divisi kosong</p>
                  </div>
                )}
              </div>

              <div className={`mt-4 overflow-hidden transition-all duration-300 ${!selectedDivision ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg text-amber-600">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  <p className="text-[9px] font-black uppercase tracking-tight">Admin wajib menentukan divisi personel</p>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 md:p-8 bg-white border-t border-slate-50 flex gap-3 shrink-0">
          <Button
            onClick={onClose}
            variant="ghost"
            className="flex-1 h-15 rounded-2xl font-bold text-slate-400 hover:bg-slate-50 active:scale-95 transition-all"
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            onClick={handleApprove}
            className={`flex-[2] h-15 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-100 transition-all active:scale-[0.98] disabled:opacity-50 disabled:translate-y-0 ${!selectedDivision ? 'opacity-40 grayscale-[0.5]' : 'hover:-translate-y-1'}`}
            disabled={loading || !selectedDivision}
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Memproses...</>
            ) : (
              'Aktivasi User'
            )}
          </Button>
        </div>
      </div>

      <style jsx>{`
        .shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </div>
  )
}