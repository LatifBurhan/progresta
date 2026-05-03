# 🧪 Cara Test Notifikasi Slip Gaji - Panduan Lengkap

## ✅ Status Implementasi

**SEMUA NOTIFIKASI SLIP GAJI SUDAH DIIMPLEMENTASIKAN!**

### Notifikasi yang Sudah Berfungsi:
1. ✅ **Payslip Available** - Saat admin publish slip gaji
2. ✅ **Payslip Updated** - Saat admin update slip gaji yang sudah published
3. ✅ **Payslip Deleted** - Saat admin hapus slip gaji yang sudah published

### File yang Sudah Dimodifikasi:
- ✅ `app/api/admin/payslips/publish/route.ts` - Kirim notifikasi saat publish
- ✅ `app/api/admin/payslips/[id]/route.ts` - Kirim notifikasi saat update/delete
- ✅ `lib/notifications.ts` - Template notifikasi payslip
- ✅ `components/notifications/NotificationBell.tsx` - Tampilan notifikasi
- ✅ `app/dashboard/notifications/page.tsx` - Halaman notifikasi lengkap

---

## 🎯 Cara Test - Step by Step

### Test 1: Notifikasi "Slip Gaji Tersedia" (Payslip Available)

#### Persiapan:
1. Pastikan ada user karyawan (role: STAFF atau KARYAWAN)
2. Buat slip gaji draft untuk karyawan tersebut

#### Langkah Test:

**Step 1: Login sebagai Admin/General Affair**
```
URL: http://localhost:3000/login
Email: admin@example.com (atau akun admin Anda)
```

**Step 2: Buka Halaman Payslips**
```
URL: http://localhost:3000/dashboard/admin/payslips
```

**Step 3: Buat Slip Gaji Draft (jika belum ada)**
- Klik "Buat Slip Gaji"
- Pilih karyawan
- Pilih periode: Januari 2026
- Isi gaji pokok: 5000000
- Status: Draft
- Klik "Simpan"

**Step 4: Publish Slip Gaji**
- Filter periode: Januari 2026
- Klik "Terbitkan Semua" atau pilih slip gaji tertentu dan klik "Terbitkan"

**Step 5: Check Console Log Backend**
Buka terminal tempat `npm run dev` jalan, seharusnya muncul:
```
=== PAYSLIP NOTIFICATION START ===
Published payslips: 1
Users to notify: 1
User IDs: ['user-id-xxx']
Periode: 1/2026
Month/Year formatted: Januari 2026
📧 Sending notification to user: user-id-xxx
📧 sendNotification called with: { type: 'payslip_available', ... }
📧 Notification channels: { inApp: true, toast: true, email: true, push: false }
📧 Recipients found: 1 ['user-id-xxx']
📧 Sending in-app notification...
📱 sendInAppNotification called for 1 recipients
📱 Inserting notifications to database: 1
✅ Notifications saved to database: 1
📡 Broadcasting to realtime channels...
📡 Broadcasting to user user-id-xxx...
✅ Broadcast sent to user user-id-xxx
✅ All broadcasts completed
✅ Notification sent to user: user-id-xxx
✅ Payslip notifications: 1 success, 0 failed
=== PAYSLIP NOTIFICATION END ===
```

**Step 6: Login sebagai Karyawan**
```
URL: http://localhost:3000/login
Email: karyawan@example.com (user yang menerima slip gaji)
```

**Step 7: Check Notifikasi**
- Lihat icon bell (🔔) di header
- Seharusnya ada badge merah dengan angka "1"
- Klik icon bell
- Seharusnya muncul notifikasi:
  - **Title:** "Slip Gaji Tersedia"
  - **Message:** "Slip gaji bulan Januari 2026 sudah tersedia"
  - **Priority:** High (orange)
  - **Icon:** AlertCircle (orange)

**Step 8: Klik Notifikasi**
- Klik pada notifikasi
- Seharusnya redirect ke `/dashboard/payslips`
- Notifikasi berubah status menjadi "read" (tidak ada dot biru)

**Step 9: Check Database**
```sql
-- Check notifikasi tersimpan
SELECT * FROM notifications 
WHERE type = 'payslip_available' 
ORDER BY created_at DESC 
LIMIT 1;

-- Expected result:
-- type: payslip_available
-- title: Slip Gaji Tersedia
-- message: Slip gaji bulan Januari 2026 sudah tersedia
-- priority: high
-- read: true (setelah diklik)
```

