const { createClient } = require('@supabase/supabase-js')

async function testDatabase() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  console.log('Testing database connection...')
  
  // Test divisions table
  console.log('\n=== DIVISIONS TABLE ===')
  const { data: divisions, error: divError } = await supabase
    .from('divisions')
    .select('*')
    .limit(5)
  
  if (divError) {
    console.error('Divisions error:', divError)
  } else {
    console.log('Divisions found:', divisions.length)
    if (divisions.length > 0) {
      console.log('Sample division:', divisions[0])
      console.log('Division columns:', Object.keys(divisions[0]))
    }
  }

  // Test projects table
  console.log('\n=== PROJECTS TABLE ===')
  const { data: projects, error: projError } = await supabase
    .from('projects')
    .select('*')
    .limit(5)
  
  if (projError) {
    console.error('Projects error:', projError)
  } else {
    console.log('Projects found:', projects.length)
    if (projects.length > 0) {
      console.log('Sample project:', projects[0])
      console.log('Project columns:', Object.keys(projects[0]))
    }
  }

  // Test project_divisions table
  console.log('\n=== PROJECT_DIVISIONS TABLE ===')
  const { data: projDivs, error: projDivError } = await supabase
    .from('project_divisions')
    .select('*')
    .limit(5)
  
  if (projDivError) {
    console.error('Project divisions error:', projDivError)
  } else {
    console.log('Project divisions found:', projDivs.length)
    if (projDivs.length > 0) {
      console.log('Sample project division:', projDivs[0])
      console.log('Project division columns:', Object.keys(projDivs[0]))
    }
  }
}

testDatabase().catch(console.error)