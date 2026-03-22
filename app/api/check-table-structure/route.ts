import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Check table structure
    const { data: columns, error } = await supabase
      .rpc('get_table_columns', { table_name: 'divisions' })
    
    if (error) {
      // Fallback: try direct SQL query
      const { data: directQuery, error: directError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_name', 'divisions')
        .eq('table_schema', 'public')
        .order('ordinal_position')
      
      if (directError) {
        return NextResponse.json({
          success: false,
          error: 'Could not get table structure',
          details: directError
        }, { status: 500 })
      }
      
      return NextResponse.json({
        success: true,
        tableName: 'divisions',
        columns: directQuery
      })
    }
    
    return NextResponse.json({
      success: true,
      tableName: 'divisions',
      columns
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}