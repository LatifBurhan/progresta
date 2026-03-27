import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Test 1: Basic connection
    const { data: divisions, error: divError } = await supabase
      .from('divisions')
      .select('id, name')
      .limit(3)

    if (divError) {
      return NextResponse.json({
        success: false,
        message: 'Division query failed: ' + divError.message,
        error: divError
      }, { status: 500 })
    }

    // Test 2: Projects query
    const { data: projects, error: projError } = await supabase
      .from('projects')
      .select('id, name, client, description, start_date, end_date, is_active')
      .limit(3)

    if (projError) {
      return NextResponse.json({
        success: false,
        message: 'Projects query failed: ' + projError.message,
        error: projError
      }, { status: 500 })
    }

    // Test 3: Project divisions query
    const { data: projectDivisions, error: pdError } = await supabase
      .from('project_divisions')
      .select('id, project_id, division_id')
      .limit(3)

    if (pdError) {
      return NextResponse.json({
        success: false,
        message: 'Project divisions query failed: ' + pdError.message,
        error: pdError
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        divisions: divisions,
        projects: projects,
        projectDivisions: projectDivisions
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Connection test failed: ' + error.message
    }, { status: 500 })
  }
}