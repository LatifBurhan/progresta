// Test script to verify project management API endpoints
const BASE_URL = 'http://localhost:3001'

async function testProjectAPI() {
  console.log('🧪 Testing Project Management API...\n')

  try {
    // Test 1: Get projects
    console.log('1️⃣ Testing GET /api/admin/projects')
    const projectsResponse = await fetch(`${BASE_URL}/api/admin/projects`, {
      headers: {
        'Cookie': 'session=test' // This would normally be a real session
      }
    })
    
    if (projectsResponse.ok) {
      const projectsData = await projectsResponse.json()
      console.log('✅ Projects API working!')
      console.log(`   Found ${projectsData.projects?.length || 0} projects`)
      
      if (projectsData.projects?.length > 0) {
        const firstProject = projectsData.projects[0]
        console.log(`   First project: "${firstProject.name}" with ${firstProject.divisions?.length || 0} divisions`)
      }
    } else {
      console.log('❌ Projects API failed:', projectsResponse.status)
      const errorText = await projectsResponse.text()
      console.log('   Error:', errorText.substring(0, 200))
    }

    console.log('')

    // Test 2: Test RPC functions directly via SQL
    console.log('2️⃣ Testing RPC functions directly...')
    console.log('   (This would require direct database access)')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Run the test
testProjectAPI()