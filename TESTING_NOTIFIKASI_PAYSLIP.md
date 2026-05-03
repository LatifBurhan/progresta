# Testing Notifikasi Slip Gaji

## ✅ Implementasi Selesai

Notifikasi slip gaji sudah diimplementasikan di endpoint:
- **File:** `app/api/admin/payslips/publish/route.ts`
- **Method:** `POST`
- **Endpoint:** `/api/admin/payslips/publish`

## Cara Kerja

### 1. Saat Admin Publish Slip Gaji

**Scenario A: Publish Individual (Pilih beberapa slip gaji)**
```json
POST /api/admin/payslips/publish
{
  "payslip_ids": ["id-1", "id-2", "id-3"]
}
```

**Scenario B: Bulk Publish (Publish semua slip gaji per periode)**
```json
POST /api/admin/payslips/publish
{
  "periode_bulan": 1,
  "periode_tahun": 2026
}
```

### 2. Sistem Akan:
1. ✅ Update status slip gaji dari `draft` → `published`
2. ✅ Set `published_at` timestamp
3. ✅ Ambil daftar user yang menerima slip gaji
4. ✅ Kirim notifikasi ke setiap user

### 3. Notifikasi yang Dikirim:

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

## Cara Testing

### Step 1: Persiapan Data

1. **Login sebagai Admin/General Affair**
2. **Buat slip gaji untuk beberapa karyawan:**
   - Buka `/dashboard/admin/payslips`
   - Klik "Tambah Slip Gaji" atau "Bulk Upload"
   - Isi data slip gaji (pastikan status = draft)
   - Simpan

### Step 2: Publish Slip Gaji

**Opsi A: Publish Individual**
1. Buka `/dashboard/admin/payslips`
2. Pilih beberapa slip gaji (checkbox)
3. Klik "Terbitkan Slip Gaji"
4. Konfirmasi

**Opsi B: Bulk Publish**
1. Buka `/dashboard/admin/payslips`
2. Filter berdasarkan periode (bulan/tahun)
3. Klik "Terbitkan Semua"
4. Konfirmasi

### Step 3: Verifikasi Notifikasi

#### A. Check Console Log (Browser DevTools)
Setelah publish, check console log:
```
=== PAYSLIP NOTIFICATION START ===
Published payslips: 5
Users to notify: 5
Periode: 1/2026
✅ Payslip notifications sent to 5 users
=== PAYSLIP NOTIFICATION END ===
```

#### B. Check Database
```sql
-- Lihat notifikasi yang baru dibuat
SELECT * FROM notifications 
WHERE type = 'payslip_available' 
ORDER BY created_at DESC 
LIMIT 10;

-- Lihat notifikasi per user
SELECT * FROM notifications 
WHERE user_id = 'user-id-karyawan' 
AND type = 'payslip_available'
ORDER BY created_at DESC;
```

#### C. Check di Frontend (Sebagai Karyawan)

1. **Logout dari admin**
2. **Login sebagai karyawan** yang menerima slip gaji
3. **Check bell icon (🔔)** di header
   - Seharusnya ada badge merah dengan angka
4. **Klik bell icon**
   - Seharusnya muncul notifikasi "Slip Gaji Tersedia"
   - Prioritas: HIGH (orange)
   - Message: "Slip gaji bulan Januari 2026 sudah tersedia"
5. **Klik "Lihat Detail"**
   - Seharusnya redirect ke `/dashboard/payslips`
6. **Klik "Lihat semua notifikasi"**
   - Seharusnya redirect ke `/dashboard/notifications`
   - Notifikasi muncul di list

### Step 4: Test Notifikasi Actions

1. **Mark as Read:**
   - Klik "Tandai Dibaca" pada notifikasi
   - Badge unread (titik biru) hilang
   - Unread count berkurang

2. **Delete Notification:**
   - Klik "Hapus" pada notifikasi
   - Notifikasi hilang dari list

3. **View Payslip:**
   - Klik "Lihat Detail" pada notifikasi
   - Redirect ke halaman payslips
   - Slip gaji tersedia untuk didownload

## Expected Results

### ✅ Success Indicators

1. **Console Log:**
   ```
   ✅ Payslip notifications sent to X users
   ```

