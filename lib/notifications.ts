/**
 * Notification System - Core Library
 * Handles all notification types: In-app, Toast, Email, Push
 */

import { supabaseAdmin } from './supabase'

export type NotificationType = 
  | 'project_assigned'
  | 'project_deadline'
  | 'project_status_changed'
  | 'project_overdue'
  | 'project_stagnant'
  | 'project_kendala'
  | 'report_reminder'
  | 'report_approved'
  | 'report_rejected'
  | 'report_commented'
  | 'report_submitted'
  | 'user_registered'
  | 'user_inactive'
  | 'payslip_available'
  | 'payslip_reminder'
  | 'leave_approved'
  | 'leave_rejected'
  | 'system_alert'
  | 'weekly_summary'
  | 'monthly_report'

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface NotificationPayload {
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  userId?: string
  userIds?: string[]
  role?: string
  data?: Record<string, any>
  actionUrl?: string
}

export interface NotificationChannel {
  inApp: boolean
  toast: boolean
  email: boolean
  push: boolean
}

// Default channels based on priority
const DEFAULT_CHANNELS: Record<NotificationPriority, NotificationChannel> = {
  low: { inApp: true, toast: false, email: false, push: false },
  medium: { inApp: true, toast: true, email: false, push: false },
  high: { inApp: true, toast: true, email: true, push: false },
  urgent: { inApp: true, toast: true, email: true, push: true },
}

/**
 * Main notification sender
 */
export async function sendNotification(payload: NotificationPayload) {
  const channels = DEFAULT_CHANNELS[payload.priority]
  
  try {
    // Determine recipients
    const recipients = await getRecipients(payload)
    
    if (recipients.length === 0) {
      console.warn('No recipients found for notification:', payload.type)
      return
    }

    // Send to all channels in parallel
    const promises = []

    if (channels.inApp) {
      promises.push(sendInAppNotification(payload, recipients))
    }

    if (channels.email) {
      promises.push(sendEmailNotification(payload, recipients))
    }

    if (channels.push) {
      promises.push(sendPushNotification(payload, recipients))
    }

    await Promise.all(promises)

    console.log(`Notification sent: ${payload.type} to ${recipients.length} users`)
  } catch (error) {
    console.error('Failed to send notification:', error)
  }
}

/**
 * Get recipients based on payload
 */
async function getRecipients(payload: NotificationPayload): Promise<string[]> {
  // Direct user IDs
  if (payload.userId) {
    return [payload.userId]
  }

  if (payload.userIds && payload.userIds.length > 0) {
    return payload.userIds
  }

  // Role-based
  if (payload.role) {
    const { data: users } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('role', payload.role)

    return users?.map(u => u.id) || []
  }

  return []
}

/**
 * Send in-app notification via Supabase Realtime
 */
async function sendInAppNotification(
  payload: NotificationPayload,
  recipients: string[]
) {
  // Broadcast to Supabase Realtime channel
  for (const userId of recipients) {
    const channel = supabaseAdmin.channel(`notifications:${userId}`)
    
    await channel.send({
      type: 'broadcast',
      event: 'notification',
      payload: {
        id: crypto.randomUUID(),
        type: payload.type,
        title: payload.title,
        message: payload.message,
        priority: payload.priority,
        data: payload.data,
        actionUrl: payload.actionUrl,
        timestamp: new Date().toISOString(),
      }
    })
  }
}

/**
 * Send email notification
 */
async function sendEmailNotification(
  payload: NotificationPayload,
  recipients: string[]
) {
  // Get user emails
  const { data: users } = await supabaseAdmin
    .from('users')
    .select('email')
    .in('id', recipients)

  if (!users || users.length === 0) return

  // TODO: Integrate with email service (SendGrid, Resend, etc)
  // For now, we'll use Supabase Edge Function or API route
  
  try {
    await fetch('/api/notifications/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emails: users.map(u => u.email),
        subject: payload.title,
        message: payload.message,
        data: payload.data,
      })
    })
  } catch (error) {
    console.error('Failed to send email:', error)
  }
}

/**
 * Send push notification
 */
async function sendPushNotification(
  payload: NotificationPayload,
  recipients: string[]
) {
  // Send via Web Push API
  // This requires push subscriptions stored in database
  
  try {
    await fetch('/api/notifications/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userIds: recipients,
        title: payload.title,
        message: payload.message,
        data: payload.data,
        actionUrl: payload.actionUrl,
      })
    })
  } catch (error) {
    console.error('Failed to send push notification:', error)
  }
}

/**
 * Notification Templates
 */

