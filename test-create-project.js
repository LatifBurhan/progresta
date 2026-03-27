const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testProjectCreation() {
  console.log('🧪 Testing project creation with updated logic...')
  
  const projectId = require('uuid').v4()
  const projectData = {
    id: projectId,
    name: 'Test Project ' + Date.now(),
    description: 'Test description',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000).toISOString(),
    isActive: true,
    divisionId: '318232cf-e4cb-4156-8e4f-71465640aa26', // Use the existing BE division ID
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  console.log('Inserting into "projects"...')
  const { data, error } = await supabase
    .from('projects')
    .insert([projectData])
    .select()
    .single()

  if (error) {
    console.error('❌ Project insertion failed:', error.message)
    console.error('Error details:', error)
  } else {
    console.log('✅ Project insertion successful!')
    console.log('📊 Result:', data)
  }
}

testProjectCreation()
