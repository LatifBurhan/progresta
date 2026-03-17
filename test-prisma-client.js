const { PrismaClient } = require('@prisma/client')

async function testPrismaClient() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Testing Prisma client...')
    
    // Test connection
    await prisma.$connect()
    console.log('✓ Connected to database')
    
    // Test divisions query
    const divisions = await prisma.division.findMany({
      take: 2
    })
    console.log('✓ Divisions query works:', divisions.length, 'divisions found')
    
    // Test project creation (dry run - we'll rollback)
    const testData = {
      name: 'Test Project',
      client: 'Test Client',
      description: 'Test Description',
      isActive: true
    }
    
    console.log('Testing project creation with data:', testData)
    
    // Try to create and immediately rollback
    await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: testData
      })
      console.log('✓ Project creation works, created project:', project.id)
      
      // Rollback by throwing error
      throw new Error('Rollback test')
    }).catch(error => {
      if (error.message === 'Rollback test') {
        console.log('✓ Transaction rollback successful')
      } else {
        console.error('✗ Unexpected error:', error.message)
      }
    })
    
  } catch (error) {
    console.error('✗ Error:', error.message)
  } finally {
    await prisma.$disconnect()
    console.log('✓ Disconnected from database')
  }
}

testPrismaClient()