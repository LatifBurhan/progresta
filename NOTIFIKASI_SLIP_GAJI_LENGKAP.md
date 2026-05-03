# Notifikasi Slip Gaji - Dokumentasi Lengkap

## ✅ Notifikasi yang Sudah Diimplementasikan

### 1. Payslip Available (Slip Gaji Tersedia)
**Trigger:** Saat admin publish slip gaji
**Endpoint:** `POST /api/admin/payslips/publish`
**Penerima:** Karyawan yang menerima slip gaji
**Prioritas:** High (Orange)

```typescript
{
  type: 'payslip_available',
  title: 'Slip Gaji Tersedia',
  message: 'Slip gaji bulan Januari 2026 sudah tersedia',
  priority: 'high',
  userId: 'user-id',
  actionUrl: '/dashboard/payslips'
}
```

**Cara Trigger:**
1. Login sebagai Admin/General Affair
2. Buka `/dashboard/admin/payslips`
3. Pilih slip gaji (status: draft)
4. Klik "Terbitkan Slip Gaji"
5. Karyawan akan menerima notifikasi

---

### 2. Payslip Updated (Slip Gaji Diperbarui)
**Trigger:** Saat admin update slip gaji yang sudah published
**Endpoint:** `PUT /api/admin/payslips/[id]`
**Penerima:** Karyawan yang slip gajinya diupdate
**Prioritas:** Medium (Blue)

```typescript
{
  type: 'payslip_updated',
  title: 'Slip Gaji Diperbarui',
  message: 'Slip gaji bulan Januari 2026 telah diperbarui. Silakan cek kembali.',
  priority: 'medium',
  userId: 'user-id',
  actionUrl: '/dashboard/payslips'
}
```

**Cara Trigger:**
1. Login sebagai Admin/General Affair
2. Buka `/dashboard/admin/payslips`
3. Klik "Edit" pada slip gaji yang sudah published
4. Ubah nilai (gaji pokok, lembur, dll)
5. Klik "Simpan"
6. Karyawan akan menerima notifikasi

**Catatan:**
- Notifikasi hanya dikirim jika slip gaji sudah `published`
- Jika status masih `draft`, tidak ada notifikasi

---

### 3. Payslip Deleted (Slip Gaji Dihapus)
**Trigger:** Saat admin hapus slip gaji yang sudah published
**Endpoint:** `DELETE /api/admin/payslips/[id]`
**Penerima:** Karyawan yang slip gajinya dihapus
**Prioritas:** High (Orange)

```typescript
{
  type: 'payslip_deleted',
  title: 'Slip Gaji Dihapus',
  message: 'Slip gaji bulan Januari 2026 telah dihapus. Hubungi admin jika ada pertanyaan.',
  priority: 'high',
  userId: 'user-id',
  actionUrl: '/dashboard/payslips'
}
```

**Cara Trigger:**
1. Login sebagai Admin/CEO/General Affair
2. Buka `/dashboard/admin/payslips`
3. Klik "Hapus" pada slip gaji yang sudah published
4. Konfirmasi penghapusan
5. Karyawan akan menerima notifikasi

**Catatan:**
- Notifikasi hanya dikirim jika slip gaji sudah `published`
- Jika status masih `draft`, tidak ada notifikasi
- Hanya ADMIN, CEO, dan GENERAL_AFFAIR yang bisa hapus slip gaji

---

### 4. Payslip Reminder (Reminder Slip Gaji)
**Trigger:** Automated job (cron) - belum diimplementasikan
**Penerima:** Karyawan yang belum cek slip gaji
**Prioritas:** Low (Grey)

```typescript
{
  type: 'payslip_reminder',
  title: 'Reminder Slip Gaji',
  message: 'Jangan lupa cek slip gaji bulan Januari 2026',
  priority: 'low',
  userId: 'user-id',
  actionUrl: '/dashboard/payslips'
}
```

**Status:** 🔄 Template sudah ada, perlu implementasi cron job

---

## Cara Testing

### Test 1: Payslip Available

**Step 1: Persiapan**
```sql
-- Buat slip gaji draft
INSERT INTO payslips (
  id, user_id, periode_bulan, periode_tahun,
  gaji_pokok, total_gaji, status, created_at
) VALUES (
  gen_random_uuid(),
  'USER_ID_KARYAWAN',
  1, 2026,
  5000000, 5000000,
  'draft',
  NOW()
);
```

