# Sistem Notifikasi Lengkap

## Daftar Notifikasi yang Tersedia

### 📁 Project Notifications

#### 1. Project Created (CEO)
**Trigger:** Saat project baru dibuat
**Penerima:** CEO
**Prioritas:** Medium
**Template:** `NotificationTemplates.projectCreated(projectName, createdBy)`

```typescript
{
  title: 'Project Baru Dibuat',
  message: 'Project baru "PROJECT NAME" telah dibuat oleh ADMIN NAME',
  priority: 'medium',
  role: 'CEO',
  actionUrl: '/dashboard/admin/projects'
}
```

#### 2. Project Assigned (Staff)
**Trigger:** Saat user ditambahkan ke project
**Penerima:** User yang ditambahkan
**Prioritas:** High
**Template:** `NotificationTemplates.projectAssigned(projectName, userId)`

```typescript
{
  title: 'Project Baru Ditugaskan',
  message: 'Anda ditambahkan ke project: PROJECT NAME',
  priority: 'high',
  userId: 'user-id',
  actionUrl: '/dashboard/admin/projects'
}
```

#### 3. Project Removed (Staff)
**Trigger:** Saat user dihapus dari project
**Penerima:** User yang dihapus
**Prioritas:** Medium
**Template:** `NotificationTemplates.projectRemoved(projectName, userId)`

```typescript
{
  title: 'Dihapus dari Project',
  message: 'Anda telah dihapus dari project: PROJECT NAME',
  priority: 'medium',
  userId: 'user-id',
  actionUrl: '/dashboard/reports'
}
```

#### 4. Project Deleted (CEO)
**Trigger:** Saat project dihapus
**Penerima:** CEO
**Prioritas:** High
**Template:** `NotificationTemplates.projectDeleted(projectName, deletedBy)`

```typescript
{
  title: 'Project Dihapus',
  message: 'Project "PROJECT NAME" telah dihapus oleh ADMIN NAME',
  priority: 'high',
  role: 'CEO',
  actionUrl: '/dashboard/admin/projects'
}
```

#### 5. Project Deleted (Staff)
**Trigger:** Saat project yang dikerjakan staff dihapus
**Penerima:** Semua staff yang assigned ke project
**Prioritas:** High
**Template:** `NotificationTemplates.projectDeletedStaff(projectName, userIds)`

```typescript
{
  title: 'Project Dihapus',
  message: 'Project "PROJECT NAME" yang Anda kerjakan telah dihapus',
  priority: 'high',
  userIds: ['user-id-1', 'user-id-2'],
  actionUrl: '/dashboard/reports'
}
```

#### 6. Project Status Changed
**Trigger:** Saat status project berubah
**Penerima:** Semua staff yang assigned ke project
**Prioritas:** Medium/High (tergantung status)
**Implementasi:** Sudah ada di `PUT /api/admin/projects/[id]`

```typescript
{
  title: 'Status Project Berubah',
  message: 'Project "PROJECT NAME" statusnya berubah dari Aktif menjadi Selesai',
  priority: 'medium', // 'high' jika Dibatalkan/Ditunda
  userIds: ['user-id-1', 'user-id-2'],
  actionUrl: '/dashboard/admin/projects'
}
```

#### 7. Project Completed
**Trigger:** Saat project selesai (status = Selesai)
**Penerima:** Semua staff yang assigned ke project
**Prioritas:** Medium
**Template:** `NotificationTemplates.projectCompleted(projectName, userIds)`

```typescript
{
  title: 'Project Selesai',
  message: 'Selamat! Project "PROJECT NAME" telah selesai',
  priority: 'medium',
  userIds: ['user-id-1', 'user-id-2'],
  actionUrl: '/dashboard/admin/projects'
}
```

#### 8. Project Deadline (Staff)
**Trigger:** Saat deadline project mendekat (automated job)
**Penerima:** Semua staff yang assigned ke project
**Prioritas:** High/Urgent (tergantung sisa hari)
**Template:** `NotificationTemplates.projectDeadline(projectName, daysLeft, userIds)`

```typescript
{
  title: 'Deadline Mendekat',
  message: 'Project "PROJECT NAME" akan berakhir dalam 3 hari',
  priority: 'high', // 'urgent' jika <= 1 hari
  userIds: ['user-id-1', 'user-id-2'],
  actionUrl: '/dashboard/admin/projects'
}
```

