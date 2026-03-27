import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const { name, description, divisionIds, startDate, endDate } = await request.json()

    console.log('Received create project request (no auth):', { name, description, divisionIds, startDate, endDate })

    if (!name || !name.trim()) {
      return NextResponse.json({ 
        success: false, 
        message: 'Nama project wajib diisi' 
      }, { status: 400 })
    }

    if (!divisionIds || !Array.isArray(divisionIds) || divisionIds.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Minimal satu divisi wajib dipilih' 
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

    const projectId = uuidv4()

    console.log('Creating project with ID:', projectId)

    // Simulate successful project creation
    const projectWithDetails = {
      id: projectId,
      name: name.trim(),
      description: description?.trim() || null,
      startDate: startDate,
      endDate: endDate,
      isActive: true,
      reportCount: 0,
      divisions: divisionIds.map((id, index) => ({ 
        id, 
        name: `Division ${index + 1}`, 
        color: '#3B82F6' 
      }))
    }

    console.log('Returning project:', projectWithDetails)

    // Here we would normally create the project in database
    // For now, let's just return success
    return NextResponse.json({
      success: true,
      message: 'Project berhasil dibuat (test mode)',
      project: projectWithDetails,
      note: 'This is a test endpoint without authentication'
    })

  } catch (error: any) {
    console.error('Create project error:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error: ' + error.message
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test create project endpoint (no auth required)',
    timestamp: new Date().toISOString(),
    usage: {
      method: 'POST',
      body: {
        name: 'Project Name',
        description: 'Project Description',
        divisionIds: ['division-id-1', 'division-id-2'],
        startDate: '2026-03-25',
        endDate: '2026-04-25'
      }
    }
  })
}