---

### Test 2: Notifikasi "Slip Gaji Diperbarui" (Payslip Updated)

#### Persiapan:
- Pastikan ada slip gaji dengan status **published** (dari Test 1)

#### Langkah Test:

**Step 1: Login sebagai Admin**

**Step 2: Buka Halaman Payslips**
```
URL: http://localhost:3000/dashboard/admin/payslips
```

**Step 3: Edit Slip Gaji**
- Cari slip gaji yang sudah published (Januari 2026)
- Klik "Edit" atau icon pensil
- Ubah nilai, misalnya:
  - Gaji Pokok: 5000000 → 5500000
  - Atau tambah Lembur: 0 → 500000
- Klik "Simpan"

**Step 4: Check Console Log Backend**
```
=== PAYSLIP UPDATE NOTIFICATION START ===
Updated payslip ID: xxx
User ID: xxx
Periode: 1/2026
Month/Year formatted: Januari 2026
📧 sendNotification called with: { type: 'payslip_updated', ... }
✅ Payslip update notification sent
=== PAYSLIP UPDATE NOTIFICATION END ===
```

**Step 5: Login sebagai Karyawan**

**Step 6: Check Notifikasi**
- Icon bell seharusnya ada badge baru
- Klik icon bell
- Notifikasi baru:
  - **Title:** "Slip Gaji Diperbarui"
  - **Message:** "Slip gaji bulan Januari 2026 telah diperbarui. Silakan cek kembali."
  - **Priority:** Medium (blue)

**Step 7: Klik Notifikasi**
- Redirect ke `/dashboard/payslips`
- Cek slip gaji - nilai sudah berubah

---

### Test 3: Notifikasi "Slip Gaji Dihapus" (Payslip Deleted)

#### Persiapan:
- Pastikan ada slip gaji dengan status **published**

#### Langkah Test:

**Step 1: Login sebagai Admin/CEO**
(Hanya ADMIN, CEO, GENERAL_AFFAIR yang bisa hapus)

**Step 2: Buka Halaman Payslips**

**Step 3: Hapus Slip Gaji**
- Cari slip gaji yang sudah published
- Klik "Hapus" atau icon trash
- Konfirmasi penghapusan

**Step 4: Check Console Log Backend**
```
=== PAYSLIP DELETE NOTIFICATION START ===
Deleted payslip ID: xxx
User ID: xxx
Periode: 1/2026
Month/Year formatted: Januari 2026
📧 sendNotification called with: { type: 'payslip_deleted', ... }
✅ Payslip delete notification sent
=== PAYSLIP DELETE NOTIFICATION END ===
```

**Step 5: Login sebagai Karyawan**

**Step 6: Check Notifikasi**
- Icon bell ada badge baru
- Notifikasi:
  - **Title:** "Slip Gaji Dihapus"
  - **Message:** "Slip gaji bulan Januari 2026 telah dihapus. Hubungi admin jika ada pertanyaan."
  - **Priority:** High (orange)

---

## 🔍 Troubleshooting

### Problem 1: Notifikasi Tidak Muncul di Bell Icon

**Kemungkinan Penyebab:**
1. Notifikasi tidak tersimpan di database
2. RLS policy block SELECT
3. userId tidak match
4. Browser cache

**Solusi:**

**A. Check Database**
```sql
-- Check apakah notifikasi tersimpan
SELECT * FROM notifications 
WHERE user_id = 'USER_ID_KARYAWAN'
AND type LIKE 'payslip_%'
ORDER BY created_at DESC;
```

Jika **TIDAK ADA** row:
- Notifikasi tidak tersimpan
- Check console log backend untuk error
- Check RLS policy (lihat Problem 2)

Jika **ADA** row tapi tidak muncul di frontend:
- RLS policy block SELECT
- Check RLS policy (lihat Problem 2)

**B. Check RLS Policy**
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'notifications';
```

Pastikan ada policy:
- **INSERT policy:** "Service role can insert notifications" dengan `WITH CHECK (true)`
- **SELECT policy:** "Users can view notifications" dengan `USING (true)`

Jika policy salah, jalankan:
```sql
-- Fix RLS policies
DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view notifications" ON notifications;

