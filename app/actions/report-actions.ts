'use server'

import { z } from 'zod'
import { uploadToSupabase } from '@/lib/supabase-upload'
import { revalidateTag } from 'next/cache'
import { supabaseAdmin } from '@/lib/supabase'

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
  futurePlan: z.string().optional(),
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

    const { userId, period, location, futurePlan, projectDetails } = validatedData.data

    if (!supabaseAdmin) {
      return {
        success: false,
        message: 'Koneksi database tidak tersedia'
      }
    }

    // Get current date in Jakarta timezone
    const now = new Date()
    const jakartaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Jakarta"}))
    const reportDate = new Date(jakartaTime.getFullYear(), jakartaTime.getMonth(), jakartaTime.getDate())

    const reportDateStart = new Date(jakartaTime.getFullYear(), jakartaTime.getMonth(), jakartaTime.getDate(), 0, 0, 0, 0)
    const reportDateEnd = new Date(jakartaTime.getFullYear(), jakartaTime.getMonth(), jakartaTime.getDate(), 23, 59, 59, 999)

    const { data: existingReport } = await supabaseAdmin
      .from('reports')
      .select('id')
      .eq('userId', userId)
      .eq('period', period)
      .gte('reportDate', reportDateStart.toISOString())
      .lte('reportDate', reportDateEnd.toISOString())
      .maybeSingle()

    if (existingReport?.id) {
      return {
        success: false,
        message: `Laporan untuk periode ${period} hari ini sudah ada`
      }
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, divisionId')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return {
        success: false,
        message: 'User tidak ditemukan'
      }
    }

    const projectIds = projectDetails.map(p => p.projectId)
    const { data: projectRows, error: projectError } = await supabaseAdmin
      .from('projects')
      .select(`
        id,
        name,
        status,
        isActive,
        divisionId,
        project_divisions (
          division_id
        )
      `)
      .in('id', projectIds)

    if (projectError) {
      return {
        success: false,
        message: 'Gagal memvalidasi project'
      }
    }

    const accessibleProjectIds = new Set(
      (projectRows || [])
        .filter((project: any) => {
          const isActive = project.isActive === true || project.status === 'Aktif'
          if (!isActive || !user.divisionId) return false
          const involvedByLegacy = project.divisionId === user.divisionId
          const involvedByManyToMany = (project.project_divisions || []).some(
            (pd: any) => pd.division_id === user.divisionId
          )
          return involvedByLegacy || involvedByManyToMany
        })
        .map((project: any) => project.id)
    )

    if (projectIds.some(projectId => !accessibleProjectIds.has(projectId))) {
      return {
        success: false,
        message: 'Beberapa project tidak valid atau tidak dapat diakses'
      }
    }

    const totalHours = projectDetails.reduce((sum, detail) => sum + detail.hoursSpent, 0)
    const issueTexts = projectDetails
      .filter(detail => detail.issue && detail.issue.trim().length > 0)
      .map(detail => detail.issue?.trim())
    const mergedIssueDesc = [
      ...(issueTexts as string[]),
      futurePlan?.trim() ? `Rencana ke depan: ${futurePlan.trim()}` : null
    ].filter(Boolean).join(' | ')

    const hasIssue = issueTexts.length > 0

    const { data: report, error: reportError } = await supabaseAdmin
      .from('reports')
      .insert([{
        userId,
        reportDate: reportDate,
        reportTime: jakartaTime,
        period,
        hasIssue,
        issueDesc: mergedIssueDesc || null,
        totalHours
      }])
      .select('id, userId, reportDate, reportTime, period, hasIssue, issueDesc, totalHours')
      .single()

    if (reportError || !report) {
      return {
        success: false,
        message: 'Gagal membuat laporan utama'
      }
    }

    const preparedDetails: any[] = []
    for (const detail of projectDetails) {
      let evidenceUrl = null

      if (detail.evidence) {
        try {
          const uploadResult = await uploadToSupabase(
            detail.evidence,
            `reports/${userId}/${report.id}`
          )
          evidenceUrl = uploadResult.publicUrl
        } catch (uploadError) {
          console.error('Evidence upload failed:', uploadError)
        }
      }

      preparedDetails.push({
        reportId: report.id,
        projectId: detail.projectId,
        task: detail.task,
        progress: detail.progress,
        evidence: evidenceUrl,
        hoursSpent: detail.hoursSpent
      })
    }

    const { data: detailRows, error: detailError } = await supabaseAdmin
      .from('report_details')
      .insert(preparedDetails)
      .select(`
        id,
        projectId,
        task,
        progress,
        evidence,
        hoursSpent,
        projects (
          id,
          name
        )
      `)

    if (detailError) {
      await supabaseAdmin.from('reports').delete().eq('id', report.id)
      return {
        success: false,
        message: 'Gagal menyimpan detail laporan'
      }
    }

    // Revalidate cache
    revalidateTag(`reports-${userId}`)
    revalidateTag('reports-all')
    revalidateTag(`user-${userId}`)

    return {
      success: true,
      message: 'Laporan berhasil disimpan',
      reportId: report.id,
      report: {
        ...report,
        reportDetails: (detailRows || []).map((detail: any) => ({
          ...detail,
          project: detail.projects
        }))
      }
    }

  } catch (error) {
    console.error('Submit report error:', error)
    return {
      success: false,
      message: 'Terjadi kesalahan saat menyimpan laporan'
    }
  }
}
