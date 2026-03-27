import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get first division for testing
    const { data: divisions, error: divisionsError } = await supabase
      .from('divisions')
      .select('id, name')
      .limit(1)

    if (divisionsError || !divisions || divisions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No divisions found',
        details: divisionsError
      })
    }

    const divisionId = divisions[0].id
    const projectId = uuidv4()

    // Test create project (minimal columns)
    const { data: newProject, error: projectError } = await supabase
      .from('projects')
      .insert([{
        id: projectId,
        name: 'Test Project Multi Division',
        description: 'Testing multi division functionality',
        start_date: '2026-03-25',
        end_date: '2026-04-25'
      }])
      .select()
      .single()

    if (projectError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create project',
        details: projectError
      })
    }

    // Test create project-division relationship
    const { error: relationError } = await supabase
      .from('project_divisions')
      .insert([{
        id: uuidv4(),
        project_id: projectId,
        division_id: divisionId,
        created_at: new Date().toISOString()
      }])

    if (relationError) {
      // Clean up project if relation fails
      await supabase.from('projects').delete().eq('id', projectId)
      return NextResponse.json({
        success: false,
        error: 'Failed to create project-division relationship',
        details: relationError
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Test project created successfully',
      project: newProject,
      division: divisions[0]
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}