#### 9. Project Overdue (Staff)
**Trigger:** Saat project melewati deadline (automated job)
**Penerima:** Semua staff yang assigned ke project
**Prioritas:** Urgent
**Template:** `NotificationTemplates.projectOverdue(projectName, userIds)`

```typescript
{
  title: 'Project Overdue',
  message: 'Project "PROJECT NAME" sudah melewati deadline',
  priority: 'urgent',
  userIds: ['user-id-1', 'user-id-2'],
  actionUrl: '/dashboard/admin/projects'
}
```

#### 10. Project Stagnant (Admin/CEO)
**Trigger:** Saat project tidak ada laporan selama X hari (automated job)
**Penerima:** Admin/CEO
**Prioritas:** High
**Template:** `NotificationTemplates.projectStagnant(projectName, days)`

```typescript
{
  title: 'Project Stagnant',
  message: 'Project "PROJECT NAME" tidak ada laporan selama 7 hari',
  priority: 'high',
  role: 'ADMIN',
  actionUrl: '/dashboard/admin/projects'
}
```

---

### 📝 Report Notifications

#### 11. Report Submitted (Admin)
**Trigger:** Saat staff submit laporan
**Penerima:** Admin
**Prioritas:** Low
**Template:** `NotificationTemplates.reportSubmitted(userName, projectName)`

```typescript
{
  title: 'Laporan Baru',
  message: 'STAFF NAME submit laporan untuk "PROJECT NAME"',
  priority: 'low',
  role: 'ADMIN',
  actionUrl: '/dashboard/admin/reports'
}
```

#### 12. Report Approved (Staff)
**Trigger:** Saat laporan disetujui admin
**Penerima:** Staff yang submit laporan
**Prioritas:** Medium
**Template:** `NotificationTemplates.reportApproved(projectName, userId)`

```typescript
{
  title: 'Laporan Disetujui',
  message: 'Laporan Anda untuk project "PROJECT NAME" telah disetujui',
  priority: 'medium',
  userId: 'user-id',
  actionUrl: '/dashboard/reports'
}
```

#### 13. Report Rejected (Staff)
**Trigger:** Saat laporan ditolak admin
**Penerima:** Staff yang submit laporan
**Prioritas:** High
**Template:** `NotificationTemplates.reportRejected(projectName, userId, reason)`

```typescript
{
  title: 'Laporan Ditolak',
  message: 'Laporan Anda untuk project "PROJECT NAME" ditolak: REASON',
  priority: 'high',
  userId: 'user-id',
  actionUrl: '/dashboard/reports'
}
```

#### 14. Report Kendala (Admin)
**Trigger:** Saat staff melaporkan kendala
**Penerima:** Admin
**Prioritas:** High
**Template:** `NotificationTemplates.reportKendala(userName, projectName, kendala)`

```typescript
{
  title: 'Kendala Dilaporkan',
  message: 'STAFF NAME melaporkan kendala di "PROJECT NAME": KENDALA...',
  priority: 'high',
  role: 'ADMIN',
  actionUrl: '/dashboard/admin/reports'
}
```

#### 15. Report Reminder (Staff)
**Trigger:** Reminder harian untuk submit laporan (automated job)
**Penerima:** Staff yang belum submit laporan hari ini
**Prioritas:** Medium
**Template:** `NotificationTemplates.reportReminder(userId)`

```typescript
{
  title: 'Reminder Laporan',
  message: 'Jangan lupa submit laporan hari ini',
  priority: 'medium',
  userId: 'user-id',
  actionUrl: '/dashboard/reports'
}
```

#### 16. Report Overdue (Staff)
**Trigger:** Saat staff belum submit laporan (automated job)
**Penerima:** Staff yang terlambat
**Prioritas:** High
**Template:** `NotificationTemplates.reportOverdue(projectName, userId)`

```typescript
{
  title: 'Laporan Terlambat',
  message: 'Anda belum submit laporan untuk project "PROJECT NAME" hari ini',
  priority: 'high',
  userId: 'user-id',
  actionUrl: '/dashboard/reports'
}
```

---

### 👤 User Notifications

#### 17. User Registered (Admin)
**Trigger:** Saat user baru mendaftar
**Penerima:** Admin
**Prioritas:** Medium
**Template:** `NotificationTemplates.userRegistered(email)`

```typescript
{
  title: 'User Baru Mendaftar',
  message: 'User baru menunggu approval: user@email.com',
  priority: 'medium',
  role: 'ADMIN',
  actionUrl: '/dashboard/admin/users/manage'
}
```

