import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { name, description, divisionIds, startDate, endDate } = await request.json()

    // Validate divisions exist
    const divisionsQuery = `
      SELECT id, name, color 
      FROM divisions 
      WHERE id = ANY(ARRAY[${divisionIds.map(id => `'${id}'`).join(', ')}])
    `

    // Use dynamic import to access MCP tools
    const { mcp_supabase_execute_sql } = await import('@/lib/mcp-tools')
    
    const divisionsResult = await mcp_supabase_execute_sql(divisionsQuery)
    
    if (!divisionsResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Gagal mengecek divisi: ' + divisionsResult.error
      }, { status: 500 })
    }

    const divisions = JSON.parse(divisionsResult.result)
    
    if (divisions.length !== divisionIds.length) {
      return NextResponse.json({
        success: false,
        message: 'Satu atau lebih divisi tidak ditemukan'
      }, { status: 404 })
    }

    const projectId = uuidv4()

    // Create project
    const createProjectQuery = `
      INSERT INTO projects (id, name, description, start_date, end_date, is_active, status_active, created_at, updated_at)
      VALUES (
        '${projectId}', 
        '${name.replace(/'/g, "''")}', 
        ${description ? `'${description.replace(/'/g, "''")}'` : 'NULL'}, 
        ${startDate ? `'${startDate}'` : 'NULL'}, 
        ${endDate ? `'${endDate}'` : 'NULL'}, 
        true, 
        true, 
        NOW(), 
        NOW()
      )
      RETURNING *;
    `

    const projectResult = await mcp_supabase_execute_sql(createProjectQuery)
    
    if (!projectResult.success) {
      return NextResponse.json({
        success: false,
        message: 'Gagal membuat project: ' + projectResult.error
      }, { status: 500 })
    }

    // Create project-division relationships
    const relationInserts = divisionIds.map(divisionId => 
      `('${uuidv4()}', '${projectId}', '${divisionId}', NOW())`
    ).join(', ')

    const createRelationsQuery = `
      INSERT INTO project_divisions (id, project_id, division_id, created_at)
      VALUES ${relationInserts};
    `

    const relationsResult = await mcp_supabase_execute_sql(createRelationsQuery)
    
    if (!relationsResult.success) {
      // Clean up project if relation fails
      await mcp_supabase_execute_sql(`DELETE FROM projects WHERE id = '${projectId}';`)
      return NextResponse.json({
        success: false,
        message: 'Gagal membuat relasi project-divisi: ' + relationsResult.error
      }, { status: 500 })
    }

    // Return project with details
    const projectWithDetails = {
      id: projectId,
      name: name,
      description: description || null,
      start_date: startDate,
      end_date: endDate,
      is_active: true,
      reportCount: 0,
      divisions: divisions
    }

    return NextResponse.json({
      success: true,
      message: 'Project berhasil dibuat',
      project: projectWithDetails
    })

  } catch (error: any) {
    console.error('Internal create project error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error: ' + error.message
    }, { status: 500 })
  }
}