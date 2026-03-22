import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Debug division create...')
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    console.log('Environment check:')
    console.log('- SUPABASE_URL:', supabaseUrl)
    console.log('- SERVICE_ROLE_KEY exists:', !!supabaseKey)
    console.log('- SERVICE_ROLE_KEY length:', supabaseKey?.length || 0)
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    const testData = {
      id: uuidv4(), // Generate UUID using uuid package
      name: 'Debug Test Division',
      description: 'Test division for debugging',
      color: '#FF0000'
    }
    
    console.log('Attempting to create division:', testData)
    
    // Test create
    const { data, error } = await supabase
      .from('divisions')
      .insert([testData])
      .select()
      .single()
    
    if (error) {
      console.error('❌ Create failed:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      }, { status: 500 })
    }
    
    console.log('✅ Create successful:', data)
    
    return NextResponse.json({
      success: true,
      message: 'Debug division created successfully',
      data
    })
    
  } catch (error: any) {
    console.error('❌ Debug failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}