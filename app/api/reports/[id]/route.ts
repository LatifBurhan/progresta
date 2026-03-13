import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { deleteFromSupabase } from '@/lib/supabase-upload'
import { revalidateTag } from 'next/cache'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const reportId = params.id

    // Get report with details to check ownership and get file paths
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: {
        reportDetails: {
          select: {
            evidence: true
          }
        }
      }
    })

    if (!report) {
      return NextResponse.json(
        { success: false, message: 'Laporan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if user owns this report or has admin privileges
    if (report.userId !== session.userId && !['ADMIN', 'PM', 'CEO', 'HRD'].includes(session.role)) {
      return NextResponse.json(
        { success: false, message: 'Tidak memiliki izin untuk menghapus laporan ini' },
        { status: 403 }
      )
    }

    // Delete associated files from Supabase Storage
    const evidenceFiles = report.reportDetails
      .map(detail => detail.evidence)
      .filter(evidence => evidence !== null)

    for (const evidenceUrl of evidenceFiles) {
      if (evidenceUrl) {
        try {
          // Extract file path from URL
          const url = new URL(evidenceUrl)
          const pathParts = url.pathname.split('/')
          const filePath = pathParts.slice(pathParts.indexOf('reports')).join('/')
          
          await deleteFromSupabase(filePath)
        } catch (fileError) {
          console.error('Failed to delete file:', fileError)
          // Continue with report deletion even if file deletion fails
        }
      }
    }

    // Delete report (cascade will delete report_details)
    await prisma.report.delete({
      where: { id: reportId }
    })

    // Revalidate cache
    revalidateTag(`reports-${report.userId}`)
    revalidateTag('reports-all')
    revalidateTag(`user-${report.userId}`)

    return NextResponse.json({
      success: true,
      message: 'Laporan berhasil dihapus'
    })

  } catch (error) {
    console.error('Delete report error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat menghapus laporan' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifySession()
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const reportId = params.id
    const body = await request.json()

    // Get existing report to check ownership
    const existingReport = await prisma.report.findUnique({
      where: { id: reportId }
    })

    if (!existingReport) {
      return NextResponse.json(
        { success: false, message: 'Laporan tidak ditemukan' },
        { status: 404 }
      )
    }

    // Check if user owns this report
    if (existingReport.userId !== session.userId) {
      return NextResponse.json(
        { success: false, message: 'Tidak memiliki izin untuk mengedit laporan ini' },
        { status: 403 }
      )
    }

    // Update report
    const updatedReport = await prisma.report.update({
      where: { id: reportId },
      data: {
        // Add fields that can be updated
        issueDesc: body.issueDesc,
        hasIssue: body.hasIssue,
        // Note: We might not want to allow changing period, date, etc.
      }
    })

    // Revalidate cache
    revalidateTag(`reports-${existingReport.userId}`)
    revalidateTag('reports-all')

    return NextResponse.json({
      success: true,
      message: 'Laporan berhasil diperbarui',
      report: updatedReport
    })

  } catch (error) {
    console.error('Update report error:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan saat memperbarui laporan' },
      { status: 500 }
    )
  }
}