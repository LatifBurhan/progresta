import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Only HRD, CEO, ADMIN can create divisions
    if (!['HRD', 'CEO', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 })
    }

    const { name, description, color } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ 
        success: false, 
        message: 'Nama divisi wajib diisi' 
      }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if division name already exists
    const { data: existingDivision } = await supabase
      .from('divisions')
      .select('id, name')
      .eq('name', name.trim())
      .single()

    if (existingDivision) {
      return NextResponse.json({ 
        success: false, 
        message: 'Nama divisi sudah digunakan' 
      }, { status: 400 })
    }

    // Create division
    const { data: newDivision, error } = await supabase
      .from('divisions')
      .insert([{
        id: uuidv4(), // Generate UUID using uuid package
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true
      }])
      .select()
      .single()

    if (error) {
      console.error('Supabase create division error:', error)
      return NextResponse.json({
        success: false,
        message: 'Gagal membuat divisi: ' + error.message
      }, { status: 500 })
    }

    // Return division with counts (new division has 0 users and projects)
    const divisionWithCounts = {
      ...newDivision,
      userCount: 0,
      projectCount: 0
    }

    return NextResponse.json({
      success: true,
      message: 'Divisi berhasil dibuat',
      division: divisionWithCounts
    })

  } catch (error: any) {
    console.error('Create division error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error: ' + error.message
    }, { status: 500 })
  }
}