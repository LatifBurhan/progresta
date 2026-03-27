import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Project Management with Direct Queries...')
    
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        message: 'Supabase admin client not configured. Check SUPABASE_SERVICE_ROLE_KEY in .env'
      }, { status: 500 })
    }

    // Test 1: Get active divisions using SQL executor
    console.log('Testing divisions via SQL executor...')
    const { data: divisionsResult, error: divisionsError } = await supabaseAdmin
      .rpc('execute_query', { 
        query_text: 'SELECT id, name, color, is_active, description FROM divisions WHERE is_active = true ORDER BY name'
      })

    if (divisionsError) {
      console.error('❌ Divisions SQL Error:', divisionsError)
      return NextResponse.json({
        success: false,
        message: 'Divisions SQL failed: ' + divisionsError.message,
        error: divisionsError
      }, { status: 500 })
    }

    console.log('✅ Divisions SQL Success:', divisionsResult?.length || 0, 'divisions found')

    // Test 2: Get projects with divisions using SQL executor
    console.log('Testing projects via SQL executor...')
    const { data: projectsResult, error: projectsError } = await supabaseAdmin
      .rpc('execute_query', { 
        query_text: `
          SELECT 
            p.*,
            COALESCE(
              (
                SELECT json_agg(
                  json_build_object(
                    'id', d.id,
                    'name', d.name,
                    'color', d.color
                  )
                )
                FROM project_divisions pd
                JOIN divisions d ON pd.division_id = d.id
                WHERE pd.project_id = p.id
                AND d.is_active = true
              ), '[]'::json
            ) as divisions
          FROM projects p
          ORDER BY p.created_at DESC
        `
      })

    if (projectsError) {
      console.error('❌ Projects SQL Error:', projectsError)
      return NextResponse.json({
        success: false,
        message: 'Projects SQL failed: ' + projectsError.message,
        error: projectsError
      }, { status: 500 })
    }

    console.log('✅ Projects SQL Success:', projectsResult?.length || 0, 'projects found')

    // Log details
    if (projectsResult?.length > 0) {
      projectsResult.forEach((project: any, index: number) => {
        console.log(`   Project ${index + 1}: "${project.name}" with ${project.divisions?.length || 0} divisions`)
      })
    }

    return NextResponse.json({
      success: true,
      message: 'All SQL executor functions working correctly!',
      data: {
        divisions: divisionsResult || [],
        projects: projectsResult || []
      },
      stats: {
        divisionsCount: divisionsResult?.length || 0,
        projectsCount: projectsResult?.length || 0
      }
    })

  } catch (error: any) {
    console.error('❌ Debug RPC test error:', error)
    return NextResponse.json({
      success: false,
      message: 'Debug test failed: ' + error.message,
      error: error.toString()
    }, { status: 500 })
  }
}