**Step 2: Publish**
1. Login sebagai Admin
2. Buka `/dashboard/admin/payslips`
3. Filter periode: Januari 2026
4. Klik "Terbitkan Semua"

**Step 3: Verifikasi**
- Check console log backend:
  ```
  === PAYSLIP NOTIFICATION START ===
  Published payslips: 1
  Users to notify: 1
  ✅ Payslip notifications sent to 1 users
  === PAYSLIP NOTIFICATION END ===
  ```
- Login sebagai karyawan
- Check bell icon - ada badge
- Klik bell icon - notifikasi muncul

---

### Test 2: Payslip Updated

**Step 1: Persiapan**
- Pastikan ada slip gaji dengan status `published`

**Step 2: Update**
1. Login sebagai Admin
2. Buka `/dashboard/admin/payslips`
3. Klik "Edit" pada slip gaji
4. Ubah nilai (misal: gaji pokok dari 5000000 ke 5500000)
5. Klik "Simpan"

**Step 3: Verifikasi**
- Check console log backend:
  ```
  === PAYSLIP UPDATE NOTIFICATION START ===
  Updated payslip ID: xxx
  User ID: xxx
  ✅ Payslip update notification sent
  === PAYSLIP UPDATE NOTIFICATION END ===
  ```
- Login sebagai karyawan
- Check bell icon - ada notifikasi baru
- Notifikasi: "Slip Gaji Diperbarui"

---

### Test 3: Payslip Deleted

**Step 1: Persiapan**
- Pastikan ada slip gaji dengan status `published`

**Step 2: Delete**
1. Login sebagai Admin/CEO
2. Buka `/dashboard/admin/payslips`
3. Klik "Hapus" pada slip gaji
4. Konfirmasi

**Step 3: Verifikasi**
- Check console log backend:
  ```
  === PAYSLIP DELETE NOTIFICATION START ===
  Deleted payslip ID: xxx
  User ID: xxx
  ✅ Payslip delete notification sent
  === PAYSLIP DELETE NOTIFICATION END ===
  ```
- Login sebagai karyawan
- Check bell icon - ada notifikasi baru
- Notifikasi: "Slip Gaji Dihapus"

---

## Database Queries untuk Debugging

### Check Notifikasi Payslip
```sql
-- Semua notifikasi payslip
SELECT 
  id, type, title, message, priority, 
  user_id, read, created_at
FROM notifications 
WHERE type LIKE 'payslip_%'
ORDER BY created_at DESC 
LIMIT 20;
```

### Check Notifikasi per User
```sql
-- Notifikasi payslip untuk user tertentu
SELECT * FROM notifications 
WHERE user_id = 'USER_ID_KARYAWAN'
AND type LIKE 'payslip_%'
ORDER BY created_at DESC;
```

### Check Slip Gaji Published
```sql
-- Slip gaji yang sudah published
SELECT 
  id, user_id, periode_bulan, periode_tahun,
  status, published_at
FROM payslips 
WHERE status = 'published'
ORDER BY published_at DESC 
LIMIT 10;
```

### Check Notifikasi Belum Dibaca
```sql
-- Notifikasi payslip yang belum dibaca
SELECT 
  n.id, n.type, n.title, n.message,
  u.name as user_name, u.email
FROM notifications n
JOIN users u ON n.user_id = u.id
WHERE n.type LIKE 'payslip_%'
AND n.read = false
ORDER BY n.created_at DESC;
```

---

## Flow Diagram

### Publish Flow
```
Admin Publish Slip Gaji
         ↓
Update status: draft → published
         ↓
Get list of user_ids
         ↓
For each user_id:
  - Format month/year
  - Send notification (payslip_available)
         ↓
Karyawan menerima notifikasi
         ↓
Karyawan klik notifikasi
         ↓
Redirect ke /dashboard/payslips
```

### Update Flow
```
Admin Edit Slip Gaji (published)
         ↓
Update payslip data
         ↓
Check if status = published
         ↓
Send notification (payslip_updated)
         ↓
Karyawan menerima notifikasi
         ↓
Karyawan cek slip gaji yang diupdate
```