#### 18. User Approved (User)
**Trigger:** Saat akun user disetujui
**Penerima:** User yang disetujui
**Prioritas:** High
**Template:** `NotificationTemplates.userApproved(userId)`

```typescript
{
  title: 'Akun Disetujui',
  message: 'Selamat! Akun Anda telah disetujui. Silakan login untuk melanjutkan.',
  priority: 'high',
  userId: 'user-id',
  actionUrl: '/login'
}
```

#### 19. User Rejected (User)
**Trigger:** Saat akun user ditolak
**Penerima:** User yang ditolak
**Prioritas:** High
**Template:** `NotificationTemplates.userRejected(userId, reason)`

```typescript
{
  title: 'Akun Ditolak',
  message: 'Maaf, pendaftaran akun Anda ditolak. Silakan hubungi admin...',
  priority: 'high',
  userId: 'user-id',
  actionUrl: '/login'
}
```

---

### 💰 Payslip Notifications

#### 20. Payslip Available (Staff)
**Trigger:** Saat slip gaji dipublish
**Penerima:** Staff yang slip gajinya tersedia
**Prioritas:** High
**Template:** `NotificationTemplates.payslipAvailable(month, userId)`

```typescript
{
  title: 'Slip Gaji Tersedia',
  message: 'Slip gaji bulan Januari 2026 sudah tersedia',
  priority: 'high',
  userId: 'user-id',
  actionUrl: '/dashboard/payslips'
}
```

#### 21. Payslip Reminder (Staff)
**Trigger:** Reminder untuk cek slip gaji (automated job)
**Penerima:** Staff yang belum cek slip gaji
**Prioritas:** Medium
**Template:** `NotificationTemplates.payslipReminder(month, userId)`

```typescript
{
  title: 'Reminder Slip Gaji',
  message: 'Jangan lupa cek slip gaji bulan Januari 2026',
  priority: 'medium',
  userId: 'user-id',
  actionUrl: '/dashboard/payslips'
}
```

---

### 🏖️ Leave Notifications

#### 22. Leave Requested (Admin)
**Trigger:** Saat staff mengajukan cuti
**Penerima:** Admin
**Prioritas:** Medium
**Template:** `NotificationTemplates.leaveRequested(userName, startDate, endDate)`

```typescript
{
  title: 'Pengajuan Cuti Baru',
  message: 'STAFF NAME mengajukan cuti (01 Jan 2026 - 05 Jan 2026)',
  priority: 'medium',
  role: 'ADMIN',
  actionUrl: '/dashboard/admin/leave'
}
```

#### 23. Leave Approved (Staff)
**Trigger:** Saat cuti disetujui
**Penerima:** Staff yang mengajukan cuti
**Prioritas:** High
**Template:** `NotificationTemplates.leaveApproved(userId, startDate, endDate)`

```typescript
{
  title: 'Cuti Disetujui',
  message: 'Pengajuan cuti Anda (01 Jan 2026 - 05 Jan 2026) telah disetujui',
  priority: 'high',
  userId: 'user-id',
  actionUrl: '/dashboard/leave'
}
```

#### 24. Leave Rejected (Staff)
**Trigger:** Saat cuti ditolak
**Penerima:** Staff yang mengajukan cuti
**Prioritas:** High
**Template:** `NotificationTemplates.leaveRejected(userId, startDate, endDate, reason)`

```typescript
{
  title: 'Cuti Ditolak',
  message: 'Pengajuan cuti Anda (01 Jan 2026 - 05 Jan 2026) ditolak: REASON',
  priority: 'high',
  userId: 'user-id',
  actionUrl: '/dashboard/leave'
}
```

---

### 🔔 System Notifications

#### 25. System Alert (Admin/CEO)
**Trigger:** Alert sistem penting
**Penerima:** Admin/CEO
**Prioritas:** Urgent
**Template:** `NotificationTemplates.systemAlert(message)`

```typescript
{
  title: 'System Alert',
  message: 'ALERT MESSAGE',
  priority: 'urgent',
  role: 'ADMIN'
}
```

#### 26. Weekly Summary (Staff)
**Trigger:** Ringkasan mingguan (automated job)
**Penerima:** Staff
**Prioritas:** Low
**Template:** `NotificationTemplates.weeklySummary(stats, userId)`

```typescript
{
  title: 'Ringkasan Mingguan',
  message: 'Anda telah menyelesaikan 5 laporan minggu ini',
  priority: 'low',
  userId: 'user-id',
  actionUrl: '/dashboard'
}
```

