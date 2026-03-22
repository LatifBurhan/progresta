import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const results: any = {
      timestamp: new Date().toISOString(),
      tests: [],
      success: false
    }

    // Test Supabase client
    results.tests.push('Creating Supabase client...')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      results.tests.push('❌ Missing Supabase credentials')
      return NextResponse.json(results, { status: 400 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    results.tests.push('✅ Supabase client created')

    // Test connection with simple query
    results.tests.push('Testing Supabase connection...')
    const { data, error } = await supabase
      .from('divisions')
      .select('id, name, color')
      .limit(5)

    if (error) {
      results.tests.push(`❌ Supabase query failed: ${error.message}`)
      results.supabaseError = error
    } else {
      results.tests.push(`✅ Supabase query successful - Found ${data?.length || 0} divisions`)
      results.divisions = data
      results.success = true
    }

    return NextResponse.json(results)

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Supabase test failed',
      message: error.message
    }, { status: 500 })
  }
}