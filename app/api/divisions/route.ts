import { NextRequest, NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { createClient } from '@/lib/supabase'
import { z } from 'zod'

const CreateDivisionSchema = z.object({
  name: z.string().min(1, { message: 'Nama divisi harus diisi' }),
  description: z.string().optional(),
  color: z.string().optional(),
})

const UpdateDivisionSchema = z.object({
  id: z.string().min(1, { message: 'ID divisi harus diisi' }),
  name: z.string().min(1, { message: 'Nama divisi harus diisi' }),
  description: z.string().optional(),
  color: z.string().optional(),
})

// GET - List all divisions
export async function GET() {
  try {
    const session = await verifySession()
    if (!session || !['HRD', 'PM', 'CEO', 'ADMIN'].includes(session.role)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = createClient()

    // Get divisions with counts
    const { data: divisions, error } = await supabase
      .from('divisions')
      .select(`
        id,
        name,
        description,
        color,
        created_at,
        updated_at,
        users:users(count),
        project_divisions:project_divisions(count)
      `)
      .order('name', { ascending: true })

    if (error) {
      console.error('Get divisions error:', error)
      return NextResponse.json(
        { success: false, message: 'Terjadi kesalahan server' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      divisions: divisions.map(division => ({
        id: division.id,
        name: division.name,
        description: division.description,
        color: division.color || '#3B82F6',
        createdAt: new Date(division.created_at).toISOString(),
        updatedAt: new Date(division.updated_at).toISOString(),
        userCount: division.users?.[0]?.count || 0,
        projectCount: division.project_divisions?.[0]?.count || 0
      }))
    })
  } catch (error) {
    console.error('Get divisions error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// POST - Create new division
export async function POST(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session || !['HRD', 'PM', 'CEO', 'ADMIN'].includes(session.role)) {
      return NextResponse.json(
        { success: false, message: 'Hanya HRD/PM/CEO/ADMIN yang dapat membuat divisi' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = CreateDivisionSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Data tidak valid',
          errors: validatedData.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const { name, description, color } = validatedData.data
    const supabase = createClient()

    // Check if division name already exists
    const { data: existingDivision } = await supabase
      .from('divisions')
      .select('id')
      .eq('name', name.trim())
      .single()

    if (existingDivision) {
      return NextResponse.json(
        { success: false, message: 'Nama divisi sudah ada' },
        { status: 400 }
      )
    }

    // Create division
    const { data: division, error } = await supabase
      .from('divisions')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6'
      })
      .select()
      .single()

    if (error) {
      console.error('Create division error:', error)
      return NextResponse.json(
        { success: false, message: 'Terjadi kesalahan server' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Divisi "${name}" berhasil dibuat`,
      division: {
        id: division.id,
        name: division.name,
        description: division.description,
        color: division.color,
        createdAt: new Date(division.created_at).toISOString(),
        updatedAt: new Date(division.updated_at).toISOString(),
        userCount: 0,
        projectCount: 0
      }
    })
  } catch (error: any) {
    console.error('Create division error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// PUT - Update division
export async function PUT(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session || !['HRD', 'PM', 'CEO', 'ADMIN'].includes(session.role)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = UpdateDivisionSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Data tidak valid',
          errors: validatedData.error.flatten().fieldErrors
        },
        { status: 400 }
      )
    }

    const { id, name, description, color } = validatedData.data
    const supabase = createClient()

    // Check if division exists
    const { data: existingDivision } = await supabase
      .from('divisions')
      .select('name')
      .eq('id', id)
      .single()

    if (!existingDivision) {
      return NextResponse.json(
        { success: false, message: 'Divisi tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if new name conflicts with other divisions
    if (name.trim() !== existingDivision.name) {
      const { data: nameConflict } = await supabase
        .from('divisions')
        .select('id')
        .eq('name', name.trim())
        .neq('id', id)
        .single()

      if (nameConflict) {
        return NextResponse.json(
          { success: false, message: 'Nama divisi sudah digunakan' },
          { status: 400 }
        )
      }
    }

    // Update division
    const { data: updatedDivision, error } = await supabase
      .from('divisions')
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        color: color || '#3B82F6'
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update division error:', error)
      return NextResponse.json(
        { success: false, message: 'Terjadi kesalahan server' },
        { status: 500 }
      )
    }

    // Get counts
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('division_id', id)

    const { count: projectCount } = await supabase
      .from('project_divisions')
      .select('*', { count: 'exact', head: true })
      .eq('division_id', id)

    return NextResponse.json({
      success: true,
      message: `Divisi "${name}" berhasil diupdate`,
      division: {
        id: updatedDivision.id,
        name: updatedDivision.name,
        description: updatedDivision.description,
        color: updatedDivision.color,
        createdAt: new Date(updatedDivision.created_at).toISOString(),
        updatedAt: new Date(updatedDivision.updated_at).toISOString(),
        userCount: userCount || 0,
        projectCount: projectCount || 0
      }
    })
  } catch (error: any) {
    console.error('Update division error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// DELETE - Delete division
export async function DELETE(request: NextRequest) {
  try {
    const session = await verifySession()
    if (!session || !['HRD', 'CEO', 'ADMIN'].includes(session.role)) {
      return NextResponse.json(
        { success: false, message: 'Hanya HRD/CEO/ADMIN yang dapat menghapus divisi' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID divisi harus diisi' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Check if division exists
    const { data: division } = await supabase
      .from('divisions')
      .select('name')
      .eq('id', id)
      .single()

    if (!division) {
      return NextResponse.json(
        { success: false, message: 'Divisi tidak ditemukan' },
        { status: 404 }
      )
    }

    // Get counts
    const { count: userCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('division_id', id)

    const { count: projectCount } = await supabase
      .from('project_divisions')
      .select('*', { count: 'exact', head: true })
      .eq('division_id', id)

    // Check if division has users or projects
    if (userCount && userCount > 0) {
      return NextResponse.json(
        { success: false, message: `Tidak dapat menghapus divisi yang masih memiliki ${userCount} karyawan` },
        { status: 400 }
      )
    }

    if (projectCount && projectCount > 0) {
      return NextResponse.json(
        { success: false, message: `Tidak dapat menghapus divisi yang masih memiliki ${projectCount} project` },
        { status: 400 }
      )
    }

    // Delete division
    const { error } = await supabase
      .from('divisions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Delete division error:', error)
      return NextResponse.json(
        { success: false, message: 'Terjadi kesalahan server' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Divisi "${division.name}" berhasil dihapus`
    })
  } catch (error: any) {
    console.error('Delete division error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}