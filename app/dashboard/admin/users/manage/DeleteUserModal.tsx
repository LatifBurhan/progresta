'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Trash2, AlertTriangle, ShieldAlert } from 'lucide-react'

interface UserData {
  id: string
  email: string
  role: string
  status: string
  createdAt: string
  divisionId: string | null
  profile: {
    name: string | null
    fotoProfil: string | null
    phone: string | null
    position: string | null
  } | null
  division?: {
    name: string
    color: string | null
  } | null
}

interface DeleteUserModalProps {
  open: boolean
  user: UserData | null
  onClose: () => void
  onSuccess: (userId: string) => void
}

export default function DeleteUserModal({ 
  open, 
  user, 
  onClose, 
  onSuccess 
}: DeleteUserModalProps) {
  const [loading, setLoading] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [error, setError] = useState('')

  if (!open || !user) return null

  const handleDelete = async () => {
    if (confirmText !== 'HAPUS') {
      setError('Ketik "HAPUS" untuk mengkonfirmasi')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/users/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      const result = await response.json()

      if (result.success) {
        onSuccess(user.id)
        handleClose()
      } else {
        setError(result.message || 'Gagal menghapus user')
      }
    } catch (error) {
      setError('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setConfirmText('')
    setError('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={handleClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-[2rem] max-w-lg w-full shadow-2xl animate-in zoom-in slide-in-from-bottom-10 duration-500">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-white rounded-t-[2rem]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-100 ring-4 ring-rose-50">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Hapus User Permanen</h2>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-widest">Tindakan Tidak Dapat Dibatalkan</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2.5 rounded-full bg-slate-50 text-slate-400 hover:text-rose-500 transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          {/* Critical Warning */}
          <div className="p-6 bg-rose-50 border-2 border-rose-200 rounded-2xl">
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <div className="w-12 h-12 rounded-xl bg-rose-600 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <h4 className="font-black text-rose-900 text-lg uppercase tracking-tight">Peringatan Kritis!</h4>
                <p className="text-sm font-semibold text-rose-700 leading-relaxed">
                  Anda akan menghapus user berikut secara <span className="font-black">PERMANEN</span> dari sistem:
                </p>
                
                {/* User Info Card */}
                <div className="bg-white p-4 rounded-xl border border-rose-200 shadow-sm space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-rose-700 flex items-center justify-center text-white text-lg font-black">
                      {(user.profile?.name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-900 truncate">
                        {user.profile?.name || user.email.split('@')[0]}
                      </p>
                      <p className="text-xs font-medium text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-black px-2 py-1 rounded bg-slate-100 text-slate-600 uppercase tracking-wider">
                      {user.role}
                    </span>
                    {user.division && (
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-blue-50 text-blue-600 uppercase tracking-tight">
                        {user.division.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                    <p className="text-xs font-bold text-rose-700">
                      User akan dihapus dari sistem autentikasi dan database
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                    <p className="text-xs font-bold text-rose-700">
                      Profil, akses, dan data personal akan hilang permanen
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                    <p className="text-xs font-bold text-rose-700">
                      Laporan yang dibuat user akan tetap ada (tidak terhapus)
                    </p>
                  </div>
                </div>

                <p className="text-sm font-black text-rose-900 pt-2 uppercase tracking-tight">
                  ⚠️ Tindakan ini tidak dapat dibatalkan!
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-600 animate-in shake duration-300">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {/* Confirmation Input */}
          <div className="space-y-3">
            <label className="block text-sm font-black text-slate-700 uppercase tracking-tight">
              Ketik <span className="text-rose-600 font-black text-base">"HAPUS"</span> untuk mengkonfirmasi:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-rose-100 focus:border-rose-500 transition-all text-base font-bold text-center uppercase tracking-widest"
              placeholder="Ketik HAPUS"
              disabled={loading}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 rounded-b-[2rem]">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-12 rounded-xl font-bold text-sm uppercase tracking-widest border-slate-200"
              disabled={loading}
            >
              Batalkan
            </Button>
            <Button
              onClick={handleDelete}
              className="flex-1 h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm uppercase tracking-widest shadow-lg shadow-rose-100 transition-all disabled:opacity-50"
              disabled={loading || confirmText !== 'HAPUS'}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menghapus...</span>
                </div>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Hapus Permanen
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}