import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: [],
      success: false
    }

    // Test 1: Database connection
    results.tests.push('Testing database connection...')
    try {
      await prisma.$connect()
      results.tests.push('✅ Database connected successfully')
      results.dbConnected = true
    } catch (error: any) {
      results.tests.push(`❌ Database connection failed: ${error.message}`)
      results.dbConnected = false
      results.dbError = error.message
      return NextResponse.json(results, { status: 500 })
    }

    // Test 2: Fetch divisions
    results.tests.push('Fetching divisions from database...')
    try {
      const divisions = await prisma.division.findMany({
        orderBy: { name: 'asc' }
      })
      
      results.tests.push(`✅ Found ${divisions.length} divisions`)
      results.divisions = divisions.map(div => ({
        id: div.id,
        name: div.name,
        description: div.description,
        color: div.color,
        createdAt: div.createdAt?.toISOString()
      }))
      results.divisionCount = divisions.length
      results.success = true
    } catch (error: any) {
      results.tests.push(`❌ Failed to fetch divisions: ${error.message}`)
      results.divisionError = error.message
    }

    // Test 3: Environment variables
    results.environment = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      DIRECT_URL: !!process.env.DIRECT_URL,
      SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY
    }

    return NextResponse.json(results)

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}