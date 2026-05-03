/**
 * Notification System - Core Library
 * Handles all notification types: In-app, Toast, Email, Push
 */

import { supabaseAdmin } from './supabase'

export type NotificationType = 
  | 'project_assigned'
  | 'project_removed'
  | 'project_deleted'
  | 'project_created'
  | 'project_deadline'
  | 'project_status_changed'
  | 'project_overdue'
  | 'project_stagnant'
  | 'project_kendala'
  | 'project_completed'
  | 'report_reminder'
  | 'report_approved'
  | 'report_rejected'
  | 'report_commented'
  | 'report_submitted'
  | 'report_overdue'
  | 'user_registered'
  | 'user_approved'
  | 'user_rejected'
  | 'user_inactive'
  | 'payslip_available'
  | 'payslip_updated'
  | 'payslip_deleted'
  | 'payslip_reminder'
  | 'leave_approved'
  | 'leave_rejected'
  | 'leave_requested'
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
  console.log('📧 sendNotification called with:', {
    type: payload.type,
    title: payload.title,
    priority: payload.priority,
    userId: payload.userId,
    userIds: payload.userIds,
    role: payload.role,
  });
  
  const channels = DEFAULT_CHANNELS[payload.priority]
  
  console.log('📧 Notification channels:', channels);
  
  try {
    // Determine recipients
    const recipients = await getRecipients(payload)
    
    console.log('📧 Recipients found:', recipients.length, recipients);
    
    if (recipients.length === 0) {
      console.warn('⚠️ No recipients found for notification:', payload.type)
      return
    }

    // Send to all channels in parallel
    const promises = []

    if (channels.inApp) {
      console.log('📧 Sending in-app notification...');
      promises.push(sendInAppNotification(payload, recipients))
    }

    if (channels.email) {
      console.log('📧 Sending email notification...');
      promises.push(sendEmailNotification(payload, recipients))
    }

    if (channels.push) {
      console.log('📧 Sending push notification...');
      promises.push(sendPushNotification(payload, recipients))
    }

    await Promise.all(promises)

    console.log(`✅ Notification sent: ${payload.type} to ${recipients.length} users`)
  } catch (error) {
    console.error('❌ Failed to send notification:', error)
    console.error('Error details:', error)
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
  console.log('📱 sendInAppNotification called for', recipients.length, 'recipients');
  
  const now = new Date().toISOString()
  const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now

  // Save notifications to database first
  const notificationsToInsert = recipients.map(userId => ({
    id: crypto.randomUUID(),
    user_id: userId,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    priority: payload.priority,
    action_url: payload.actionUrl || null,
    data: payload.data || null,
    read: false,
    created_at: now,
    expires_at: expiresAt,
  }))

  console.log('📱 Inserting notifications to database:', notificationsToInsert.length);

  // Insert to database
  const { data: savedNotifications, error: dbError } = await supabaseAdmin
    .from('notifications')
    .insert(notificationsToInsert)
    .select()

  if (dbError) {
    console.error('❌ Failed to save notifications to database:', dbError)
    console.error('DB Error details:', JSON.stringify(dbError, null, 2))
    // Continue with realtime broadcast even if DB save fails
  } else {
    console.log('✅ Notifications saved to database:', savedNotifications?.length || 0)
  }

  // Broadcast to Supabase Realtime channel
  const notificationsToSend = savedNotifications || notificationsToInsert
  
  console.log('📡 Broadcasting to realtime channels...');
  
  for (let i = 0; i < recipients.length; i++) {
    const userId = recipients[i]
    const notification = notificationsToSend[i]
    
    console.log(`📡 Broadcasting to user ${userId}...`);
    
    const channel = supabaseAdmin.channel(`notifications:${userId}`)
    
    await channel.send({
      type: 'broadcast',
      event: 'notification',
      payload: {
        id: notification.id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        data: notification.data,
        actionUrl: notification.action_url,
        timestamp: notification.created_at,
        read: notification.read,
      }
    })
    
    console.log(`✅ Broadcast sent to user ${userId}`);
  }
  
  console.log('✅ All broadcasts completed');
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
  // For now, we'll skip email notifications
  console.log('📧 Email notification skipped (not configured yet)');
  console.log('   Recipients:', users.map(u => u.email).join(', '));
  
  // Uncomment when email API is ready:
  /*
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    await fetch(`${baseUrl}/api/notifications/email`, {
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
  */
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
  
  console.log('📱 Push notification skipped (not configured yet)');
  console.log('   Recipients:', recipients.length);
  
  // Uncomment when push API is ready:
  /*
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    await fetch(`${baseUrl}/api/notifications/push`, {
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
  */
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

  projectDeleted: (projectName: string, deletedBy: string): NotificationPayload => ({
    type: 'project_deleted',
    title: 'Project Dihapus',
    message: `Project "${projectName}" telah dihapus oleh ${deletedBy}`,
    priority: 'high',
    role: 'CEO',
    actionUrl: '/dashboard/admin/projects',
    data: { projectName, deletedBy }
  }),

  projectDeletedStaff: (projectName: string, userIds: string[]): NotificationPayload => ({
    type: 'project_deleted',
    title: 'Project Dihapus',
    message: `Project "${projectName}" yang Anda kerjakan telah dihapus`,
    priority: 'high',
    userIds,
    actionUrl: '/dashboard/reports',
    data: { projectName }
  }),

  projectCreated: (projectName: string, createdBy: string): NotificationPayload => ({
    type: 'project_created',
    title: 'Project Baru Dibuat',
    message: `Project baru "${projectName}" telah dibuat oleh ${createdBy}`,
    priority: 'medium',
    role: 'CEO',
    actionUrl: '/dashboard/admin/projects',
    data: { projectName, createdBy }
  }),

  projectRemoved: (projectName: string, userId: string): NotificationPayload => ({
    type: 'project_removed',
    title: 'Dihapus dari Project',
    message: `Anda telah dihapus dari project: ${projectName}`,
    priority: 'medium',
    userId,
    actionUrl: '/dashboard/reports',
    data: { projectName }
  }),

  projectCompleted: (projectName: string, userIds: string[]): NotificationPayload => ({
    type: 'project_completed',
    title: 'Project Selesai',
    message: `Selamat! Project "${projectName}" telah selesai`,
    priority: 'medium',
    userIds,
    actionUrl: '/dashboard/admin/projects',
    data: { projectName }
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

  reportOverdue: (projectName: string, userId: string): NotificationPayload => ({
    type: 'report_overdue',
    title: 'Laporan Terlambat',
    message: `Anda belum submit laporan untuk project "${projectName}" hari ini`,
    priority: 'high',
    userId,
    actionUrl: '/dashboard/reports',
    data: { projectName }
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

  userApproved: (userId: string): NotificationPayload => ({
    type: 'user_approved',
    title: 'Akun Disetujui',
    message: 'Selamat! Akun Anda telah disetujui. Silakan login untuk melanjutkan.',
    priority: 'high',
    userId,
    actionUrl: '/login',
  }),

  userRejected: (userId: string, reason?: string): NotificationPayload => ({
    type: 'user_rejected',
    title: 'Akun Ditolak',
    message: reason || 'Maaf, pendaftaran akun Anda ditolak. Silakan hubungi admin untuk informasi lebih lanjut.',
    priority: 'high',
    userId,
    actionUrl: '/login',
    data: { reason }
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

  payslipUpdated: (month: string, userId: string): NotificationPayload => ({
    type: 'payslip_updated',
    title: 'Slip Gaji Diperbarui',
    message: `Slip gaji bulan ${month} telah diperbarui. Silakan cek kembali.`,
    priority: 'medium',
    userId,
    actionUrl: '/dashboard/payslips',
    data: { month }
  }),

  payslipDeleted: (month: string, userId: string): NotificationPayload => ({
    type: 'payslip_deleted',
    title: 'Slip Gaji Dihapus',
    message: `Slip gaji bulan ${month} telah dihapus. Hubungi admin jika ada pertanyaan.`,
    priority: 'high',
    userId,
    actionUrl: '/dashboard/payslips',
    data: { month }
  }),

  payslipReminder: (month: string, userId: string): NotificationPayload => ({
    type: 'payslip_reminder',
    title: 'Reminder Slip Gaji',
    message: `Jangan lupa cek slip gaji bulan ${month}`,
    priority: 'low',
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

  leaveRejected: (userId: string, startDate: string, endDate: string, reason?: string): NotificationPayload => ({
    type: 'leave_rejected',
    title: 'Cuti Ditolak',
    message: `Pengajuan cuti Anda (${startDate} - ${endDate}) ditolak${reason ? `: ${reason}` : ''}`,
    priority: 'high',
    userId,
    actionUrl: '/dashboard/leave',
    data: { startDate, endDate, reason }
  }),

  leaveRequested: (userName: string, startDate: string, endDate: string): NotificationPayload => ({
    type: 'leave_requested',
    title: 'Pengajuan Cuti Baru',
    message: `${userName} mengajukan cuti (${startDate} - ${endDate})`,
    priority: 'medium',
    role: 'ADMIN',
    actionUrl: '/dashboard/admin/leave',
    data: { userName, startDate, endDate }
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
