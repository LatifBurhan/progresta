const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

async function testSupabaseConnection() {
  console.log('🔍 Testing Supabase connection...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  console.log('📋 Environment variables:')
  console.log('SUPABASE_URL:', supabaseUrl)
  console.log('SERVICE_ROLE_KEY exists:', !!supabaseKey)
  console.log('SERVICE_ROLE_KEY length:', supabaseKey?.length || 0)
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables')
    return
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test 1: Simple query
    console.log('\n🔍 Testing simple query...')
    const { data, error } = await supabase
      .from('divisions')
      .select('*')
      .limit(5)
    
    if (error) {
      console.error('❌ Query error:', error.message)
      console.error('Error details:', error)
    } else {
      console.log('✅ Query successful!')
      console.log('📊 Found divisions:', data?.length || 0)
      if (data && data.length > 0) {
        console.log('📝 Sample division:', data[0])
      }
    }
    
    // Test 2: Check table structure
    console.log('\n🔍 Testing table structure...')
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_info', { table_name: 'divisions' })
      .single()
    
    if (tableError) {
      console.log('⚠️ Could not get table info (this is normal):', tableError.message)
    } else {
      console.log('📋 Table info:', tableInfo)
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    console.error('Full error:', error)
  }
}

testSupabaseConnection()