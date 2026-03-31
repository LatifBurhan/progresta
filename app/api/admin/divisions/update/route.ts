import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { createClient } from '@supabase/supabase-js'

export async function PUT(request: NextRequest) {
  try {
    const session = await verifySession()

    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Only GENERAL_AFFAIR, CEO, ADMIN can update divisions
    if (!['GENERAL_AFFAIR', 'CEO', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 })
    }

    const { divisionId, name, description, color, departmentId } = await request.json()

    if (!divisionId || !name || !name.trim()) {
      return NextResponse.json({ 
        success: false, 
        message: 'Division ID dan nama divisi wajib diisi' 
      }, { status: 400 })
    }

    if (!departmentId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Departemen wajib dipilih' 
      }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if division exists
    const { data: existingDivision } = await supabase
      .from('divisions')
      .select('id, name')
      .eq('id', divisionId)
      .single()

    if (!existingDivision) {
      return NextResponse.json({ 
        success: false, 
        message: 'Division not found' 
      }, { status: 404 })
    }

    // Check if new name is taken by another division
    if (name.trim() !== existingDivision.name) {
      const { data: nameExists } = await supabase
        .from('divisions')
        .select('id')
        .eq('name', name.trim())
        .single()

      if (nameExists) {
        return NextResponse.json({ 
          success: false, 
          message: 'Nama divisi sudah digunakan' 
        }, { status: 400 })
      }
    }

    // Update division
    const { data: updatedDivision, error } = await supabase
      .from('divisions')
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6',
        department_id: departmentId,
        updatedAt: new Date().toISOString()
      })
      .eq('id', divisionId)
      .select()
      .single()

    if (error) {
      console.error('Supabase update division error:', error)
      return NextResponse.json({
        success: false,
        message: 'Gagal mengupdate divisi: ' + error.message
      }, { status: 500 })
    }

    // Return division with counts (set to 0 for now)
    const divisionWithCounts = {
      ...updatedDivision,
      createdAt: updatedDivision.created_at,
      updatedAt: updatedDivision.updated_at,
      userCount: 0,
      projectCount: 0
    }

    return NextResponse.json({
      success: true,
      message: 'Divisi berhasil diupdate',
      division: divisionWithCounts
    })

  } catch (error: any) {
    console.error('Update division error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error: ' + error.message
    }, { status: 500 })
  }
}