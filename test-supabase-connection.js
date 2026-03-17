// Test Supabase connection with current credentials
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

async function testSupabaseConnection() {
  try {
    console.log('🔄 Testing Supabase connection...')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    console.log('📍 Supabase URL:', supabaseUrl)
    console.log('🔑 Service Key:', supabaseKey ? 'Present' : 'Missing')
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Missing Supabase credentials')
      return
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test basic connection
    const { data, error } = await supabase
      .from('divisions')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message)
      console.error('Error details:', error)
      return
    }
    
    console.log('✅ Supabase connection successful!')
    
    // Test divisions table
    const { data: divisions, error: divError } = await supabase
      .from('divisions')
      .select('id, name')
      .limit(5)
    
    if (divError) {
      console.error('❌ Divisions table error:', divError.message)
    } else {
      console.log('✅ Divisions table accessible:', divisions?.length || 0, 'divisions found')
      if (divisions && divisions.length > 0) {
        console.log('Sample divisions:', divisions.map(d => d.name).join(', '))
      }
    }
    
    // Test projects table
    const { data: projects, error: projError } = await supabase
      .from('projects')
      .select('id, name')
      .limit(5)
    
    if (projError) {
      console.error('❌ Projects table error:', projError.message)
    } else {
      console.log('✅ Projects table accessible:', projects?.length || 0, 'projects found')
      if (projects && projects.length > 0) {
        console.log('Sample projects:', projects.map(p => p.name).join(', '))
      }
    }
    
    // Test users table
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(5)
    
    if (userError) {
      console.error('❌ Users table error:', userError.message)
    } else {
      console.log('✅ Users table accessible:', users?.length || 0, 'users found')
      if (users && users.length > 0) {
        console.log('Sample users:', users.map(u => `${u.email} (${u.role})`).join(', '))
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

testSupabaseConnection()