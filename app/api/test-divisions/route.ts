import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: [],
      success: false
    }

    if (!supabaseAdmin) {
      results.tests.push('❌ Supabase admin client not initialized')
      return NextResponse.json(results, { status: 500 })
    }

    // Test 1: Database connection
    results.tests.push('Testing Supabase connection...')
    results.tests.push('✅ Supabase admin client initialized')
    results.dbConnected = true

    // Test 2: Fetch divisions
    results.tests.push('Fetching divisions from database...')
    try {
      const { data: divisions, error } = await supabaseAdmin
        .from('divisions')
        .select('id, name, description, color, created_at')
        .order('name', { ascending: true })
      
      if (error) {
        results.tests.push(`❌ Failed to fetch divisions: ${error.message}`)
        results.divisionError = error.message
        return NextResponse.json(results, { status: 500 })
      }

      results.tests.push(`✅ Found ${divisions?.length || 0} divisions`)
      results.divisions = divisions?.map((div: any) => ({
        id: div.id,
        name: div.name,
        description: div.description,
        color: div.color,
        createdAt: div.created_at
      }))
      results.divisionCount = divisions?.length || 0
      results.success = true
    } catch (error: any) {
      results.tests.push(`❌ Failed to fetch divisions: ${error.message}`)
      results.divisionError = error.message
    }

    // Test 3: Environment variables
    results.environment = {
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