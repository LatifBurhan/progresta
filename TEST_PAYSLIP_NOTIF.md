# Debug Notifikasi Slip Gaji

## Langkah-langkah Debug

### 1. Check Console Log Backend

Setelah publish slip gaji, check terminal/console backend untuk log berikut:

**✅ Log yang HARUS muncul:**
```
=== PAYSLIP NOTIFICATION START ===
Published payslips: 5
Users to notify: 5
User IDs: ['user-id-1', 'user-id-2', ...]
Periode: 1/2026
Month/Year formatted: Januari 2026
📧 Sending notification to user: user-id-1
✅ Notification sent to user: user-id-1
📧 Sending notification to user: user-id-2
✅ Notification sent to user: user-id-2
...
✅ Payslip notifications: 5 success, 0 failed
=== PAYSLIP NOTIFICATION END ===
```

**❌ Jika muncul log ini:**
```
⚠️ Skipping notifications:
  - publishedUserIds.length: 0
  - periodeBulan: 0
  - periodeTahun: 0
```
**Artinya:** Data slip gaji tidak ter-fetch dengan benar.

**❌ Jika muncul error:**
```
❌ Failed to send notification to user user-id-1: [error message]
```
**Artinya:** Ada masalah saat kirim notifikasi.

---

### 2. Check Database - Payslips

Pastikan slip gaji berhasil dipublish:

```sql
-- Check slip gaji yang baru dipublish
SELECT 
  id, 
  user_id, 
  periode_bulan, 
  periode_tahun, 
  status, 
  published_at 
FROM payslips 
WHERE status = 'published' 
ORDER BY published_at DESC 
LIMIT 10;
```

**Expected Result:**
- `status = 'published'`
- `published_at` ada timestamp
- `user_id` tidak null
- `periode_bulan` dan `periode_tahun` ada nilai

---

### 3. Check Database - Notifications

Check apakah notifikasi tersimpan:

```sql
-- Check notifikasi payslip
SELECT * FROM notifications 
WHERE type = 'payslip_available' 
ORDER BY created_at DESC 
LIMIT 10;
```

**Expected Result:**
- Ada row baru dengan `type = 'payslip_available'`
- `user_id` sesuai dengan penerima slip gaji
- `title = 'Slip Gaji Tersedia'`
- `message` berisi bulan/tahun
- `priority = 'high'`
- `read = false`

**❌ Jika TIDAK ADA row:**
- Notifikasi tidak tersimpan ke database
- Check log backend untuk error
- Check fungsi `sendNotification` di `lib/notifications.ts`

---

### 4. Check RLS Policy

Pastikan RLS policy mengizinkan insert:

```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'notifications';
```

**Expected Result:**
- Policy "Service role can insert notifications" ada
- Policy menggunakan `WITH CHECK (true)`

**Jika policy salah, jalankan:**
```sql
DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;

CREATE POLICY "Service role can insert notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (true);
```

---

### 5. Test Manual Insert Notification

Test insert notifikasi secara manual:

```sql
-- Test insert notification
INSERT INTO notifications (
  id,
  user_id,
  type,
  title,
  message,
  priority,
  action_url,
  read,
  created_at,
  expires_at
) VALUES (
  gen_random_uuid(),
  'USER_ID_KARYAWAN', -- Ganti dengan user_id yang valid
  'payslip_available',
  'Test Slip Gaji',
  'Slip gaji bulan Januari 2026 sudah tersedia',
  'high',
  '/dashboard/payslips',
  false,
  NOW(),
  NOW() + INTERVAL '3 days'
);

-- Check apakah berhasil
SELECT * FROM notifications WHERE type = 'payslip_available' ORDER BY created_at DESC LIMIT 1;
```

**Jika berhasil:**
- Login sebagai karyawan
- Check bell icon - seharusnya ada notifikasi

**Jika gagal:**
- Ada masalah dengan RLS policy atau table structure

---

### 6. Check Frontend - NotificationBell

Pastikan NotificationBell component menerima userId:

**File:** `app/dashboard/ResponsiveLayout.tsx` atau `app/dashboard/layout.tsx`

```typescript
// Pastikan ada:
<NotificationBell userId={session.userId} />
```