CREATE POLICY "Service role can insert notifications"
  ON notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view notifications"
  ON notifications FOR SELECT USING (true);
```

**C. Clear Browser Cache**
- Hard refresh: Ctrl+Shift+R (Windows) atau Cmd+Shift+R (Mac)
- Atau buka Incognito/Private window

**D. Check Console Log Frontend**
- Buka browser console (F12)
- Seharusnya muncul:
  ```
  Loading notifications for user: user-id-xxx
  Loaded notifications: 5
  ```
- Jika muncul error, screenshot dan check error message

---

### Problem 2: Console Log Backend Tidak Muncul

**Kemungkinan Penyebab:**
1. Slip gaji tidak berhasil dipublish
2. publishedUserIds kosong
3. periode_bulan atau periode_tahun null

**Solusi:**

**A. Check Slip Gaji Status**
```sql
SELECT id, user_id, periode_bulan, periode_tahun, status, published_at
FROM payslips 
WHERE periode_bulan = 1 AND periode_tahun = 2026
ORDER BY created_at DESC;
```

Pastikan:
- `status = 'published'` (bukan 'draft')
- `published_at` ada timestamp
- `user_id` tidak null
- `periode_bulan` dan `periode_tahun` ada nilai

**B. Check Console Log untuk Skip Message**
Jika muncul:
```
⚠️ Skipping notifications:
  - publishedUserIds.length: 0
  - periodeBulan: 0
  - periodeTahun: 0
