import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Get all divisions
    const { data: divisions, error } = await supabase
      .from('divisions')
      .select('id, name, description, color, createdAt, updatedAt, isActive')
      .eq('isActive', true)  // Only get active divisions
      .order('name', { ascending: true })
    
    if (error) {
      console.error('❌ Failed to fetch divisions:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }
    
    // Transform data to match expected format
    const transformedDivisions = divisions.map(division => ({
      id: division.id,
      name: division.name,
      description: division.description,
      color: division.color || '#3B82F6',
      createdAt: division.createdAt,
      updatedAt: division.updatedAt,
      isActive: division.isActive
    }))
    
    return NextResponse.json({
      success: true,
      divisions: transformedDivisions,
      count: divisions.length
    })
    
  } catch (error: any) {
    console.error('❌ API error:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}