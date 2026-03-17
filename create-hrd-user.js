const { createClient } = require('@supabase/supabase-js')

async function createHRDUser() {
  const supabase = createClient(
    'https://ltdsbtelfetmgrxgoudf.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0ZHNidGVsZmV0bWdyeGdvdWRmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM0OTU1MCwiZXhwIjoyMDg4OTI1NTUwfQ.LMhf_r-g3UIM1xZ-rXwMqAJbUdFQndF59wq6LMCsYCE'
  )

  console.log('Creating HRD user properly...')
  
  try {
    // 1. Create auth user
    console.log('1. Creating auth user...')
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'hrd@progresta.com',
      password: 'hrd123456',
      options: {
        data: {
          name: 'HRD Admin'
        }
      }
    })

    if (authError) {
      console.error('Auth error:', authError.message)
      return
    }

    console.log('✓ Auth user created:', authData.user?.id)

    // 2. Create public user record
    console.log('2. Creating public user record...')
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        name: 'HRD Admin',
        role: 'HRD',
        status_pending: false
      })

    if (userError) {
      console.error('User record error:', userError)
      return
    }

    console.log('✓ Public user record created')

    // 3. Confirm email manually (bypass email confirmation)
    console.log('3. Confirming email...')
    const { error: confirmError } = await supabase.auth.admin.updateUserById(
      authData.user.id,
      { email_confirm: true }
    )

    if (confirmError) {
      console.log('⚠️ Email confirmation warning:', confirmError.message)
    } else {
      console.log('✓ Email confirmed')
    }

    console.log('✅ HRD user created successfully!')
    console.log('📧 Email: hrd@progresta.com')
    console.log('🔑 Password: hrd123456')
    console.log('👤 Role: HRD')
    console.log('✅ Status: Active (no approval needed)')

  } catch (error) {
    console.error('❌ Failed to create HRD user:', error.message)
  }
}

createHRDUser()