import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    console.log('🌱 Starting division seeding via GET...')
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const divisionsToCreate = [
      {
        name: 'IT Development',
        description: 'Tim pengembangan aplikasi, website, dan sistem informasi',
        color: '#3B82F6'
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
        name: 'Marketing',
        description: 'Tim pemasaran, promosi, dan branding',
        color: '#F59E0B'
      },
      {
        name: 'Operations',
        description: 'Divisi operasional dan manajemen harian',
        color: '#8B5CF6'
      }
    ]
    
    const results = []
    let created = 0
    let skipped = 0
    
    for (const divisionData of divisionsToCreate) {
      // Check if division already exists
      const { data: existing } = await supabase
        .from('divisions')
        .select('id, name')
        .eq('name', divisionData.name)
        .single()
      
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
        const { data: newDivision, error } = await supabase
          .from('divisions')
          .insert([divisionData])
          .select()
          .single()
        
        if (error) {
          console.error(`❌ Failed to create ${divisionData.name}:`, error.message)
          results.push({
            name: divisionData.name,
            status: 'failed',
            error: error.message
          })
        } else {
          console.log(`✅ Created ${divisionData.name}`)
          results.push({
            name: divisionData.name,
            status: 'created',
            id: newDivision.id
          })
          created++
        }
      }
    }
    
    // Get final count
    const { count: totalDivisions } = await supabase
      .from('divisions')
      .select('*', { count: 'exact', head: true })
    
    return NextResponse.json({
      success: true,
      message: `Division seeding completed. Created: ${created}, Skipped: ${skipped}`,
      results,
      summary: {
        created,
        skipped,
        totalDivisions: totalDivisions || 0
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