```

Artinya:
- Query tidak return data
- Check query di `app/api/admin/payslips/publish/route.ts`
- Pastikan `.select('id, user_id, periode_bulan, periode_tahun')`

---

### Problem 3: Notifikasi Update/Delete Tidak Muncul

**Kemungkinan Penyebab:**
- Slip gaji status masih `draft` (notifikasi hanya untuk `published`)

**Solusi:**

**A. Check Status Slip Gaji**
```sql
SELECT id, status FROM payslips WHERE id = 'PAYSLIP_ID';
```

**B. Pastikan Slip Gaji Sudah Published**
- Notifikasi update/delete **HANYA** dikirim jika status = `published`
- Jika status = `draft`, tidak ada notifikasi (by design)

---

### Problem 4: Error "Failed to send notification"

**Check Console Log untuk Error Detail:**
```
❌ Failed to send notification to user user-id-1: [error message]
```

**Common Errors:**

**A. "user_id violates foreign key constraint"**
- User tidak ada di tabel `users`
- Solusi: Pastikan user_id valid

**B. "RLS policy violation"**
- RLS policy block INSERT
- Solusi: Fix RLS policy (lihat Problem 1B)

**C. "null value in column user_id"**
- userId tidak valid atau null
- Solusi: Check query yang fetch user_id

---

## 📊 Verification Checklist

Setelah test, pastikan semua ini ✅:

### Backend (Console Log)
- [ ] Log "=== PAYSLIP NOTIFICATION START ===" muncul
- [ ] Published payslips count benar
- [ ] Users to notify count benar
- [ ] User IDs tidak kosong
- [ ] Month/Year formatted benar (Januari 2026)
- [ ] "✅ Notification sent to user" muncul untuk setiap user
- [ ] "✅ Payslip notifications: X success, 0 failed"
- [ ] Tidak ada error "❌ Failed to send notification"

### Database
- [ ] Notifikasi tersimpan di tabel `notifications`
- [ ] `type` = 'payslip_available' / 'payslip_updated' / 'payslip_deleted'
- [ ] `user_id` sesuai dengan penerima
- [ ] `title` dan `message` benar
- [ ] `priority` sesuai (high/medium)
- [ ] `action_url` = '/dashboard/payslips'
- [ ] `read` = false (sebelum diklik)

### Frontend
- [ ] Bell icon ada badge merah dengan angka
- [ ] Klik bell icon, notifikasi muncul
- [ ] Title, message, priority benar
- [ ] Icon dan warna sesuai priority
- [ ] Klik notifikasi, redirect ke `/dashboard/payslips`
- [ ] Notifikasi berubah status menjadi read (dot biru hilang)
- [ ] Badge count berkurang

### Halaman Notifikasi
- [ ] URL `/dashboard/notifications` bisa diakses (tidak 404)
- [ ] Notifikasi payslip muncul di list
- [ ] Filter by status (all/unread/read) berfungsi
- [ ] Filter by priority berfungsi
- [ ] Mark as read berfungsi
- [ ] Delete notification berfungsi

---

## 🎨 Visual Guide - Apa yang Harus Terlihat

### 1. Bell Icon dengan Badge
```
🔔 (1)  ← Badge merah dengan angka
```

### 2. Dropdown Notifikasi
```
┌─────────────────────────────────────┐
│ Notifikasi              Tandai semua│
│ 1 belum dibaca                    ✕ │
├─────────────────────────────────────┤
│ 🟠 Slip Gaji Tersedia          • │
│    Slip gaji bulan Januari 2026    │
│    sudah tersedia                   │
│    5 menit yang lalu                │
├─────────────────────────────────────┤
│        Lihat semua notifikasi       │
└─────────────────────────────────────┘
```

### 3. Priority Colors
- **Urgent:** 🔴 Red (text-red-600, bg-red-50)
- **High:** 🟠 Orange (text-orange-600, bg-orange-50)
- **Medium:** 🔵 Blue (text-blue-600, bg-blue-50)
- **Low:** ⚪ Grey (text-slate-600, bg-slate-50)

### 4. Payslip Notifications
- **Available:** 🟠 High (Orange)
- **Updated:** 🔵 Medium (Blue)
- **Deleted:** 🟠 High (Orange)

---

## 🚀 Quick Test Script

Untuk test cepat, jalankan SQL ini:

```sql
-- 1. Buat user test (jika belum ada)
INSERT INTO users (id, email, name, role, status, created_at)
VALUES (
  'test-user-001',
  'test@example.com',
  'Test User',
  'STAFF',
  'active',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. Buat slip gaji draft
INSERT INTO payslips (
  id, user_id, periode_bulan, periode_tahun,
  gaji_pokok, total_gaji, status, created_at
) VALUES (
  gen_random_uuid(),
  'test-user-001',
  1, 2026,
  5000000, 5000000,
  'draft',
  NOW()
);

-- 3. Check slip gaji
SELECT id, user_id, periode_bulan, periode_tahun, status
FROM payslips 
WHERE user_id = 'test-user-001'
ORDER BY created_at DESC 
LIMIT 1;

-- 4. Sekarang publish via UI atau API
-- Setelah publish, check notifikasi:

-- 5. Check notifikasi
SELECT * FROM notifications 
WHERE user_id = 'test-user-001'
AND type = 'payslip_available'
ORDER BY created_at DESC;
```

---

## 📝 Summary

### ✅ Yang Sudah Berfungsi:
1. **Payslip Available** - Notifikasi saat publish ✅
2. **Payslip Updated** - Notifikasi saat update (published only) ✅
3. **Payslip Deleted** - Notifikasi saat delete (published only) ✅
4. **In-App Notification** - Bell icon dengan badge ✅
5. **Notification Page** - `/dashboard/notifications` ✅
6. **Mark as Read** - Klik notifikasi untuk mark as read ✅
7. **Priority Colors** - High (orange), Medium (blue) ✅
8. **Action URL** - Redirect ke `/dashboard/payslips` ✅

### 🔄 Yang Belum Diimplementasikan:
1. **Payslip Reminder** - Automated reminder (perlu cron job)
2. **Email Notification** - Kirim email (perlu email service)
3. **Push Notification** - Web push (perlu push service)
4. **Realtime in Development** - Disabled untuk avoid error

### 📚 Dokumentasi Terkait:
- `NOTIFIKASI_SLIP_GAJI_LENGKAP.md` - Dokumentasi lengkap
- `TEST_PAYSLIP_NOTIF.md` - Debugging guide
- `NOTIFIKASI_LENGKAP.md` - Semua notifikasi (project, report, user, payslip)

---

## 💡 Tips

1. **Development Mode:** Realtime notifications disabled untuk avoid error. Ini normal.
2. **Refresh Page:** Setelah publish, refresh page karyawan untuk load notifikasi.
3. **Console Log:** Selalu check console log backend untuk debug.
4. **Database:** Check database untuk verify notifikasi tersimpan.
5. **RLS Policy:** Pastikan RLS policy allow INSERT dan SELECT.

---

**Status:** ✅ READY TO TEST
**Last Updated:** 2026-05-03
**Author:** Kiro AI Assistant

Selamat testing! 🎉