#### 27. Monthly Report (Admin/CEO)
**Trigger:** Laporan bulanan (automated job)
**Penerima:** Admin/CEO
**Prioritas:** Medium
**Template:** `NotificationTemplates.monthlyReport(stats)`

```typescript
{
  title: 'Laporan Bulanan',
  message: 'Laporan bulanan tersedia untuk review',
  priority: 'medium',
  role: 'ADMIN',
  actionUrl: '/dashboard/admin/reports'
}
```

---

## Implementasi Status

### ✅ Sudah Diimplementasikan

1. ✅ Project Created (CEO) - `POST /api/admin/projects/create`
2. ✅ Project Assigned (Staff) - `POST /api/admin/projects/create` & `PUT /api/admin/projects/[id]`
3. ✅ Project Status Changed - `PUT /api/admin/projects/[id]`
4. ✅ Project Deleted (CEO) - `DELETE /api/admin/projects/[id]`
5. ✅ Project Deleted (Staff) - `DELETE /api/admin/projects/[id]`
6. ✅ Payslip Available (Staff) - `POST /api/admin/payslips/publish`

### 🔄 Perlu Diimplementasikan

#### Priority 1 (Penting)
- [ ] Project Removed (saat user dihapus dari project)
- [ ] Project Completed (saat status = Selesai)
- [ ] Report Submitted
- [ ] Report Approved
- [ ] Report Rejected
- [ ] Report Kendala

#### Priority 2 (Automated Jobs)
- [ ] Project Deadline (cron job harian)
- [ ] Project Overdue (cron job harian)
- [ ] Project Stagnant (cron job harian)
- [ ] Report Reminder (cron job harian)
- [ ] Report Overdue (cron job harian)

#### Priority 3 (User Management)
- [ ] User Approved
- [ ] User Rejected

#### Priority 4 (Leave & Payslip)
- [ ] Leave Requested
- [ ] Leave Approved
- [ ] Leave Rejected
- [x] Payslip Available ✅ **IMPLEMENTED**
- [ ] Payslip Reminder

---

## Cara Menambahkan Notifikasi Baru

### 1. Tambahkan Type di `lib/notifications.ts`
```typescript
export type NotificationType = 
  | 'existing_types'
  | 'new_notification_type'
```

### 2. Tambahkan Template di `NotificationTemplates`
```typescript
export const NotificationTemplates = {
  // ... existing templates
  
  newNotification: (param1: string, param2: string): NotificationPayload => ({
    type: 'new_notification_type',
    title: 'Notification Title',
    message: `Message with ${param1} and ${param2}`,
    priority: 'medium',
    userId: 'user-id', // atau role: 'ADMIN', atau userIds: []
    actionUrl: '/dashboard/path',
    data: { param1, param2 }
  }),
}
```

### 3. Panggil di API Route
```typescript
import { sendNotification, NotificationTemplates } from '@/lib/notifications'

// Di dalam API handler
await sendNotification(
  NotificationTemplates.newNotification(param1, param2)
)
```

---

## Testing Notifikasi

### Manual Testing
1. Trigger event (create/update/delete project, dll)
2. Check console log untuk konfirmasi notifikasi terkirim
3. Refresh page
4. Check bell icon (🔔) - seharusnya ada badge
5. Klik bell icon - notifikasi muncul
6. Klik "Lihat semua notifikasi" - redirect ke `/dashboard/notifications`

### Database Check
```sql
-- Lihat semua notifikasi
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;

-- Lihat notifikasi per user
SELECT * FROM notifications WHERE user_id = 'user-id' ORDER BY created_at DESC;

-- Lihat notifikasi belum dibaca
SELECT * FROM notifications WHERE read = false ORDER BY created_at DESC;

-- Lihat notifikasi per type
SELECT * FROM notifications WHERE type = 'project_deleted' ORDER BY created_at DESC;
```

---

## Prioritas Notifikasi

### Urgent (Merah)
- Project Overdue
- System Alert
- Cuti/Leave urgent

### High (Orange)
- Project Deleted
- Project Assigned
- Report Rejected
- User Approved/Rejected
- Payslip Available
- Leave Approved/Rejected

### Medium (Biru)
- Project Created
- Project Status Changed
- Project Completed
- Report Approved
- Report Reminder
- User Registered
- Leave Requested

### Low (Abu-abu)
- Report Submitted
- Weekly Summary

---

**Status:** ✅ READY TO USE
**Last Updated:** 2026-05-03
**Author:** Kiro AI Assistant
