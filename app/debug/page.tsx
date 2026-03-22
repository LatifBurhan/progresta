'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugPage() {
  const [debugResult, setDebugResult] = useState<any>(null)
  const [createResult, setCreateResult] = useState<any>(null)
  const [loginResult, setLoginResult] = useState<any>(null)
  const [envResult, setEnvResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('bahfil@gmail.com')
  const [password, setPassword] = useState('123456')
  const [name, setName] = useState('Bahfil Test')
  const [role, setRole] = useState('Karyawan')
  const [errors, setErrors] = useState<string[]>([])

  const addError = (error: string) => {
    setErrors(prev => [...prev, `${new Date().toLocaleTimeString()}: ${error}`])
  }

  const clearErrors = () => {
    setErrors([])
    setDebugResult(null)
    setCreateResult(null)
    setLoginResult(null)
    setEnvResult(null)
  }

  const debugAuth = async () => {
    setLoading(true)
    addError('Starting auth debug...')
    try {
      const response = await fetch(`/api/debug/auth?email=${encodeURIComponent(email)}`)
      const result = await response.json()
      
      if (!response.ok) {
        addError(`Debug API failed: ${response.status} ${response.statusText}`)
        addError(`Response: ${JSON.stringify(result)}`)
      } else {
        addError('Debug API successful')
      }
      
      setDebugResult(result)
    } catch (error: any) {
      addError(`Debug fetch error: ${error.message}`)
      setDebugResult({ error: 'Failed to debug auth', details: error.message })
    }
    setLoading(false)
  }

  const createTestUser = async () => {
    setLoading(true)
    addError('Starting user creation...')
    try {
      const response = await fetch('/api/debug/create-test-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role })
      })
      const result = await response.json()
      
      if (!response.ok) {
        addError(`Create user API failed: ${response.status} ${response.statusText}`)
        addError(`Response: ${JSON.stringify(result)}`)
      } else {
        addError('Create user API successful')
      }
      
      setCreateResult(result)
    } catch (error: any) {
      addError(`Create user fetch error: ${error.message}`)
      setCreateResult({ error: 'Failed to create test user', details: error.message })
    }
    setLoading(false)
  }

  const testLogin = async () => {
    setLoading(true)
    addError('Starting login test...')
    try {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)

      const response = await fetch('/api/auth/test-actual-login', {
        method: 'POST',
        body: formData
      })
      const result = await response.json()
      
      if (!response.ok) {
        addError(`Login test API failed: ${response.status} ${response.statusText}`)
        addError(`Response: ${JSON.stringify(result)}`)
      } else {
        addError('Login test API successful')
      }
      
      setLoginResult(result)
    } catch (error: any) {
      addError(`Login test fetch error: ${error.message}`)
      setLoginResult({ error: 'Login test failed', details: error.message })
    }
    setLoading(false)
  }

  const testActualLogin = async () => {
    setLoading(true)
    addError('Testing actual login action...')
    try {
      // Import and test the actual login action
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)

      const response = await fetch('/api/auth/login-debug', {
        method: 'POST',
        body: formData
      })
      const result = await response.json()
      
      if (!response.ok) {
        addError(`Actual login failed: ${response.status} ${response.statusText}`)
        addError(`Response: ${JSON.stringify(result)}`)
      } else {
        addError('Actual login successful')
      }
      
      setLoginResult({ ...loginResult, actualLogin: result })
    } catch (error: any) {
      addError(`Actual login error: ${error.message}`)
      setLoginResult({ ...loginResult, actualLogin: { error: error.message } })
    }
    setLoading(false)
  }

  const checkEnvironment = async () => {
    setLoading(true)
    addError('Checking environment variables...')
    try {
      const response = await fetch('/api/debug/env')
      const result = await response.json()
      
      if (!response.ok) {
        addError(`Environment check failed: ${response.status} ${response.statusText}`)
      } else {
        addError('Environment check completed')
      }
      
      setEnvResult(result)
    } catch (error: any) {
      addError(`Environment check error: ${error.message}`)
      setEnvResult({ error: 'Failed to check environment', details: error.message })
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">🔧 Debug Authentication System</h1>
      
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Test User Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="test@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Test User"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Karyawan">Karyawan</option>
                <option value="PM">PM</option>
                <option value="HRD">HRD</option>
                <option value="CEO">CEO</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button onClick={checkEnvironment} disabled={loading} variant="secondary">
          ⚙️ Check Environment
        </Button>
        <Button onClick={debugAuth} disabled={loading} variant="outline">
          🔍 Debug Auth System
        </Button>
        <Button onClick={createTestUser} disabled={loading} variant="outline">
          ➕ Create Test User
        </Button>
        <Button onClick={testLogin} disabled={loading} variant="outline">
          🔑 Test Login API
        </Button>
        <Button onClick={testActualLogin} disabled={loading} variant="outline">
          🚀 Test Actual Login
        </Button>
        <Button onClick={clearErrors} variant="destructive" size="sm">
          🗑️ Clear All
        </Button>
      </div>

      {/* Real-time Errors */}
      {errors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>🚨 Real-time Errors & Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-60 overflow-auto">
              {errors.map((error, index) => (
                <div key={index} className="mb-1">{error}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Environment Results */}
      {envResult && (
        <Card>
          <CardHeader>
            <CardTitle>⚙️ Environment Check Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(envResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Debug Results */}
      {debugResult && (
        <Card>
          <CardHeader>
            <CardTitle>🔍 Debug Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(debugResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Create Results */}
      {createResult && (
        <Card>
          <CardHeader>
            <CardTitle>➕ Create/Login Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(createResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Login Results */}
      {loginResult && (
        <Card>
          <CardHeader>
            <CardTitle>🔑 Login Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
              {JSON.stringify(loginResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Step-by-Step Debugging Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="bg-blue-50 p-3 rounded">
            <p><strong>🎯 TUJUAN:</strong> Mencari tahu kenapa user tidak bisa login</p>
          </div>
          
          <div className="space-y-2">
            <p><strong>1. ⚙️ Check Environment:</strong> Pastikan semua environment variables dikonfigurasi dengan benar</p>
            <p><strong>2. 🔍 Debug Auth System:</strong> Cek apakah user ada di database dan Supabase Auth</p>
            <p><strong>3. ➕ Create Test User:</strong> Buat user baru dengan sistem yang benar</p>
            <p><strong>4. 🔑 Test Login API:</strong> Test login dengan API langsung</p>
            <p><strong>5. 🚀 Test Actual Login:</strong> Test dengan login action yang sebenarnya</p>
          </div>

          <div className="bg-yellow-50 p-3 rounded">
            <p><strong>⚠️ PENTING:</strong> Jalankan step by step dan screenshot hasil JSON untuk setiap error!</p>
          </div>

          <div className="bg-green-50 p-3 rounded">
            <p><strong>📱 CARA SCREENSHOT:</strong></p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Klik tombol satu per satu</li>
              <li>Tunggu sampai muncul hasil JSON</li>
              <li>Screenshot bagian "Real-time Errors & Logs" (yang hitam)</li>
              <li>Screenshot hasil JSON di setiap card</li>
              <li>Kirim semua screenshot ke developer</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}