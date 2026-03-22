import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Check if projects table exists and get sample data
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .limit(3)
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        message: 'Projects table might not exist or has permission issues'
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      count: projects?.length || 0,
      projects: projects || [],
      columnNames: projects && projects.length > 0 ? Object.keys(projects[0]) : [],
      message: projects?.length === 0 ? 'Projects table exists but is empty' : 'Projects table exists with data'
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}