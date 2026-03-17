// Debug divisions API
require('dotenv').config()

async function debugDivisions() {
  try {
    console.log('🔍 Testing divisions API...')
    
    const { createClient } = require('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Test direct Supabase query
    const { data: divisions, error } = await supabase
      .from('divisions')
      .select('id, name, description, color, is_active, created_at, updated_at')
      .eq('is_active', true)
      .order('name', { ascending: true })

    console.log('✅ Direct Supabase query result:')
    console.log('Error:', error)
    console.log('Data:', divisions)
    
    if (divisions) {
      console.log('\n📋 Divisions found:')
      divisions.forEach(div => {
        console.log(`- ${div.name} (${div.id}) - Color: ${div.color}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
  }
}

debugDivisions()