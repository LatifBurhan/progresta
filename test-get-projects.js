const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testGetProjects() {
  console.log('🧪 Testing GET projects...')
  
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select(`
      *,
      divisions:divisionId (
        id,
        name,
        color
      )
    `)
    .order('createdAt', { ascending: false })

  if (projectsError) {
    console.error('❌ Error fetching projects:', projectsError.message)
    
    console.log('\nTrying simple select...')
    const { data, error } = await supabase.from('projects').select('*')
    if (error) {
      console.error('❌ Simple select failed:', error.message)
    } else {
      console.log('✅ Simple select successful! Found', data.length, 'projects')
    }
  } else {
    console.log('✅ Fetch successful! Found', projects.length, 'projects')
    if (projects.length > 0) {
      console.log('📝 Sample project with division:', projects[0])
    }
  }
}

testGetProjects()
