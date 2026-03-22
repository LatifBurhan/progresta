import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: [],
      environment: {}
    }

    // Test environment variables
    results.tests.push('Checking environment variables...')
    results.environment = {
      DATABASE_URL: {
        exists: !!process.env.DATABASE_URL,
        value: process.env.DATABASE_URL ? 
          process.env.DATABASE_URL.substring(0, 50) + '...' : 
          null
      },
      DIRECT_URL: {
        exists: !!process.env.DIRECT_URL,
        value: process.env.DIRECT_URL ? 
          process.env.DIRECT_URL.substring(0, 50) + '...' : 
          null
      },
      SUPABASE_URL: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        value: process.env.NEXT_PUBLIC_SUPABASE_URL
      },
      SUPABASE_SERVICE_ROLE_KEY: {
        exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
      }
    }

    // Test Prisma import
    results.tests.push('Testing Prisma import...')
    try {
      const prisma = (await import('@/lib/prisma')).default
      results.tests.push('✅ Prisma imported successfully')
      results.prismaImported = true

      // Test database connection
      results.tests.push('Testing database connection...')
      await prisma.$connect()
      results.tests.push('✅ Database connected successfully')
      results.dbConnected = true

      // Test simple query
      results.tests.push('Testing simple query...')
      const result = await prisma.$queryRaw`SELECT 1 as test`
      results.tests.push('✅ Simple query successful')
      results.simpleQuery = result

      // Test divisions table
      results.tests.push('Testing divisions table...')
      const divisions = await prisma.division.findMany({
        take: 5,
        orderBy: { name: 'asc' }
      })
      results.tests.push(`✅ Found ${divisions.length} divisions`)
      results.divisions = divisions.map(div => ({
        id: div.id,
        name: div.name,
        color: div.color
      }))
      results.success = true

    } catch (error: any) {
      results.tests.push(`❌ Database error: ${error.message}`)
      results.dbError = error.message
      results.errorCode = error.code
      results.success = false
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