'use server'

import { z } from 'zod'
import { createSession, deleteSession } from '@/lib/session'
import { createClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

const LoginSchema = z.object({
  email: z.string().email({ message: 'Format email tidak valid' }),
  password: z.string().min(1, { message: 'Password harus diisi' }),
})

const RegisterSchema = z.object({
  email: z.string().email({ message: 'Format email tidak valid' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter' }),
  name: z.string().min(1, { message: 'Nama harus diisi' }),
  phone: z.string().optional(),
  position: z.string().optional(),
})

export async function loginAction(prevState: any, formData: FormData) {
  const validatedFields = LoginSchema.safeParse(
    Object.fromEntries(formData.entries())
  )

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Data tidak valid.',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  try {
    const supabase = createClient()
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      return { 
        success: false, 
        message: 'Email atau password salah.', 
        errors: null 
      }
    }

    // Get user data from public.users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role, status_pending, name')
      .eq('id', authData.user.id)
      .single()

    if (userError || !userData) {
      return { 
        success: false, 
        message: 'Data user tidak ditemukan.', 
        errors: null 
      }
    }

    await createSession({
      userId: authData.user.id,
      email: authData.user.email!,
      role: userData.role,
      name: userData.name || authData.user.user_metadata?.name || authData.user.email!.split('@')[0]
    })

    return { 
      success: true, 
      role: userData.role,
      pending: userData.status_pending,
      errors: null, 
      message: null 
    }
  } catch (error) {
    console.error('Login action failed:', error)
    return { 
      success: false, 
      message: 'Terjadi kesalahan internal. Silakan coba lagi.', 
      errors: null 
    }
  }
}

export async function registerAction(prevState: any, formData: FormData) {
  const validatedFields = RegisterSchema.safeParse(
    Object.fromEntries(formData.entries())
  )

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Data tidak valid.',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password, name, phone, position } = validatedFields.data

  try {
    const supabase = createClient()

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          position
        }
      }
    })

    if (authError) {
      return { 
        success: false, 
        message: authError.message === 'User already registered' 
          ? 'Email ini sudah terdaftar.' 
          : 'Terjadi kesalahan saat pendaftaran.', 
        errors: null 
      }
    }

    if (!authData.user) {
      return { 
        success: false, 
        message: 'Gagal membuat akun.', 
        errors: null 
      }
    }

    // Create user record in public.users table (sesuai dengan struktur database aktual)
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        name: name, // Database memiliki field name di tabel users
        role: 'Karyawan', // Sesuai dengan constraint di database
        status_pending: true // Database menggunakan boolean status_pending
      })

    if (userError) {
      console.error('Failed to create user record:', userError)
      // Try to clean up auth user if public user creation failed
      await supabase.auth.admin.deleteUser(authData.user.id)
      return { 
        success: false, 
        message: 'Terjadi kesalahan saat menyimpan data user.', 
        errors: null 
      }
    }

    return { 
      success: true, 
      message: 'Pendaftaran berhasil! Akun Anda menunggu persetujuan admin. Silakan login untuk melihat status.', 
      errors: null 
    }
  } catch (error: any) {
    console.error('Registration failed:', error)
    return { 
      success: false, 
      message: 'Terjadi kesalahan saat pendaftaran.', 
      errors: null 
    }
  }
}

export async function logoutAction() {
  const supabase = createClient()
  await supabase.auth.signOut()
  await deleteSession()
  redirect('/login')
}
