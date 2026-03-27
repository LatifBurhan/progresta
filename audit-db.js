const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function auditDatabase() {
  console.log('🕵️ AUDIT DATABASE TOTAL...')
  
  // 1. Cek Tabel projects
  console.log('\n--- 1. Tabel projects ---')
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .limit(1)
  
  if (projectsError) {
    console.error('❌ projects error:', projectsError.message)
  } else {
    console.log('✅ projects exists. Columns found:', Object.keys(projects[0] || {}))
    console.log('Sample row:', projects[0])
  }

  // 2. Cek Tabel divisions
  console.log('\n--- 2. Tabel divisions ---')
  const { data: divisions, error: divisionsError } = await supabase
    .from('divisions')
    .select('*')
    .limit(1)
  
  if (divisionsError) {
    console.error('❌ divisions error:', divisionsError.message)
  } else {
    console.log('✅ divisions exists. Columns found:', Object.keys(divisions[0] || {}))
  }

  // 3. Cek Tabel project_divisions
  console.log('\n--- 3. Tabel project_divisions ---')
  const { data: pd, error: pdError } = await supabase
    .from('project_divisions')
    .select('*')
    .limit(5)
  
  if (pdError) {
    console.error('❌ project_divisions error:', pdError.message)
  } else {
    console.log('✅ project_divisions exists. Count:', pd.length)
    if (pd.length > 0) {
      console.log('Sample rows:', pd)
    } else {
      console.log('⚠️ Tabel project_divisions KOSONG!')
    }
  }

  // 4. Test Join Query (Seperti yang dipakai API)
  console.log('\n--- 4. Test Join Query ---')
  const { data: joinData, error: joinError } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      project_divisions (
        division_id,
        divisions (
          id,
          name
        )
      )
    `)
    .limit(1)

  if (joinError) {
    console.error('❌ Join Query FAILED:', joinError.message)
    console.error('Details:', joinError)
  } else {
    console.log('✅ Join Query SUCCESS!')
    console.log('Result:', JSON.stringify(joinData, null, 2))
  }
}

auditDatabase()
