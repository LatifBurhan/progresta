#!/usr/bin/env node

/**
 * Script untuk populate database dengan data sample
 * Usage: node scripts/seed-database.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...\n')

  try {
    // 1. Create divisions
    console.log('📊 Creating divisions...')
    const divisions = await Promise.all([
      prisma.division.upsert({
        where: { name: 'Frontend' },
        update: {},
        create: {
          name: 'Frontend',
          description: 'Tim pengembangan antarmuka pengguna',
          color: '#3B82F6'
        }
      }),
      prisma.division.upsert({
        where: { name: 'Backend' },
        update: {},
        create: {
          name: 'Backend',
          description: 'Tim pengembangan server dan API',
          color: '#10B981'
        }
      }),
      prisma.division.upsert({
        where: { name: 'Mobile' },
        update: {},
        create: {
          name: 'Mobile',
          description: 'Tim pengembangan aplikasi mobile',
          color: '#8B5CF6'
        }
      }),
      prisma.division.upsert({
        where: { name: 'UI/UX' },
        update: {},
        create: {
          name: 'UI/UX',
          description: 'Tim desain antarmuka dan pengalaman pengguna',
          color: '#F59E0B'
        }
      }),
      prisma.division.upsert({
        where: { name: 'QA' },
        update: {},
        create: {
          name: 'QA',
          description: 'Tim quality assurance dan testing',
          color: '#EF4444'
        }
      }),
      prisma.division.upsert({
        where: { name: 'DevOps' },
        update: {},
        create: {
          name: 'DevOps',
          description: 'Tim infrastruktur dan deployment',
          color: '#6B7280'
        }
      })
    ])
    console.log(`✅ Created ${divisions.length} divisions\n`)

    // 2. Create projects for each division
    console.log('🚀 Creating projects...')
    const projects = []
    
    for (const division of divisions) {
      // Check if projects already exist
      const existingProjects = await prisma.project.findMany({
        where: { divisionId: division.id }
      })
      
      if (existingProjects.length === 0) {
        const divisionProjects = await Promise.all([
          prisma.project.create({
            data: {
              name: `${division.name} Project Alpha`,
              description: `Project utama untuk divisi ${division.name}`,
              divisionId: division.id
            }
          }),
          prisma.project.create({
            data: {
              name: `${division.name} Project Beta`,
              description: `Project sekunder untuk divisi ${division.name}`,
              divisionId: division.id
            }
          })
        ])
        projects.push(...divisionProjects)
      } else {
        console.log(`  ⏭️  Projects for ${division.name} already exist`)
        projects.push(...existingProjects)
      }
    }
    console.log(`✅ Created ${projects.length} projects\n`)

    // 3. Update existing users to have divisions
    console.log('👥 Updating existing users...')
    const existingUsers = await prisma.user.findMany()
    
    if (existingUsers.length > 0) {
      // Assign first user to Frontend division as example
      if (existingUsers[0]) {
        await prisma.user.update({
          where: { id: existingUsers[0].id },
          data: {
            divisionId: divisions[0].id, // Frontend
            status: 'ACTIVE',
            role: 'KARYAWAN'
          }
        })
        console.log(`✅ Updated user ${existingUsers[0].email} - assigned to Frontend division`)
      }
    }

    console.log('\n🎉 Database seeding completed successfully!')
    console.log('\n📝 Summary:')
    console.log(`- ${divisions.length} divisions created`)
    console.log(`- ${projects.length} projects created`)
    console.log(`- ${existingUsers.length} existing users updated`)
    console.log('\n🚀 You can now:')
    console.log('1. Login to your account')
    console.log('2. Go to Dashboard → 📝 Laporan Progres')
    console.log('3. Create your first report!')

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })