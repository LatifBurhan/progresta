import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test 1: Simple connection
    await prisma.$connect()
    console.log('✅ Database connected')
    
    // Test 2: Check divisions table structure
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'divisions' AND table_schema = 'public'
      ORDER BY ordinal_position
    `
    console.log('📋 Table structure:', tableInfo)
    
    // Test 3: Count existing divisions
    const divisionCount = await prisma.division.count()
    console.log(`📊 Existing divisions: ${divisionCount}`)
    
    // Test 4: Fetch existing divisions
    const divisions = await prisma.division.findMany({
      take: 5,
      orderBy: { name: 'asc' }
    })
    console.log('📝 Sample divisions:', divisions)
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      tableStructure: tableInfo,
      divisionCount,
      sampleDivisions: divisions,
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('❌ Database test failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}