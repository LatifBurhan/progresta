import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST() {
  try {
    console.log('🌱 Starting division seeding...')
    
    const divisionsToCreate = [
      {
        name: 'IT Development',
        description: 'Tim pengembangan aplikasi, website, dan sistem informasi',
        color: '#3B82F6'
      },
      {
        name: 'IT Support', 
        description: 'Tim dukungan teknis dan maintenance sistem',
        color: '#1E40AF'
      },
      {
        name: 'Human Resources',
        description: 'Divisi sumber daya manusia dan rekrutmen', 
        color: '#10B981'
      },
      {
        name: 'Finance',
        description: 'Divisi keuangan, akuntansi, dan budget',
        color: '#EF4444'
      },
      {
        name: 'Operations',
        description: 'Divisi operasional dan manajemen harian',
        color: '#8B5CF6'
      },
      {
        name: 'Marketing',
        description: 'Tim pemasaran, promosi, dan branding',
        color: '#F59E0B'
      },
      {
        name: 'Sales',
        description: 'Tim penjualan dan customer relationship',
        color: '#F97316'
      },
      {
        name: 'Design',
        description: 'Tim desain grafis, UI/UX, dan kreatif',
        color: '#EC4899'
      },
      {
        name: 'Content',
        description: 'Tim konten, copywriting, dan media sosial',
        color: '#06B6D4'
      },
      {
        name: 'Customer Service',
        description: 'Tim layanan pelanggan dan support',
        color: '#84CC16'
      }
    ]
    
    const results = []
    let created = 0
    let skipped = 0
    
    for (const divisionData of divisionsToCreate) {
      try {
        // Check if division already exists
        const existing = await prisma.division.findUnique({
          where: { name: divisionData.name }
        })
        
        if (existing) {
          console.log(`⏭️ Skipping ${divisionData.name} - already exists`)
          results.push({
            name: divisionData.name,
            status: 'skipped',
            reason: 'already exists'
          })
          skipped++
        } else {
          // Create new division
          const newDivision = await prisma.division.create({
            data: divisionData
          })
          console.log(`✅ Created ${divisionData.name}`)
          results.push({
            name: divisionData.name,
            status: 'created',
            id: newDivision.id
          })
          created++
        }
      } catch (error: any) {
        console.error(`❌ Failed to create ${divisionData.name}:`, error.message)
        results.push({
          name: divisionData.name,
          status: 'failed',
          error: error.message
        })
      }
    }
    
    // Get final count
    const totalDivisions = await prisma.division.count()
    
    return NextResponse.json({
      success: true,
      message: `Division seeding completed. Created: ${created}, Skipped: ${skipped}`,
      results,
      summary: {
        created,
        skipped,
        totalDivisions
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('❌ Division seeding failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}