import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    console.log('🔍 Testing Supabase connection...')
    console.log('URL:', supabaseUrl)
    console.log('Key exists:', !!supabaseKey)
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Test simple query
    const { data, error } = await supabase
      .from('divisions')
      .select('id, name, description, color')
      .limit(10)
    
    if (error) {
      console.error('❌ Database error:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      }, { status: 500 })
    }
    
    console.log('✅ Database query successful')
    console.log('📊 Found divisions:', data?.length || 0)
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      divisionCount: data?.length || 0,
      divisions: data || [],
      timestamp: new Date().toISOString()
    })
    
  } catch (error: any) {
    console.error('❌ Connection test failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}