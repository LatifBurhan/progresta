'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { loginAction } from '@/app/actions/auth-actions'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Check if already logged in
    fetch('/api/auth/check')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          router.push('/dashboard')
        } else {
          setChecking(false)
        }
      })
      .catch(() => setChecking(false))
  }, [router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      // Simple test login for debugging
      if (email === 'alwustho1001@gmail.com' && password === 'test123') {
        // Create a simple session for testing
        await fetch('/api/auth/test-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, role: 'HRD' })
        })
        
        router.push('/dashboard')
        router.refresh()
        return
      }

      const result = await loginAction(null, formData)

      if (result.success) {
        if (result.pending) {
          router.push('/waiting-room')
        } else {
          router.push('/dashboard')
        }
        router.refresh()
      } else if (result.message) {
        setError(result.message)
      }
    } catch (error) {
      setError('Terjadi kesalahan saat login')
    }
    
    setLoading(false)
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl sm:text-2xl text-center">🚀 Progresta</CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Progress & Auto-Attendance System
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="nama@email.com"
                required
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="text-base"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Masuk...' : '🔑 Login'}
            </Button>

            {/* Register Link */}
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600">
                Belum punya akun?{' '}
                <Link 
                  href="/register" 
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Daftar di sini
                </Link>
              </p>
            </div>

            {/* Demo Accounts */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-2">🧪 Test Login:</p>
                <div className="space-y-1">
                  <p><strong>Email:</strong> alwustho1001@gmail.com</p>
                  <p><strong>Password:</strong> test123</p>
                </div>
                <p className="mt-2 text-blue-600">Gunakan kredensial ini untuk testing</p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
