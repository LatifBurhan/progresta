import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Simple Queries...')
    
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Supabase admin client not configured'
      }, { status: 500 })
    }

    // Test 1: Simple divisions query
    console.log('Testing simple divisions query...')
    const { data: divisions, error: divisionsError } = await supabaseAdmin
      .from('divisions')
      .select('id, name, color, is_active')
      .limit(5)

    console.log('Divisions result:', { divisions, error: divisionsError })

    // Test 2: Simple projects query
    console.log('Testing simple projects query...')
    const { data: projects, error: projectsError } = await supabaseAdmin
      .from('projects')
      .select('id, name, status, created_at')
      .limit(5)

    console.log('Projects result:', { projects, error: projectsError })

    // Test 3: Simple project_divisions query
    console.log('Testing simple project_divisions query...')
    const { data: projectDivisions, error: pdError } = await supabaseAdmin
      .from('project_divisions')
      .select('project_id, division_id')
      .limit(5)

    console.log('Project divisions result:', { projectDivisions, error: pdError })

    return NextResponse.json({
      success: true,
      message: 'Simple queries test completed',
      results: {
        divisions: { data: divisions, error: divisionsError },
        projects: { data: projects, error: projectsError },
        projectDivisions: { data: projectDivisions, error: pdError }
      }
    })

  } catch (error: any) {
    console.error('❌ Simple query test error:', error)
    return NextResponse.json({
      success: false,
      message: 'Test failed: ' + error.message,
      error: error.toString()
    }, { status: 500 })
  }
}