import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: divisions, error } = await supabase
      .from('divisions')
      .select('id, name, color')
      .order('name', { ascending: true })

    if (error) {
      return NextResponse.json({
        success: false,
        message: 'Error fetching divisions: ' + error.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      divisions: divisions || [],
      count: divisions?.length || 0
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      message: 'Internal server error: ' + error.message
    }, { status: 500 })
  }
}