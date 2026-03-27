import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { sql } = await request.json()

    if (!sql) {
      return NextResponse.json({
        success: false,
        message: 'SQL query is required'
      }, { status: 400 })
    }

    // Import MCP function dynamically
    const { mcp_supabase_execute_sql } = require('@/lib/mcp')
    
    const result = await mcp_supabase_execute_sql({ query: sql })
    
    return NextResponse.json({
      success: true,
      data: result.result ? JSON.parse(result.result) : null
    })

  } catch (error: any) {
    console.error('Execute SQL error:', error)
    return NextResponse.json({
      success: false,
      message: 'SQL execution failed: ' + error.message
    }, { status: 500 })
  }
}