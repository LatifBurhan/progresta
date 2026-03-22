import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifySession } from '@/lib/session'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    steps: [],
    success: false
  }

  try {
    // Step 1: Check environment
    results.steps.push('1. Checking environment variables...')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      results.steps.push('❌ Missing environment variables')
      results.error = 'Missing SUPABASE environment variables'
      return NextResponse.json(results, { status: 500 })
    }
    results.steps.push('✅ Environment variables OK')

    // Step 2: Check session
    results.steps.push('2. Verifying session...')
    try {
      const session = await verifySession()
      if (!session) {
        results.steps.push('❌ No session found')
        results.error = 'No session'
        return NextResponse.json(results, { status: 401 })
      }
      results.steps.push(`✅ Session OK - User: ${session.email}, Role: ${session.role}`)
      results.session = { email: session.email, role: session.role }
    } catch (sessionError: any) {
      results.steps.push(`❌ Session error: ${sessionError.message}`)
      results.sessionError = sessionError.message
      return NextResponse.json(results, { status: 401 })
    }

    // Step 3: Create Supabase client
    results.steps.push('3. Creating Supabase client...')
    const supabase = createClient(supabaseUrl, supabaseKey)
    results.steps.push('✅ Supabase client created')

    // Step 4: Test basic connection
    results.steps.push('4. Testing database connection...')
    const { data: testQuery, error: testError } = await supabase
      .from('divisions')
      .select('count')
      .limit(1)
    
    if (testError) {
      results.steps.push(`❌ Connection test failed: ${testError.message}`)
      results.connectionError = testError
      return NextResponse.json(results, { status: 500 })
    }
    results.steps.push('✅ Database connection OK')

    // Step 5: Generate UUID
    results.steps.push('5. Generating UUID...')
    const newId = uuidv4()
    results.steps.push(`✅ UUID generated: ${newId}`)
    results.generatedId = newId

    // Step 6: Prepare test data
    results.steps.push('6. Preparing test data...')
    const testData = {
      id: newId,
      name: `Test Division ${Date.now()}`,
      description: 'Debug test division',
      color: '#FF0000',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    results.steps.push('✅ Test data prepared')
    results.testData = testData

    // Step 7: Check for existing name
    results.steps.push('7. Checking for existing division name...')
    const { data: existing } = await supabase
      .from('divisions')
      .select('id, name')
      .eq('name', testData.name)
      .single()
    
    if (existing) {
      results.steps.push('❌ Division name already exists')
      results.error = 'Division name already exists'
      return NextResponse.json(results, { status: 400 })
    }
    results.steps.push('✅ Division name is unique')

    // Step 8: Attempt insert
    results.steps.push('8. Attempting to insert division...')
    const { data: newDivision, error: insertError } = await supabase
      .from('divisions')
      .insert([testData])
      .select()
      .single()

    if (insertError) {
      results.steps.push(`❌ Insert failed: ${insertError.message}`)
      results.insertError = {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint
      }
      return NextResponse.json(results, { status: 500 })
    }

    results.steps.push('✅ Division created successfully!')
    results.success = true
    results.createdDivision = newDivision

    return NextResponse.json(results)

  } catch (error: any) {
    results.steps.push(`❌ Unexpected error: ${error.message}`)
    results.unexpectedError = {
      message: error.message,
      stack: error.stack
    }
    return NextResponse.json(results, { status: 500 })
  }
}