**Check browser console:**
```
Loading notifications for user: user-id-123
Loaded notifications: 5
```

**❌ Jika muncul:**
```
No userId provided, skipping notification load
```
**Artinya:** userId tidak dikirim ke NotificationBell component.

---

### 7. Test End-to-End

**Step 1: Buat Slip Gaji**
```sql
-- Insert test payslip
INSERT INTO payslips (
  id,
  user_id,
  periode_bulan,
  periode_tahun,
  gaji_pokok,
  total_gaji,
  status,
  created_at
) VALUES (
  gen_random_uuid(),
  'USER_ID_KARYAWAN', -- Ganti dengan user_id yang valid
  1, -- Januari
  2026,
  5000000,
  5000000,
  'draft',
  NOW()
);
```

**Step 2: Publish via API**
```bash
# Menggunakan curl atau Postman
POST http://localhost:3000/api/admin/payslips/publish
Content-Type: application/json
Cookie: session=YOUR_SESSION_COOKIE

{
  "periode_bulan": 1,
  "periode_tahun": 2026
}
```

**Step 3: Check Response**
```json
{
  "success": true,
  "data": {
    "published_count": 1
  },
  "message": "Berhasil menerbitkan 1 slip gaji"
}
```

**Step 4: Check Backend Log**
- Seharusnya muncul log notifikasi

**Step 5: Check Database**
```sql
SELECT * FROM notifications WHERE type = 'payslip_available' ORDER BY created_at DESC LIMIT 1;
```

**Step 6: Check Frontend**
- Login sebagai karyawan
- Refresh page
- Check bell icon

---

## Common Issues & Solutions

### Issue 1: "publishedUserIds.length: 0"

**Penyebab:**
- Query tidak return user_id
- Slip gaji tidak ada yang dipublish

**Solusi:**
```typescript
// Check query di publish route
const { data, error } = await query.select('id, user_id, periode_bulan, periode_tahun')
```

Pastikan `select()` include `user_id`, `periode_bulan`, `periode_tahun`.

---

### Issue 2: Notifikasi tidak tersimpan di database

**Penyebab:**
- RLS policy block insert
- Supabase admin client tidak configured

**Solusi:**
1. Check `.env` file:
   ```
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. Check RLS policy:
   ```sql
   CREATE POLICY "Service role can insert notifications"
     ON notifications FOR INSERT WITH CHECK (true);
   ```

---

### Issue 3: Notifikasi tersimpan tapi tidak muncul di frontend

**Penyebab:**
- RLS policy block SELECT
- userId tidak match

**Solusi:**
1. Check RLS policy:
   ```sql
   CREATE POLICY "Users can view notifications"
     ON notifications FOR SELECT USING (true);
   ```

2. Check userId di NotificationBell:
   ```typescript
   console.log('Loading notifications for user:', userId)
   ```

---

### Issue 4: Error "Failed to send notification"

**Penyebab:**
- Error di `sendNotification` function
- Error di `sendInAppNotification` function

**Solusi:**
Check log error detail:
```
❌ Failed to send notification to user user-id-1: [error message]
```

Common errors:
- `user_id violates foreign key constraint` → User tidak ada di tabel users
- `RLS policy violation` → RLS policy salah
- `null value in column "user_id"` → userId tidak valid

---

## Quick Fix Checklist

- [ ] Restart development server
- [ ] Check backend console log saat publish
- [ ] Check database - payslips status = published
- [ ] Check database - notifications table ada row baru
- [ ] Check RLS policy - allow INSERT dan SELECT
- [ ] Check .env - SUPABASE_SERVICE_ROLE_KEY ada
- [ ] Check NotificationBell - userId prop dikirim
- [ ] Refresh browser page
- [ ] Clear browser cache
- [ ] Test dengan user yang berbeda

---

## Contact Points untuk Debug

1. **Backend Log:** Terminal tempat `npm run dev` jalan
2. **Browser Console:** F12 → Console tab
3. **Network Tab:** F12 → Network tab → Check API response
4. **Database:** Supabase Dashboard → Table Editor
5. **SQL Editor:** Supabase Dashboard → SQL Editor

---

**Last Updated:** 2026-05-03
