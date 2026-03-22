import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: [],
      success: false
    }

    // Test 1: Prisma connection
    results.tests.push('Testing Prisma connection...')
    try {
      await prisma.$connect()
      results.tests.push('✅ Prisma connection successful')
      results.prismaConnected = true
    } catch (error: any) {
      results.tests.push(`❌ Prisma connection failed: ${error.message}`)
      results.prismaConnected = false
      results.prismaError = error.message
    }

    // Test 2: Database query
    if (results.prismaConnected) {
      results.tests.push('Testing database query...')
      try {
        const userCount = await prisma.user.count()
        results.tests.push(`✅ Database query successful - Found ${userCount} users`)
        results.userCount = userCount
        results.success = true
      } catch (error: any) {
        results.tests.push(`❌ Database query failed: ${error.message}`)
        results.queryError = error.message
      }

      // Test 3: Division query
      try {
        const divisionCount = await prisma.division.count()
        results.tests.push(`✅ Division query successful - Found ${divisionCount} divisions`)
        results.divisionCount = divisionCount
      } catch (error: any) {
        results.tests.push(`❌ Division query failed: ${error.message}`)
        results.divisionError = error.message
      }
    }

    // Test 4: Environment variables
    results.environment = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      DIRECT_URL: !!process.env.DIRECT_URL,
      DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
      DIRECT_URL_LENGTH: process.env.DIRECT_URL?.length || 0
    }

    return NextResponse.json(results)

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Database test failed',
      message: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}