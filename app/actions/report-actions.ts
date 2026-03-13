'use server'

import { z } from 'zod'
import prisma from '@/lib/prisma'
import { uploadToSupabase } from '@/lib/supabase-upload'
import { revalidateTag } from 'next/cache'

const ProjectDetailSchema = z.object({
  projectId: z.string().uuid(),
  task: z.string().min(1, 'Task harus diisi'),
  progress: z.string().min(1, 'Progress harus diisi'),
  issue: z.string().optional(),
  evidence: z.any().optional(), // File object
  hoursSpent: z.number().min(0.5).max(8)
})

const SubmitReportSchema = z.object({
  userId: z.string().uuid(),
  period: z.string().min(1, 'Periode harus dipilih'),
  location: z.string().min(1, 'Lokasi harus dipilih'),
  projectDetails: z.array(ProjectDetailSchema).min(1, 'Minimal satu project harus diisi')
})

export async function submitReport(data: any) {
  try {
    const validatedData = SubmitReportSchema.safeParse(data)
    
    if (!validatedData.success) {
      return {
        success: false,
        message: 'Data tidak valid',
        errors: validatedData.error.flatten().fieldErrors
      }
    }

    const { userId, period, location, projectDetails } = validatedData.data

    // Get current date in Jakarta timezone
    const now = new Date()
    const jakartaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Jakarta"}))
    const reportDate = new Date(jakartaTime.getFullYear(), jakartaTime.getMonth(), jakartaTime.getDate())

    // Check if report already exists for this period
    const existingReport = await prisma.report.findUnique({
      where: {
        userId_reportDate_period: {
          userId,
          reportDate,
          period
        }
      }
    })

    if (existingReport) {
      return {
        success: false,
        message: `Laporan untuk periode ${period} hari ini sudah ada`
      }
    }

    // Check if user has access to all projects
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { division: true }
    })

    if (!user) {
      return {
        success: false,
        message: 'User tidak ditemukan'
      }
    }

    const projectIds = projectDetails.map(p => p.projectId)
    const projects = await prisma.project.findMany({
      where: {
        id: { in: projectIds },
        divisionId: user.divisionId || undefined
      }
    })

    if (projects.length !== projectIds.length) {
      return {
        success: false,
        message: 'Beberapa project tidak valid atau tidak dapat diakses'
      }
    }
    // Calculate total hours and check for issues
    const totalHours = projectDetails.reduce((sum, detail) => sum + detail.hoursSpent, 0)
    const hasIssue = projectDetails.some(detail => detail.issue && detail.issue.trim().length > 0)
    const issueDesc = projectDetails
      .filter(detail => detail.issue && detail.issue.trim().length > 0)
      .map(detail => detail.issue)
      .join('; ')

    // Create report with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create main report
      const report = await tx.report.create({
        data: {
          userId,
          reportDate,
          reportTime: jakartaTime,
          period,
          hasIssue,
          issueDesc: hasIssue ? issueDesc : null,
          totalHours
        }
      })

      // Create report details
      for (const detail of projectDetails) {
        let evidenceUrl = null

        // Upload evidence if provided
        if (detail.evidence) {
          try {
            const uploadResult = await uploadToSupabase(
              detail.evidence,
              `reports/${userId}/${report.id}`
            )
            evidenceUrl = uploadResult.publicUrl
          } catch (uploadError) {
            console.error('Evidence upload failed:', uploadError)
            // Continue without evidence rather than failing the whole report
          }
        }

        await tx.reportDetail.create({
          data: {
            reportId: report.id,
            projectId: detail.projectId,
            task: detail.task,
            progress: detail.progress,
            evidence: evidenceUrl,
            hoursSpent: detail.hoursSpent
          }
        })
      }

      return report
    })

    // Revalidate cache
    revalidateTag(`reports-${userId}`)
    revalidateTag('reports-all')
    revalidateTag(`user-${userId}`)

    return {
      success: true,
      message: 'Laporan berhasil disimpan',
      reportId: result.id
    }

  } catch (error) {
    console.error('Submit report error:', error)
    return {
      success: false,
      message: 'Terjadi kesalahan saat menyimpan laporan'
    }
  }
}