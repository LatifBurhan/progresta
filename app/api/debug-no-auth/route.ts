import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
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

    // Step 2: Create Supabase client
    results.steps.push('2. Creating Supabase client...')
    const supabase = createClient(supabaseUrl, supabaseKey)
    results.steps.push('✅ Supabase client created')

    // Step 3: Test basic connection
    results.steps.push('3. Testing database connection...')
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

    // Step 4: Generate UUID
    results.steps.push('4. Generating UUID...')
    const newId = uuidv4()
    results.steps.push(`✅ UUID generated: ${newId}`)
    results.generatedId = newId

    // Step 5: Prepare test data
    results.steps.push('5. Preparing test data...')
    const testData = {
      id: newId,
      name: `Test Division ${Date.now()}`,
      description: 'Debug test division (no auth)',
      color: '#00FF00'
    }
    results.steps.push('✅ Test data prepared')
    results.testData = testData

    // Step 6: Check for existing name
    results.steps.push('6. Checking for existing division name...')
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

    // Step 7: Attempt insert
    results.steps.push('7. Attempting to insert division...')
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