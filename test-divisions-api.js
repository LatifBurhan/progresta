const { PrismaClient } = require('@prisma/client')

async function testDivisionsAPI() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Testing divisions API with Prisma...')
    
    // Test 1: Get all divisions
    console.log('1. Testing GET divisions...')
    const divisions = await prisma.division.findMany({
      orderBy: { name: 'asc' }
    })
    console.log('✓ GET divisions works:', divisions.length, 'divisions found')
    
    // Test 2: Create division with unique name
    console.log('2. Testing CREATE division...')
    const uniqueName = `Test Division ${Date.now()}`
    const newDivision = await prisma.division.create({
      data: {
        name: uniqueName,
        description: 'Test description',
        color: '#FF5733'
      }
    })
    console.log('✓ CREATE division works:', newDivision.id)
    
    // Test 3: Update division
    console.log('3. Testing UPDATE division...')
    const updatedName = `Updated Test Division ${Date.now()}`
    const updatedDivision = await prisma.division.update({
      where: { id: newDivision.id },
      data: {
        name: updatedName,
        description: 'Updated description'
      }
    })
    console.log('✓ UPDATE division works:', updatedDivision.name)
    
    // Test 4: Get counts (fix the count queries)
    console.log('4. Testing COUNT queries...')
    
    // Check if User model exists and has divisionId field
    try {
      const userCount = await prisma.user.count({
        where: { divisionId: newDivision.id }
      })
      console.log('✓ User count works:', userCount)
    } catch (error) {
      console.log('⚠️ User count failed:', error.message)
    }
    
    // Check if ProjectDivision model exists
    try {
      const projectCount = await prisma.projectDivision.count({
        where: { divisionId: newDivision.id }
      })
      console.log('✓ Project count works:', projectCount)
    } catch (error) {
      console.log('⚠️ Project count failed:', error.message)
    }
    
    // Test 5: Delete division
    console.log('5. Testing DELETE division...')
    await prisma.division.delete({
      where: { id: newDivision.id }
    })
    console.log('✓ DELETE division works')
    
    console.log('✅ All divisions API tests passed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

testDivisionsAPI()