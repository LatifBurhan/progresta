// Test script untuk fitur HRD Create User
// Jalankan dengan: node scripts/test-hrd-create-user.js

const testCreateUser = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  // Sample data untuk testing
  const testUsers = [
    {
      email: 'john.doe@company.com',
      password: 'password123',
      name: 'John Doe',
      phone: '081234567890',
      position: 'Frontend Developer',
      role: 'KARYAWAN',
      divisionId: 'your-division-id-here' // Ganti dengan ID divisi yang valid
    },
    {
      email: 'jane.smith@company.com',
      password: 'password123',
      name: 'Jane Smith',
      phone: '081234567891',
      position: 'Project Manager',
      role: 'PM',
      divisionId: 'your-division-id-here' // Ganti dengan ID divisi yang valid
    },
    {
      email: 'bob.wilson@company.com',
      password: 'password123',
      name: 'Bob Wilson',
      phone: '081234567892',
      position: 'HR Manager',
      role: 'HRD',
      divisionId: 'your-division-id-here' // Ganti dengan ID divisi yang valid
    }
  ]

  console.log('🧪 Testing HRD Create User API...')
  console.log('📍 Base URL:', baseUrl)
  
  for (const userData of testUsers) {
    try {
      console.log(`\n👤 Creating user: ${userData.name} (${userData.email})`)
      
      const response = await fetch(`${baseUrl}/api/admin/users/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: Dalam implementasi nyata, Anda perlu menambahkan authentication header
          // 'Cookie': 'session=your-session-token'
        },
        body: JSON.stringify(userData)
      })

      const result = await response.json()
      
      if (result.success) {
        console.log('✅ Success:', result.message)
        console.log('📋 User ID:', result.user?.id)
        console.log('🏷️  Role:', result.user?.role)
        console.log('🏢 Division:', result.user?.division?.name)
      } else {
        console.log('❌ Failed:', result.message)
      }
    } catch (error) {
      console.log('💥 Error:', error.message)
    }
  }
  
  console.log('\n🎯 Test completed!')
  console.log('\n📝 Notes:')
  console.log('- Make sure to update divisionId with valid division IDs')
  console.log('- Authentication is required in production')
  console.log('- Test with HRD/CEO/ADMIN role only')
}

// Jalankan test jika file ini dieksekusi langsung
if (require.main === module) {
  testCreateUser().catch(console.error)
}

module.exports = { testCreateUser }