import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Test endpoint for POST /api/reports/create
 * 
 * This endpoint tests the report creation flow by:
 * 1. Finding an active project
 * 2. Finding a user involved in that project
 * 3. Creating a test report
 * 
 * GET /api/reports/test-create
 */
export async function GET() {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({
        success: false,
        error: 'Database configuration error'
      }, { status: 500 })
    }

    console.log('🔍 Testing report creation flow...')

    // Step 1: Find an active project
    const { data: projects, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id, name, isActive')
      .eq('isActive', true)
      .limit(1)

    if (projectError || !projects || projects.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No active projects found',
        details: projectError?.message
      }, { status: 404 })
    }

    const project = projects[0]
    console.log('✅ Found active project:', project.name)

    // Step 2: Find a division involved in this project
    const { data: projectDivisions, error: pdError } = await supabaseAdmin
      .from('project_divisions')
      .select('division_id')
      .eq('project_id', project.id)
      .limit(1)

    if (pdError || !projectDivisions || projectDivisions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No divisions found for this project',
        details: pdError?.message
      }, { status: 404 })
    }

    const divisionId = projectDivisions[0].division_id
    console.log('✅ Found division involved in project')

    // Step 3: Find a user in this division
    const { data: users, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, divisionId')
      .eq('divisionId', divisionId)
      .limit(1)

    if (userError || !users || users.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No users found in this division',
        details: userError?.message
      }, { status: 404 })
    }

    const user = users[0]
    console.log('✅ Found user in division:', user.email)

    // Step 4: Create a test report
    const testReport = {
      user_id: user.id,
      project_id: project.id,
      lokasi_kerja: 'Kantor',
      pekerjaan_dikerjakan: 'Test report - automated test',
      kendala: 'Test kendala',
      rencana_kedepan: 'Test rencana',
      foto_urls: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg']
    }

    const { data: newReport, error: insertError } = await supabaseAdmin
      .from('project_reports')
      .insert([testReport])
      .select('id, created_at')
      .single()

    if (insertError) {
      console.error('❌ Failed to create report:', insertError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create test report',
        details: insertError.message
      }, { status: 500 })
    }

    console.log('✅ Test report created successfully:', newReport.id)

    // Step 5: Clean up - delete the test report
    const { error: deleteError } = await supabaseAdmin
      .from('project_reports')
      .delete()
      .eq('id', newReport.id)

    if (deleteError) {
      console.warn('⚠️ Failed to clean up test report:', deleteError)
    } else {
      console.log('✅ Test report cleaned up')
    }

    return NextResponse.json({
      success: true,
      message: 'Report creation test successful',
      testData: {
        project: { id: project.id, name: project.name },
        user: { id: user.id, email: user.email },
        report: { id: newReport.id, created_at: newReport.created_at }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('❌ Test failed:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
