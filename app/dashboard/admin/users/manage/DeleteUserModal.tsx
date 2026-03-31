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
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl animate-in zoom-in slide-in-from-bottom-10 duration-500">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-lg">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Hapus User Permanen</h2>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Tidak Dapat Dibatalkan</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-rose-500 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Critical Warning */}
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <h4 className="font-bold text-rose-900 text-sm">Peringatan Kritis!</h4>
                <p className="text-xs text-rose-700">
                  Anda akan menghapus user berikut secara <span className="font-bold">PERMANEN</span>:
                </p>
                
                {/* User Info Card */}
                <div className="bg-white p-3 rounded-lg border border-rose-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-600 to-rose-700 flex items-center justify-center text-white text-sm font-bold">
                      {(user.profile?.name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 text-sm truncate">
                        {user.profile?.name || user.email.split('@')[0]}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="flex items-start gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-rose-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-rose-700">User akan dihapus dari sistem</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-rose-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-rose-700">Data personal akan hilang permanen</p>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <AlertTriangle className="w-3 h-3 text-rose-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-rose-700">Laporan user tetap tersimpan</p>
                  </div>
                </div>

                <p className="text-xs font-bold text-rose-900 pt-1">
                  ⚠️ Tindakan ini tidak dapat dibatalkan!
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <p className="text-xs font-bold">{error}</p>
            </div>
          )}

          {/* Confirmation Input */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Ketik <span className="text-rose-600">"HAPUS"</span> untuk mengkonfirmasi:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-500 text-sm font-bold text-center uppercase"
              placeholder="Ketik HAPUS"
              disabled={loading}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-[2rem]">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-10 rounded-lg font-bold text-xs"
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              onClick={handleDelete}
              className="flex-1 h-10 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs disabled:opacity-50"
              disabled={loading || confirmText !== 'HAPUS'}
            >
              {loading ? 'Menghapus...' : 'Hapus Permanen'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}