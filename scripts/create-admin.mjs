#!/usr/bin/env node

/**
 * Script untuk membuat Admin Account
 * 
 * Usage:
 *   node scripts/create-admin.mjs
 * 
 * Atau dengan custom email/password:
 *   node scripts/create-admin.mjs admin@example.com MyPassword123
 */

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '../.env') })

// Default credentials
const DEFAULT_EMAIL = 'admin@alwustho.com'
const DEFAULT_PASSWORD = 'Admin123!'

// Get credentials from command line or use defaults
const email = process.argv[2] || DEFAULT_EMAIL
const password = process.argv[3] || DEFAULT_PASSWORD

console.log('\n🚀 Creating Admin Account...\n')
console.log('📧 Email:', email)
console.log('🔑 Password:', password)
console.log('👤 Role: ADMIN\n')

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL not found in .env')
  process.exit(1)
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in .env')
  process.exit(1)
}

// Create Supabase client with service role key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function createAdminAccount() {
  try {
    // Step 1: Check if user already exists
    console.log('🔍 Checking if user already exists...')
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', email)
      .single()

    if (existingUser) {
      console.log('⚠️  User already exists!')
      console.log('   ID:', existingUser.id)
      console.log('   Email:', existingUser.email)
      console.log('   Role:', existingUser.role)
      console.log('\n✅ You can login with this account now.')
      return
    }

    // Step 2: Create user in Supabase Auth
    console.log('📝 Creating user in Supabase Auth...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        name: 'Administrator',
        role: 'ADMIN'
      }
    })

    if (authError) {
      console.error('❌ Failed to create user in Auth:', authError.message)
      process.exit(1)
    }

    console.log('✅ User created in Auth')
    console.log('   User ID:', authData.user.id)

    // Step 3: Create user record in database
    console.log('📝 Creating user record in database...')
    
    // Hash password for database
    const hashedPassword = await bcrypt.hash(password, 12)
    
    const { data: dbData, error: dbError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: email,
        password: hashedPassword, // Add hashed password
        role: 'ADMIN',
        status: 'ACTIVE',
        divisionId: null, // ADMIN tidak perlu divisi
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single()

    if (dbError) {
      console.error('❌ Failed to create user in database:', dbError.message)
      console.log('⚠️  Cleaning up Auth user...')
      await supabase.auth.admin.deleteUser(authData.user.id)
      process.exit(1)
    }

    console.log('✅ User created in database')
    console.log('   User ID:', dbData.id)
    console.log('   Email:', dbData.email)
    console.log('   Role:', dbData.role)
    console.log('   Status:', dbData.status)

    // Success!
    console.log('\n🎉 Admin account created successfully!\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📋 LOGIN CREDENTIALS')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🌐 URL: http://localhost:3000/login')
    console.log('📧 Email:', email)
    console.log('🔑 Password:', password)
    console.log('👤 Role: ADMIN')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    process.exit(1)
  }
}

// Run the script
createAdminAccount()
