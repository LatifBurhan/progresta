const { createClient } = require('@supabase/supabase-js')

async function testRegisterSimple() {
  const supabase = createClient(
    'https://ltdsbtelfetmgrxgoudf.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0ZHNidGVsZmV0bWdyeGdvdWRmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM0OTU1MCwiZXhwIjoyMDg4OTI1NTUwfQ.LMhf_r-g3UIM1xZ-rXwMqAJbUdFQndF59wq6LMCsYCE'
  )

  console.log('Testing simple registration...')
  
  const testUser = {
    email: 'testuser@gmail.com',
    password: 'test123456',
    name: 'Test User'
  }

  try {
    // Test 1: Create auth user
    console.log('1. Creating auth user...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password
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
        name: testUser.name,
        role: 'Karyawan',
        status_pending: true
      })

    if (userError) {
      console.error('User record error:', userError)
      return
    }

    console.log('✓ User record created')
    console.log('✓ Registration test completed successfully!')

    // Cleanup
    console.log('3. Cleaning up test data...')
    await supabase.from('users').delete().eq('id', authData.user.id)
    await supabase.auth.admin.deleteUser(authData.user.id)
    console.log('✓ Test data cleaned up')

  } catch (error) {
    console.error('Test failed:', error)
  }
}

testRegisterSimple()