### Delete Flow
```
Admin Hapus Slip Gaji (published)
         ↓
Get payslip data before delete
         ↓
Delete payslip
         ↓
Check if status was published
         ↓
Send notification (payslip_deleted)
         ↓
Karyawan menerima notifikasi
         ↓
Karyawan hubungi admin jika perlu
```

---

## Troubleshooting

### Issue 1: Notifikasi Publish Tidak Muncul

**Check:**
1. Console log backend - ada log notification?
2. Database - notifikasi tersimpan?
3. publishedUserIds - ada isi?
4. RLS policy - allow INSERT?

**Solution:**
- Lihat `TEST_PAYSLIP_NOTIF.md` untuk debug detail

---

### Issue 2: Notifikasi Update Tidak Muncul

**Possible Causes:**
- Slip gaji status masih `draft` (notifikasi hanya untuk `published`)
- Error saat send notification

**Check:**
```sql
SELECT status FROM payslips WHERE id = 'payslip-id';
```

**Solution:**
- Pastikan slip gaji sudah published
- Check console log untuk error

---

### Issue 3: Notifikasi Delete Tidak Muncul

**Possible Causes:**
- Slip gaji status masih `draft`
- Payslip data tidak ter-fetch sebelum delete

**Check Console Log:**
```
=== PAYSLIP DELETE NOTIFICATION START ===
```

**Solution:**
- Pastikan slip gaji sudah published sebelum dihapus
- Check query `select('*')` sebelum delete

---

## Best Practices

### 1. Notifikasi Hanya untuk Published
- Draft slip gaji tidak perlu notifikasi
- Karyawan hanya perlu tahu slip gaji yang sudah final

### 2. Format Bulan Konsisten
- Gunakan nama bulan Indonesia (Januari, Februari, dll)
- Format: "Bulan Tahun" (Januari 2026)

### 3. Priority yang Tepat
- **High:** Available, Deleted (penting untuk karyawan)
- **Medium:** Updated (informasi perubahan)
- **Low:** Reminder (tidak urgent)

### 4. Action URL
- Semua notifikasi payslip redirect ke `/dashboard/payslips`
- Karyawan bisa langsung lihat slip gaji

### 5. Error Handling
- Jika notifikasi gagal, jangan fail request
- Log error untuk debugging
- Slip gaji tetap berhasil publish/update/delete

---

## Summary

### ✅ Implemented
1. **Payslip Available** - Saat publish
2. **Payslip Updated** - Saat update (published only)
3. **Payslip Deleted** - Saat delete (published only)

### 🔄 Template Ready (Belum Implemented)
4. **Payslip Reminder** - Automated reminder (perlu cron job)

### 📊 Statistics
- **Total Notifikasi Payslip:** 4 types
- **Endpoints Modified:** 2 files
  - `app/api/admin/payslips/publish/route.ts`
  - `app/api/admin/payslips/[id]/route.ts`
- **Templates Added:** 4 templates di `lib/notifications.ts`

---

## Next Steps

### Implementasi Reminder (Opsional)
Buat cron job untuk kirim reminder:
```typescript
// Pseudo code
async function sendPayslipReminders() {
  // Get published payslips from last month
  const lastMonth = new Date()
  lastMonth.setMonth(lastMonth.getMonth() - 1)
  
  // Get users who haven't acknowledged
  const { data: payslips } = await supabase
    .from('payslips')
    .select('user_id, periode_bulan, periode_tahun')
    .eq('status', 'published')
    .eq('periode_bulan', lastMonth.getMonth() + 1)
    .eq('periode_tahun', lastMonth.getFullYear())
    .is('acknowledged_at', null)
  
  // Send reminder to each user
  for (const payslip of payslips) {
    await sendNotification(
      NotificationTemplates.payslipReminder(monthYear, payslip.user_id)
    )
  }
}
```

### Email Notification (Opsional)
Kirim email saat slip gaji tersedia:
- Integrate dengan SendGrid/Resend
- Template email dengan link download
- Kirim bersamaan dengan in-app notification

---

**Status:** ✅ READY TO USE
**Last Updated:** 2026-05-03
**Author:** Kiro AI Assistant