2. **Database:**
   - Notifikasi tersimpan di tabel `notifications`
   - `type = 'payslip_available'`
   - `priority = 'high'`
   - `read = false`
   - `user_id` sesuai dengan penerima slip gaji

3. **Frontend:**
   - Bell icon menampilkan badge unread count
   - Notifikasi muncul di dropdown
   - Notifikasi muncul di halaman `/dashboard/notifications`
   - Border orange (high priority)
   - Icon alert orange

4. **User Experience:**
   - Karyawan langsung tahu ada slip gaji baru
   - Bisa langsung klik untuk lihat slip gaji
   - Notifikasi bisa di-mark as read
   - Notifikasi bisa dihapus

## Troubleshooting

### ❌ Notifikasi Tidak Muncul?

**Check 1: Console Log**
```
Failed to send payslip notifications: [error]
```
- Periksa error message
- Pastikan `sendNotification` function bekerja

**Check 2: Database**
```sql
SELECT * FROM notifications WHERE type = 'payslip_available';
```
- Jika kosong, notifikasi tidak tersimpan
- Check RLS policy di tabel notifications

**Check 3: User ID**
```sql
SELECT user_id FROM payslips WHERE id = 'payslip-id';
```
- Pastikan user_id valid
- Pastikan user masih aktif

**Check 4: Frontend**
- Refresh page
- Check browser console untuk error
- Pastikan userId prop dikirim ke NotificationBell

### ❌ Notifikasi Muncul Tapi Tidak Bisa Diklik?

**Check actionUrl:**
```sql
SELECT action_url FROM notifications WHERE type = 'payslip_available';
```
- Seharusnya: `/dashboard/payslips`
- Pastikan route tersebut ada

### ❌ Notifikasi Muncul untuk User yang Salah?

**Check publishedUserIds:**
```typescript
console.log('Users to notify:', publishedUserIds)
```
- Pastikan hanya user yang menerima slip gaji
- Check query filter di publish endpoint

## Testing Checklist

- [ ] Buat slip gaji draft untuk beberapa karyawan
- [ ] Publish slip gaji (individual atau bulk)
- [ ] Check console log - notifikasi terkirim
- [ ] Check database - notifikasi tersimpan
- [ ] Login sebagai karyawan
- [ ] Check bell icon - ada badge unread
- [ ] Klik bell icon - notifikasi muncul
- [ ] Notifikasi menampilkan bulan/tahun yang benar
- [ ] Klik "Lihat Detail" - redirect ke payslips
- [ ] Slip gaji tersedia dan bisa didownload
- [ ] Klik "Tandai Dibaca" - notifikasi marked as read
- [ ] Klik "Hapus" - notifikasi terhapus
- [ ] Test dengan multiple users
- [ ] Test dengan periode berbeda

## Advanced Testing

### Test Multiple Periods
1. Publish slip gaji Januari 2026
2. Publish slip gaji Februari 2026
3. Verify setiap user dapat 2 notifikasi berbeda

### Test Department Filtering
1. Login sebagai Department Admin
2. Publish slip gaji
3. Verify hanya user di department tersebut yang dapat notifikasi

### Test Bulk vs Individual
1. Test publish individual (pilih 3 slip gaji)
2. Test bulk publish (semua slip gaji periode tertentu)
3. Verify notifikasi terkirim dengan benar di kedua scenario

## Performance Notes

- Notifikasi dikirim **setelah** slip gaji berhasil dipublish
- Jika ada 100 karyawan, akan ada 100 notifikasi dikirim
- Proses async, tidak memblokir response
- Jika notifikasi gagal, publish tetap berhasil (logged as error)

## Next Steps

Setelah testing berhasil, pertimbangkan untuk menambahkan:

1. **Email Notification** (opsional)
   - Kirim email ke karyawan saat slip gaji tersedia
   - Template email dengan link download

2. **Push Notification** (opsional)
   - Web push notification untuk real-time alert
   - Requires service worker setup

3. **Reminder Notification** (opsional)
   - Reminder jika karyawan belum download slip gaji
   - Automated job (cron) setelah X hari

4. **Batch Notification** (optimization)
   - Jika publish 1000+ slip gaji
   - Batch insert notifikasi untuk performa

---

**Status:** ✅ READY TO TEST
**Date:** 2026-05-03
**Author:** Kiro AI Assistant
