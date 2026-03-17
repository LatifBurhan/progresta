// Test all APIs to make sure they work
require('dotenv').config()

async function testAllAPIs() {
  const baseUrl = 'http://localhost:3000'
  
  console.log('🧪 Testing all APIs...\n')
  
  // Test 1: Divisions API
  try {
    console.log('1️⃣ Testing Divisions API...')
    const response = await fetch(`${baseUrl}/api/divisions`)
    const data = await response.json()
    
    if (data.success) {
      console.log('✅ Divisions API working:', data.divisions?.length || 0, 'divisions')
    } else {
      console.log('❌ Divisions API failed:', data.message)
    }
  } catch (error) {
    console.log('❌ Divisions API error:', error.message)
  }
  
  // Test 2: Projects API
  try {
    console.log('\n2️⃣ Testing Projects API...')
    const response = await fetch(`${baseUrl}/api/projects-working`)
    const data = await response.json()
    
    if (response.status === 401) {
      console.log('⚠️ Projects API requires authentication (expected)')
    } else if (data.success) {
      console.log('✅ Projects API working:', data.projects?.length || 0, 'projects')
    } else {
      console.log('❌ Projects API failed:', data.message)
    }
  } catch (error) {
    console.log('❌ Projects API error:', error.message)
  }
  
  // Test 3: Users Create API
  try {
    console.log('\n3️⃣ Testing Users Create API...')
    const response = await fetch(`${baseUrl}/api/users/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        name: 'Test User',
        position: 'Developer',
        divisionId: 'test-id'
      })
    })
    const data = await response.json()
    
    if (response.status === 401) {
      console.log('⚠️ Users Create API requires authentication (expected)')
    } else {
      console.log('❌ Users Create API failed:', data.message)
    }
  } catch (error) {
    console.log('❌ Users Create API error:', error.message)
  }
  
  console.log('\n🏁 API tests completed!')
}

// Only run if server is running
testAllAPIs().catch(error => {
  console.log('❌ Test suite failed:', error.message)
  console.log('💡 Make sure the development server is running (npm run dev)')
})