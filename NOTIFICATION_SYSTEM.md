# 🔔 Notification System - Implementation Guide

## 📋 Status: IN PROGRESS

### ✅ Completed:
1. Core notification library (`lib/notifications.ts`)
2. In-app notification bell component (`components/notifications/NotificationBell.tsx`)
3. Toast notification system (`components/notifications/ToastNotification.tsx`)
4. CSS animations for toasts

### 🚧 In Progress:
5. Email notification API
6. Push notification API
7. Integration with existing features
8. Notification triggers (cron jobs, webhooks)

### ⏳ Pending:
9. Testing & debugging
10. Documentation
11. Deployment guide

---

## 🎯 Notification Types Implemented

### For Users:
- ✅ Project assigned
- ✅ Project deadline approaching
- ✅ Project overdue
- ✅ Report reminder
- ✅ Report approved/rejected
- ✅ Payslip available
- ✅ Leave approved/rejected
- ✅ Weekly summary

### For Admins:
- ✅ User registered (pending approval)
- ✅ Project stagnant
- ✅ Report with kendala
- ✅ Report submitted
- ✅ System alerts

---

## 🔧 How to Use

### 1. Send Notification (Server-side)

```typescript
import { sendNotification, NotificationTemplates } from '@/lib/notifications'

// Example: Notify user about project assignment
await sendNotification(
  NotificationTemplates.projectAssigned('Project Alpha', 'user-id-123')
)

// Example: Notify admins about stagnant project
await sendNotification(
  NotificationTemplates.projectStagnant('Project Beta', 7)
)
```

### 2. Show Toast (Client-side)

```typescript
import { toast } from '@/components/notifications/ToastNotification'

// Success toast
toast.success('Berhasil', 'Data berhasil disimpan')

// Error toast
toast.error('Gagal', 'Terjadi kesalahan')

// Warning toast
toast.warning('Peringatan', 'Data akan dihapus')

// Info toast
toast.info('Info', 'Proses sedang berjalan')
```

### 3. Add Notification Bell to Layout

```typescript
import { NotificationBell } from '@/components/notifications/NotificationBell'

// In your layout/navbar
<NotificationBell userId={session.userId} />
```

### 4. Add Toast Container to Root Layout

```typescript
import { ToastContainer } from '@/components/notifications/ToastNotification'

// In app/layout.tsx
<body>
  {children}
  <ToastContainer />
</body>
```

---

## 📡 Real-time Setup

Notifications use **Supabase Realtime** for instant delivery.

### Channel Format:
```
notifications:{userId}
```

### Payload Structure:
```typescript
{
  id: string
  type: NotificationType
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  timestamp: string
  actionUrl?: string
  data?: any
}
```

---

## 🎨 Notification Priorities

| Priority | In-App | Toast | Email | Push |
|----------|--------|-------|-------|------|
| Low      | ✅     | ❌    | ❌    | ❌   |
| Medium   | ✅     | ✅    | ❌    | ❌   |
| High     | ✅     | ✅    | ✅    | ❌   |
| Urgent   | ✅     | ✅    | ✅    | ✅   |

---

## 🔗 Integration Points

### Where to Add Notifications:

1. **Project Management:**
   - `app/api/admin/projects/create/route.ts` - Project assigned
   - `app/api/admin/projects/[id]/route.ts` - Project updated
   - Cron job - Deadline reminders, overdue alerts

2. **Report Management:**
   - `app/api/reports/create/route.ts` - Report submitted
   - `app/api/reports/update/route.ts` - Report updated
   - Cron job - Daily report reminders

3. **User Management:**
   - `app/api/admin/users/create/route.ts` - User registered
   - `app/api/admin/users/action/route.ts` - User approved

4. **Payslip:**
   - `app/api/admin/payslips/publish/route.ts` - Payslip published

5. **Leave:**
   - `app/api/admin/leave/route.ts` - Leave approved/rejected

---

## 📧 Email Integration (TODO)

Need to integrate with email service:
- **Resend** (recommended)
- **SendGrid**
- **AWS SES**
- **Supabase Edge Function**

### Setup:
1. Choose email provider
2. Add API key to `.env`
3. Implement `/api/notifications/email` endpoint
4. Create email templates

---

## 📱 Push Notification Setup (TODO)

### Requirements:
1. VAPID keys for Web Push
2. Service Worker registration
3. Push subscription storage
4. `/api/notifications/push` endpoint

### Steps:
1. Generate VAPID keys
2. Register service worker
3. Request push permission
4. Store subscriptions
5. Send push notifications

---

## 🔄 Notification Triggers

### Automatic Triggers (Cron Jobs):

1. **Daily (9 AM):**
   - Report reminders for users who haven't submitted
   - Project deadline reminders (3 days, 1 day before)

2. **Weekly (Monday 9 AM):**
   - Weekly summary for all users
   - Stagnant project alerts for admins

3. **Monthly (1st day, 9 AM):**
   - Monthly report for management
   - Payslip reminders

### Event-based Triggers:

1. **On Project Create/Update:**
   - Notify assigned users
   - Notify admins if status changed

2. **On Report Submit:**
   - Notify admins
   - If kendala exists, high priority alert

3. **On User Register:**
   - Notify admins for approval

4. **On Payslip Publish:**
   - Notify all employees

---

## 🧪 Testing

### Manual Testing:

```typescript
// Test notification
import { sendNotification } from '@/lib/notifications'

await sendNotification({
  type: 'system_alert',
  title: 'Test Notification',
  message: 'This is a test',
  priority: 'high',
  userId: 'your-user-id'
})
```

### Check:
- ✅ Bell icon shows badge
- ✅ Notification appears in dropdown
- ✅ Toast appears on screen
- ✅ Click notification navigates to actionUrl
- ✅ Mark as read works
- ✅ Clear all works

---

## 📝 Next Steps

1. **Complete API endpoints:**
   - `/api/notifications/email`
   - `/api/notifications/push`

2. **Add notification triggers:**
   - Integrate with existing API routes
   - Create cron jobs for scheduled notifications

3. **Setup email service:**
   - Choose provider
   - Create templates
   - Test delivery

4. **Setup push notifications:**
   - Generate VAPID keys
   - Register service worker
   - Test on mobile

5. **Testing:**
   - Test all notification types
   - Test on mobile devices
   - Test email delivery
   - Test push notifications

6. **Documentation:**
   - Update README
   - Create user guide
   - Create admin guide

---

## 🐛 Troubleshooting

### Notifications not appearing:
1. Check Supabase Realtime is enabled
2. Check userId is correct
3. Check browser console for errors
4. Verify channel subscription

### Toast not showing:
1. Check ToastContainer is in layout
2. Check window.showToast exists
3. Check browser console for errors

### Email not sending:
1. Check email API endpoint
2. Check email service credentials
3. Check email templates
4. Check spam folder

---

**Status**: 🚧 In Development
**Last Updated**: 2024
