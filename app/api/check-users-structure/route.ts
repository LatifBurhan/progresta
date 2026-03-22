import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get existing users to see the actual column structure
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .limit(2)
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      count: users?.length || 0,
      sampleUsers: users,
      columnNames: users && users.length > 0 ? Object.keys(users[0]) : []
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}