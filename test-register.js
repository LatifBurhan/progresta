const { createClient } = require('@supabase/supabase-js')

async function testRegister() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  console.log('Testing registration process...')
  
  const testUser = {
    email: 'test@example.com',
    password: 'test123456',
    name: 'Test User',
    phone: '08123456789',
    position: 'Developer'
  }

  try {
    // Test 1: Create auth user
    console.log('1. Creating auth user...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          name: testUser.name,
          phone: testUser.phone,
          position: testUser.position
        }
      }
    })

    if (authError) {
      console.error('Auth error:', authError.message)
      return
    }

    console.log('✓ Auth user created:', authData.user?.id)

    // Test 2: Create user record
    console.log('2. Creating user record...')
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        password: 'hashed',
        role: 'KARYAWAN',
        status: 'PENDING'
      })

    if (userError) {
      console.error('User record error:', userError)
      return
    }

    console.log('✓ User record created')

    // Test 3: Create profile record
    console.log('3. Creating profile record...')
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        name: testUser.name,
        phone: testUser.phone,
        position: testUser.position
      })

    if (profileError) {
      console.error('Profile record error:', profileError)
    } else {
      console.log('✓ Profile record created')
    }

    console.log('✓ Registration test completed successfully!')

    // Cleanup
    console.log('4. Cleaning up test data...')
    await supabase.from('profiles').delete().eq('user_id', authData.user.id)
    await supabase.from('users').delete().eq('id', authData.user.id)
    await supabase.auth.admin.deleteUser(authData.user.id)
    console.log('✓ Test data cleaned up')

  } catch (error) {
    console.error('Test failed:', error)
  }
}

testRegister()