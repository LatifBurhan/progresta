import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get all users with divisions
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        email,
        role,
        status,
        divisionId,
        createdAt,
        divisions!inner(name, color)
      `)
      .eq('status', 'ACTIVE')
      .order('createdAt', { ascending: false })
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: error
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      count: users?.length || 0,
      users: users || []
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}