import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing SQL Executor Function...')
    
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Supabase admin client not configured'
      }, { status: 500 })
    }

    // Test 1: Simple divisions query
    console.log('Testing divisions via SQL executor...')
    const { data: divisionsResult, error: divisionsError } = await supabaseAdmin
      .rpc('execute_query', { 
        query_text: 'SELECT id, name, color, is_active FROM divisions WHERE is_active = true ORDER BY name LIMIT 3'
      })

    console.log('Divisions result:', { divisionsResult, error: divisionsError })

    // Test 2: Simple projects query
    console.log('Testing projects via SQL executor...')
    const { data: projectsResult, error: projectsError } = await supabaseAdmin
      .rpc('execute_query', { 
        query_text: 'SELECT id, name, status FROM projects ORDER BY created_at DESC LIMIT 3'
      })

    console.log('Projects result:', { projectsResult, error: projectsError })

    return NextResponse.json({
      success: true,
      message: 'SQL Executor test completed',
      results: {
        divisions: { data: divisionsResult, error: divisionsError },
        projects: { data: projectsResult, error: projectsError }
      }
    })

  } catch (error: any) {
    console.error('❌ SQL Executor test error:', error)
    return NextResponse.json({
      success: false,
      message: 'Test failed: ' + error.message,
      error: error.toString()
    }, { status: 500 })
  }
}