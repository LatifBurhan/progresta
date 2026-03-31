import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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
      SUPABASE_URL: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        value: process.env.NEXT_PUBLIC_SUPABASE_URL
      },
      SUPABASE_ANON_KEY: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0
      },
      SUPABASE_SERVICE_ROLE_KEY: {
        exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0
      }
    }

    if (!supabaseAdmin) {
      results.tests.push('❌ Supabase admin client not initialized')
      results.success = false
      return NextResponse.json(results)
    }

    // Test Supabase connection
    results.tests.push('Testing Supabase connection...')
    results.tests.push('✅ Supabase admin client initialized')

    // Test simple query
    results.tests.push('Testing simple query...')
    const { data: testData, error: testError } = await supabaseAdmin
      .from('divisions')
      .select('id')
      .limit(1)

    if (testError) {
      results.tests.push(`❌ Simple query failed: ${testError.message}`)
      results.success = false
      return NextResponse.json(results)
    }

    results.tests.push('✅ Simple query successful')

    // Test divisions table
    results.tests.push('Testing divisions table...')
    const { data: divisions, error: divisionsError } = await supabaseAdmin
      .from('divisions')
      .select('id, name, color')
      .order('name', { ascending: true })
      .limit(5)

    if (divisionsError) {
      results.tests.push(`❌ Divisions query failed: ${divisionsError.message}`)
      results.success = false
      return NextResponse.json(results)
    }

    results.tests.push(`✅ Found ${divisions?.length || 0} divisions`)
    results.divisions = divisions?.map((div: any) => ({
      id: div.id,
      name: div.name,
      color: div.color
    }))
    results.success = true

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