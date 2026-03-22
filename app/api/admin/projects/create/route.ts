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

    // Only PM, HRD, CEO, ADMIN can create projects
    if (!['PM', 'HRD', 'CEO', 'ADMIN'].includes(session.role)) {
      return NextResponse.json({ success: false, message: 'Insufficient permissions' }, { status: 403 })
    }

    const { name, description, client, divisionId, startDate, endDate } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ 
        success: false, 
        message: 'Nama project wajib diisi' 
      }, { status: 400 })
    }

    if (!divisionId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Divisi wajib dipilih' 
      }, { status: 400 })
    }

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      if (end <= start) {
        return NextResponse.json({ 
          success: false, 
          message: 'Tanggal selesai harus setelah tanggal mulai' 
        }, { status: 400 })
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Check if division exists
    const { data: division, error: divisionError } = await supabase
      .from('divisions')
      .select('id, name, color')
      .eq('id', divisionId)
      .single()

    if (divisionError || !division) {
      return NextResponse.json({ 
        success: false, 
        message: 'Divisi tidak ditemukan' 
      }, { status: 404 })
    }

    // Create project
    const { data: newProject, error: projectError } = await supabase
      .from('projects')
      .insert([{
        id: uuidv4(),
        name: name.trim(),
        description: description?.trim() || null,
        divisionId: divisionId,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: endDate ? new Date(endDate).toISOString() : null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single()

    if (projectError) {
      console.error('Supabase create project error:', projectError)
      return NextResponse.json({
        success: false,
        message: 'Gagal membuat project: ' + projectError.message
      }, { status: 500 })
    }

    // Return project with details
    const projectWithDetails = {
      ...newProject,
      reportCount: 0, // New project has no reports
      division: division // Include division info
    }

    return NextResponse.json({
      success: true,
      message: 'Project berhasil dibuat',
      project: projectWithDetails
    })

  } catch (error: any) {
    console.error('Create project error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error: ' + error.message
    }, { status: 500 })
  }
}