import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    steps: [],
    success: false
  }

  try {
    // Step 1: Get test data
    const testData = {
      email: 'debug@progresta.com',
      password: '123456',
      name: 'Debug User',
      role: 'KARYAWAN',
      divisionId: '8334ecc6-d4a0-4709-a550-48dd18644768' // digital marketing ID
    }
    results.steps.push('1. Test data prepared')
    results.testData = testData

    // Step 2: Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)
    results.steps.push('2. Supabase client created')

    // Step 3: Check if email exists and clean up
    results.steps.push('3. Checking if email exists...')
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', testData.email)
      .single()

    if (existingUser) {
      results.steps.push('⚠️ Email already exists, cleaning up...')
      // Delete from database first
      await supabase.from('users').delete().eq('email', testData.email)
      // Delete from auth
      await supabase.auth.admin.deleteUser(existingUser.id)
      results.steps.push('✅ Existing user cleaned up')
    } else {
      results.steps.push('✅ Email is unique')
    }

    // Step 4: Create user in Supabase Auth
    results.steps.push('4. Creating user in Supabase Auth...')
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testData.email,
      password: testData.password,
      user_metadata: {
        name: testData.name
      },
      email_confirm: true
    })

    if (authError) {
      results.steps.push(`❌ Auth creation failed: ${authError.message}`)
      results.authError = authError
      return NextResponse.json(results, { status: 500 })
    }
    results.steps.push('✅ Auth user created')
    results.authUserId = authData.user.id

    // Step 5: Hash password for database
    results.steps.push('5. Hashing password...')
    const hashedPassword = await bcrypt.hash(testData.password, 12)
    results.steps.push('✅ Password hashed')

    // Step 6: Create user in database
    results.steps.push('6. Creating user in database...')
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email: testData.email,
        password: hashedPassword, // Include hashed password
        role: testData.role,
        divisionId: testData.divisionId,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: authData.user.id
      }])
      .select()
      .single()

    if (dbError) {
      results.steps.push(`❌ Database creation failed: ${dbError.message}`)
      results.dbError = dbError
      // Clean up auth user
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(results, { status: 500 })
    }

    results.steps.push('✅ User created successfully in database!')
    results.success = true
    results.createdUser = {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      divisionId: userData.divisionId,
      status: userData.status
    }

    // Step 7: Test login
    results.steps.push('7. Testing login...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testData.email,
      password: testData.password
    })

    if (loginError) {
      results.steps.push(`⚠️ Login test failed: ${loginError.message}`)
      results.loginError = loginError
    } else {
      results.steps.push('✅ Login test successful!')
      results.loginSuccess = true
    }

    return NextResponse.json(results)

  } catch (error: any) {
    results.steps.push(`❌ Unexpected error: ${error.message}`)
    results.unexpectedError = error.message
    return NextResponse.json(results, { status: 500 })
  }
}