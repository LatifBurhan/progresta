# 🚀 Cara Deploy Profile Revision (Phase 1-5)

## ⚡ Langkah Cepat (15 menit)

### 1. Jalankan 3 Migration di Supabase (5 menit)

Buka **Supabase Dashboard → SQL Editor**, lalu jalankan 3 file ini **BERURUTAN**:

#### Migration 1: Tambah Role Baru
**File:** `supabase/migrations/20240401000001_add_new_role_values.sql`

```sql
-- Copy-paste isi file ini ke SQL Editor
-- Klik "Run"
-- Tunggu sampai muncul "Success"
```

#### Migration 2: Update Database Utama
**File:** `supabase/migrations/20240401000000_revisi_profil_karyawan.sql`

```sql
-- Copy-paste isi file ini ke SQL Editor
-- Klik "Run"
-- Tunggu sampai muncul "Success"
```

#### Migration 3: Setup Storage Foto
**File:** `supabase/migrations/20240401000002_setup_profile_photos_storage.sql`

```sql
-- Copy-paste isi file ini ke SQL Editor
-- Klik "Run"
-- Tunggu sampai muncul "Success"
```

---

### 2. Cek Database (2 menit)

Jalankan query ini untuk memastikan migration berhasil:

```sql
-- Cek kolom baru ada
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('employee_status', 'address', 'notes');
-- Harus muncul 3 rows

-- Cek tabel baru ada
SELECT COUNT(*) FROM user_departments;
SELECT COUNT(*) FROM user_divisions;
-- Harus tidak error

-- Cek role sudah berubah
SELECT role, COUNT(*) FROM users GROUP BY role;
-- Harus muncul GENERAL_AFFAIR dan STAFF (bukan HRD dan KARYAWAN)

-- Cek storage bucket
SELECT * FROM storage.buckets WHERE id = 'profile-photos';
-- Harus muncul 1 row
```

---

### 3. Deploy Code (3 menit)

```bash
# Di terminal/command prompt
git add .
git commit -m "feat: profile revision Phase 1-5 complete"
git push origin main
```

Tunggu deployment selesai (biasanya 2-3 menit di Vercel).

---

### 4. Test Fitur (5 menit)

#### Test 1: Buat User Baru
1. Login sebagai ADMIN atau General Affair
2. Buka **Database Karyawan → Tambah User**
3. Isi semua field termasuk:
   - Status Karyawan: ketik "Kontrak"
   - Alamat: ketik alamat lengkap
   - Catatan: ketik catatan internal
4. Klik "Buat User"
5. ✅ User berhasil dibuat

#### Test 2: Upload Foto Profil
1. Login sebagai user biasa (STAFF)
2. Klik menu **"Profil Saya"** di sidebar
3. Klik tombol **"Upload Foto"**
4. Pilih foto (JPG/PNG, < 5MB)
5. ✅ Foto muncul di preview
6. ✅ Foto muncul di navbar (pojok kanan atas)

#### Test 3: Cek Role Baru
1. Buka **Database Karyawan**
2. ✅ Lihat badge "Staff" (bukan "Karyawan")
3. ✅ Lihat badge "General Affair" (bukan "HRD")
4. ✅ Tidak ada tulisan "HRD" atau "KARYAWAN" di mana pun

---

## ✅ Checklist Deployment

### Pre-Deployment
- [ ] Backup database (optional)
- [ ] Pastikan punya akses Supabase Dashboard
- [ ] Pastikan punya akses Git repository

### Deployment
- [ ] ✅ Run migration 1 (add role values)
- [ ] ✅ Run migration 2 (main migration)
- [ ] ✅ Run migration 3 (storage setup)
- [ ] ✅ Verify database changes
- [ ] ✅ Deploy code (git push)
- [ ] ✅ Wait for deployment complete

### Testing
- [ ] ✅ Test buat user baru dengan field baru
- [ ] ✅ Test upload foto profil
- [ ] ✅ Test role badges (Staff, General Affair)
- [ ] ✅ Test hapus foto profil
- [ ] ✅ Test validasi file (size, type)

---

## 🎯 Apa yang Berubah?

### 1. Role Names
- **HRD** → **General Affair**
- **KARYAWAN** → **Staff**

### 2. Field Baru di Form User
- **Status Karyawan** (ketik bebas: Tetap, Kontrak, Magang, dll)
- **Alamat** (textarea untuk alamat lengkap)
- **Catatan** (textarea, hanya Admin & General Affair yang bisa edit)

### 3. Upload Foto Profil
- Semua user bisa upload foto profil sendiri
- STAFF hanya bisa edit foto, tidak bisa edit field lain
- Format: JPG, PNG (max 5MB)

### 4. Multiple Departments & Divisions
- User bisa punya lebih dari 1 department
- User bisa punya lebih dari 1 division
- Department jadi filter sebelum pilih division

---

## 🐛 Troubleshooting

### Problem: Migration error "role already exists"
**Solusi:** Role sudah ada, skip migration 1, langsung ke migration 2

### Problem: Upload foto error
**Solusi:**
- Cek storage bucket `profile-photos` ada di Supabase Dashboard → Storage
- Cek file size < 5MB
- Cek file type JPG/PNG

### Problem: Foto tidak muncul di navbar
**Solusi:**
- Hard refresh browser (Ctrl+Shift+R)
- Logout dan login lagi

### Problem: Masih ada tulisan "HRD" atau "KARYAWAN"
**Solusi:**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)

---

## 📞 Butuh Bantuan?

**Dokumentasi Lengkap:**
- `PROFILE_REVISION_PHASE_1_TO_5_COMPLETE.md` - Overview lengkap
- `PROFILE_REVISION_COMPLETE.md` - Detail Phase 1-4
- `PROFILE_PHOTO_UPLOAD_IMPLEMENTATION.md` - Detail Phase 5
- `TESTING_GUIDE.md` - Panduan testing detail

**File Penting:**
- Migration: `supabase/migrations/2024040100000*.sql` (3 files)
- Component: `components/profile/ProfilePhotoUploader.tsx`
- API: `app/api/profile/photo/upload/route.ts`
- Page: `app/dashboard/profile/page.tsx`

---

## ✅ Selesai!

Setelah semua checklist ✅, fitur profile revision sudah siap digunakan!

**Total Waktu:** ~15 menit  
**Risk Level:** Medium (ada perubahan database)  
**Rollback:** Bisa (code only, database tidak disarankan)

---

**Last Updated:** 2024-04-01  
**Version:** 1.0.0
