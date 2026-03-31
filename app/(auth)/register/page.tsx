'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { registerAction } from '@/app/actions/auth-actions'

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, {
    success: false,
    message: '',
    errors: null,
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            📝 Daftar Akun Baru
          </CardTitle>
          <p className="text-center text-sm text-gray-600">
            Daftar untuk bergabung dengan tim Progresta
          </p>
        </CardHeader>
        
        <CardContent>
          <form action={formAction} className="space-y-4">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap *
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Masukkan nama lengkap"
                className={state.errors?.name ? 'border-red-500' : ''}
              />
              {state.errors?.name && (
                <p className="text-red-500 text-xs mt-1">{state.errors.name[0]}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="nama@email.com"
                className={state.errors?.email ? 'border-red-500' : ''}
              />
              {state.errors?.email && (
                <p className="text-red-500 text-xs mt-1">{state.errors.email[0]}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Minimal 6 karakter"
                className={state.errors?.password ? 'border-red-500' : ''}
              />
              {state.errors?.password && (
                <p className="text-red-500 text-xs mt-1">{state.errors.password[0]}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Telepon
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="08xxxxxxxxxx"
                className={state.errors?.phone ? 'border-red-500' : ''}
              />
              {state.errors?.phone && (
                <p className="text-red-500 text-xs mt-1">{state.errors.phone[0]}</p>
              )}
            </div>

            {/* Position Field */}
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                Posisi/Jabatan
              </label>
              <Input
                id="position"
                name="position"
                type="text"
                placeholder="Frontend Developer, UI/UX Designer, dll"
                className={state.errors?.position ? 'border-red-500' : ''}
              />
              {state.errors?.position && (
                <p className="text-red-500 text-xs mt-1">{state.errors.position[0]}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={pending}
            >
              {pending ? 'Mendaftar...' : '📝 Daftar Sekarang'}
            </Button>

            {/* Success/Error Messages */}
            {state.message && (
              <div className={`p-3 rounded-lg text-sm ${
                state.success 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {state.success && <span className="mr-2">✅</span>}
                {!state.success && <span className="mr-2">❌</span>}
                {state.message}
              </div>
            )}

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="text-blue-600 text-lg">ℹ️</span>
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">Catatan Penting:</p>
                  <ul className="space-y-1">
                    <li>• Akun baru memerlukan persetujuan Admin/General Affair</li>
                    <li>• Anda akan diberikan role dan divisi setelah disetujui</li>
                    <li>• Proses approval biasanya 1-2 hari kerja</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                Sudah punya akun?{' '}
                <Link 
                  href="/login" 
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Login di sini
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