export const NotificationTemplates = {
  // Project notifications
  projectAssigned: (projectName: string, userId: string): NotificationPayload => ({
    type: 'project_assigned',
    title: 'Project Baru Ditugaskan',
    message: `Anda ditambahkan ke project: ${projectName}`,
    priority: 'high',
    userId,
    actionUrl: '/dashboard/admin/projects',
    data: { projectName }
  }),

  projectDeadline: (projectName: string, daysLeft: number, userIds: string[]): NotificationPayload => ({
    type: 'project_deadline',
    title: 'Deadline Mendekat',
    message: `Project "${projectName}" akan berakhir dalam ${daysLeft} hari`,
    priority: daysLeft <= 1 ? 'urgent' : 'high',
    userIds,
    actionUrl: '/dashboard/admin/projects',
    data: { projectName, daysLeft }
  }),

  projectOverdue: (projectName: string, userIds: string[]): NotificationPayload => ({
    type: 'project_overdue',
    title: 'Project Overdue',
    message: `Project "${projectName}" sudah melewati deadline`,
    priority: 'urgent',
    userIds,
    actionUrl: '/dashboard/admin/projects',
    data: { projectName }
  }),

  projectStagnant: (projectName: string, days: number): NotificationPayload => ({
    type: 'project_stagnant',
    title: 'Project Stagnant',
    message: `Project "${projectName}" tidak ada laporan selama ${days} hari`,
    priority: 'high',
    role: 'ADMIN',
    actionUrl: '/dashboard/admin/projects',
    data: { projectName, days }
  }),

  // Report notifications
  reportReminder: (userId: string): NotificationPayload => ({
    type: 'report_reminder',
    title: 'Reminder Laporan',
    message: 'Jangan lupa submit laporan hari ini',
    priority: 'medium',
    userId,
    actionUrl: '/dashboard/reports',
  }),

  reportApproved: (projectName: string, userId: string): NotificationPayload => ({
    type: 'report_approved',
    title: 'Laporan Disetujui',
    message: `Laporan Anda untuk project "${projectName}" telah disetujui`,
    priority: 'medium',
    userId,
    actionUrl: '/dashboard/reports',
    data: { projectName }
  }),

  reportSubmitted: (userName: string, projectName: string): NotificationPayload => ({
    type: 'report_submitted',
    title: 'Laporan Baru',
    message: `${userName} submit laporan untuk "${projectName}"`,
    priority: 'low',
    role: 'ADMIN',
    actionUrl: '/dashboard/admin/reports',
    data: { userName, projectName }
  }),

  reportKendala: (userName: string, projectName: string, kendala: string): NotificationPayload => ({
    type: 'project_kendala',
    title: 'Kendala Dilaporkan',
    message: `${userName} melaporkan kendala di "${projectName}": ${kendala.substring(0, 50)}...`,
    priority: 'high',
    role: 'ADMIN',
    actionUrl: '/dashboard/admin/reports',
    data: { userName, projectName, kendala }
  }),

  // User notifications
  userRegistered: (email: string): NotificationPayload => ({
    type: 'user_registered',
    title: 'User Baru Mendaftar',
    message: `User baru menunggu approval: ${email}`,
    priority: 'medium',
    role: 'ADMIN',
    actionUrl: '/dashboard/admin/users/manage',
    data: { email }
  }),

  // Payslip notifications
  payslipAvailable: (month: string, userId: string): NotificationPayload => ({
    type: 'payslip_available',
    title: 'Slip Gaji Tersedia',
    message: `Slip gaji bulan ${month} sudah tersedia`,
    priority: 'high',
    userId,
    actionUrl: '/dashboard/payslips',
    data: { month }
  }),

  // Leave notifications
  leaveApproved: (userId: string, startDate: string, endDate: string): NotificationPayload => ({
    type: 'leave_approved',
    title: 'Cuti Disetujui',
    message: `Pengajuan cuti Anda (${startDate} - ${endDate}) telah disetujui`,
    priority: 'high',
    userId,
    actionUrl: '/dashboard/leave',
    data: { startDate, endDate }
  }),

  // System notifications
  systemAlert: (message: string): NotificationPayload => ({
    type: 'system_alert',
    title: 'System Alert',
    message,
    priority: 'urgent',
    role: 'ADMIN',
    data: { message }
  }),

  // Summary notifications
  weeklySummary: (stats: any, userId: string): NotificationPayload => ({
    type: 'weekly_summary',
    title: 'Ringkasan Mingguan',
    message: `Anda telah menyelesaikan ${stats.reports} laporan minggu ini`,
    priority: 'low',
    userId,
    actionUrl: '/dashboard',
    data: stats
  }),
}
