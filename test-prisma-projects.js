// Test Prisma with projects
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')

async function testPrismaProjects() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🧪 Testing Prisma with Projects...\n')
    
    // Test 1: Basic connection
    await prisma.$connect()
    console.log('✅ Prisma connected successfully!')
    
    // Test 2: Count projects
    try {
      const projectCount = await prisma.project.count()
      console.log(`✅ Project count: ${projectCount}`)
    } catch (error) {
      console.log('❌ Project count failed:', error.message)
    }
    
    // Test 3: Get projects with divisions
    try {
      const projects = await prisma.project.findMany({
        where: {
          isActive: true
        },
        include: {
          project_divisions: {
            include: {
              divisions: {
                select: {
                  id: true,
                  name: true,
                  color: true
                }
              }
            }
          }
        },
        take: 3
      })
      
      console.log(`✅ Found ${projects.length} projects with divisions:`)
      projects.forEach(project => {
        const divisionNames = project.project_divisions.map(pd => pd.divisions.name).join(', ')
        console.log(`  - ${project.name}: ${divisionNames || 'No divisions'}`)
      })
    } catch (error) {
      console.log('❌ Projects with divisions failed:', error.message)
      console.log('Error code:', error.code)
      
      if (error.code === 'P2021') {
        console.log('💡 This is likely a table/column name mismatch')
      }
    }
    
    // Test 4: Test division query
    try {
      const divisions = await prisma.division.findMany({
        where: {
          isActive: true
        },
        take: 3
      })
      
      console.log(`✅ Found ${divisions.length} active divisions:`)
      divisions.forEach(division => {
        console.log(`  - ${division.name}`)
      })
    } catch (error) {
      console.log('❌ Divisions query failed:', error.message)
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Error code:', error.code)
  } finally {
    await prisma.$disconnect()
    console.log('\n🔌 Disconnected from database')
  }
}

testPrismaProjects()