'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus, Eye, EyeOff, Building2, Layers } from 'lucide-react'

interface Department {
  id: string
  name: string
  color: string
}

interface Division {
  id: string
  name: string
  color: string | null
  department_id: string
}

interface CreateUserFormProps {
  divisions: Division[]
}

export default function CreateUserForm({ divisions: allDivisions }: CreateUserFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    position: '',
    employee_status: '',
    address: '',
    notes: '',
    role: 'STAFF',
    departmentId: '',
    divisionId: ''
  })
  const [departments, setDepartments] = useState<Department[]>([])
  const [filteredDivisions, setFilteredDivisions] = useState<Division[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Fetch departments on mount
  useEffect(() => {
    fetchDepartments()
  }, [])

  // Filter divisions when department changes
  useEffect(() => {
    if (formData.departmentId) {
      const filtered = allDivisions.filter(div => div.department_id === formData.departmentId)
      setFilteredDivisions(filtered)
      // Reset division selection if current division is not in filtered list
      if (formData.divisionId && !filtered.find(d => d.id === formData.divisionId)) {
        setFormData(prev => ({ ...prev, divisionId: '' }))
      }
    } else {
      setFilteredDivisions([])
      setFormData(prev => ({ ...prev, divisionId: '' }))
    }
  }, [formData.departmentId, allDivisions])

  const fetchDepartments = async () => {
    setLoadingDepartments(true)
    try {
      const response = await fetch('/api/admin/departments')
      const result = await response.json()
      if (result.success && result.departments) {
        setDepartments(result.departments)
      }
    } catch (error) {
      console.error('Failed to fetch departments:', error)
    } finally {
      setLoadingDepartments(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password || !formData.name || !formData.departmentId || !formData.divisionId) {
      setError('Semua field wajib harus diisi')
      return
    }

    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
          position: formData.position,
          employee_status: formData.employee_status,
          address: formData.address,
          notes: formData.notes,
          role: formData.role,
          divisionId: formData.divisionId
        })
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('User berhasil dibuat! Mengalihkan...')
        // Reset form
        setFormData({
          email: '',
          password: '',
          name: '',
          phone: '',
          position: '',
          employee_status: '',
          address: '',
          notes: '',
          role: 'STAFF',
          departmentId: '',
          divisionId: ''
        })
        // Redirect after 1.5 seconds
        setTimeout(() => {
          router.push('/dashboard/admin/users/manage')
        }, 1500)
      } else {
        setError(result.message || 'Gagal membuat user')
      }
    } catch (error) {
      setError('Terjadi kesalahan sistem')
    } finally {
      setLoading(false)
    }
  }

  const roles = [
    { value: 'STAFF', label: '👨‍💻 Staff', description: 'Akses standar untuk pelaporan' },
    { value: 'PM', label: '📊 Project Manager', description: 'Monitoring project dan tim' },
    { value: 'GENERAL_AFFAIR', label: '👥 General Affair', description: 'Manajemen karyawan dan approval' },
    { value: 'CEO', label: '👑 CEO', description: 'Akses penuh ke semua data' }
  ]

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-600" />
          Tambah User Baru
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="user@company.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Minimal 6 karakter"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <Label htmlFor="name">Nama Lengkap *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nama lengkap karyawan"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone">No. Telepon</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="08xxxxxxxxxx"
              />
            </div>
          </div>

          {/* Position */}
          <div>
            <Label htmlFor="position">Posisi/Jabatan</Label>
            <Input
              id="position"
              type="text"
              value={formData.position}
              onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
              placeholder="Frontend Developer, Marketing, dll"
            />
          </div>

          {/* Employee Status */}
          <div>
            <Label htmlFor="employee_status">Status Karyawan</Label>
            <Input
              id="employee_status"
              type="text"
              value={formData.employee_status}
              onChange={(e) => setFormData(prev => ({ ...prev, employee_status: e.target.value }))}
              placeholder="Tetap, Kontrak, Magang, dll"
            />
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="address">Alamat</Label>
            <textarea
              id="address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Alamat lengkap karyawan"
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes" className="flex items-center gap-2">
              Catatan
              <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-600 border border-amber-100">Admin Only</span>
            </Label>
            <textarea
              id="notes"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Catatan internal (hanya untuk Admin & General Affair)"
            />
            <p className="text-xs text-gray-500 mt-1">Hanya Admin dan General Affair yang dapat mengedit field ini</p>
          </div>

          {/* Role Selection */}
          <div>
            <Label>Role *</Label>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
              {roles.map((role) => (
                <label
                  key={role.value}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    formData.role === role.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={formData.role === role.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-sm">{role.label}</div>
                    <div className="text-xs text-gray-500">{role.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Department & Division Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Department Selection */}
            <div>
              <Label htmlFor="department" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Departemen *
              </Label>
              <select
                id="department"
                value={formData.departmentId}
                onChange={(e) => setFormData(prev => ({ ...prev, departmentId: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Pilih Departemen</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Division Selection */}
            <div>
              <Label htmlFor="division" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Divisi *
              </Label>
              <select
                id="division"
                value={formData.divisionId}
                onChange={(e) => setFormData(prev => ({ ...prev, divisionId: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                required
                disabled={!formData.departmentId}
              >
                <option value="">
                  {formData.departmentId ? 'Pilih Divisi' : 'Pilih Departemen Dulu'}
                </option>
                {filteredDivisions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name}
                  </option>
                ))}
              </select>
              {!formData.departmentId && (
                <p className="text-xs text-gray-500 mt-1">Pilih departemen terlebih dahulu</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Membuat User...' : 'Buat User'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}