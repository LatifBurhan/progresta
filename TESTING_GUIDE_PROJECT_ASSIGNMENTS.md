# Panduan Testing: Project Assignments Fix

## Persiapan
1. Pastikan Anda sudah login sebagai admin
2. Pastikan ada minimal 2 user di divisi yang sama
3. Pastikan ada minimal 1 divisi aktif

## Skenario Testing

### Test 1: Project dengan User Spesifik (Assignment)
**Tujuan:** Memastikan hanya user yang dipilih yang bisa melihat project

**Langkah:**
1. Login sebagai Admin
2. Buka halaman "Project Management"
3. Klik "Tambah Project Baru"
4. Isi form:
   - Nama Project: "Test Project - Specific Users"
   - Pilih 1 Departemen
   - Pilih 1 Divisi
   - **PENTING:** Pilih hanya 2-3 user spesifik (jangan pilih semua)
5. Simpan project

**Verifikasi:**
1. Login sebagai salah satu user yang DIPILIH
   - Buka halaman "Buat Laporan"
   - Project "Test Project - Specific Users" HARUS muncul di dropdown
   
2. Login sebagai user yang TIDAK DIPILIH (tapi di divisi yang sama)
   - Buka halaman "Buat Laporan"
   - Project "Test Project - Specific Users" TIDAK BOLEH muncul di dropdown

**Expected Result:** ✅ Hanya user yang dipilih yang bisa melihat project

---

### Test 2: Project untuk Semua User di Divisi (No Assignment)
**Tujuan:** Memastikan semua user di divisi bisa melihat project jika tidak ada assignment spesifik

**Langkah:**
1. Login sebagai Admin
2. Buka halaman "Project Management"
3. Klik "Tambah Project Baru"
4. Isi form:
   - Nama Project: "Test Project - All Division"
   - Pilih 1 Departemen
   - Pilih 1 Divisi
   - **PENTING:** JANGAN pilih user spesifik (kosongkan field user)
5. Simpan project

**Verifikasi:**
1. Login sebagai user manapun di divisi yang dipilih
   - Buka halaman "Buat Laporan"
   - Project "Test Project - All Division" HARUS muncul di dropdown

**Expected Result:** ✅ Semua user di divisi bisa melihat project

---

### Test 3: Project Multi-Divisi dengan Assignment
**Tujuan:** Memastikan assignment bekerja untuk project dengan multiple divisions

**Langkah:**
1. Login sebagai Admin
2. Buka halaman "Project Management"
3. Klik "Tambah Project Baru"
4. Isi form:
   - Nama Project: "Test Project - Multi Division"
   - Pilih 1 Departemen
   - Pilih 2-3 Divisi
   - Pilih beberapa user dari divisi yang berbeda
5. Simpan project

**Verifikasi:**
1. Login sebagai user yang dipilih dari Divisi A
   - Project HARUS muncul
   
2. Login sebagai user yang dipilih dari Divisi B
   - Project HARUS muncul
   
3. Login sebagai user yang TIDAK dipilih dari Divisi A
   - Project TIDAK BOLEH muncul

**Expected Result:** ✅ Hanya user yang di-assign yang bisa melihat, terlepas dari divisi mereka

---

### Test 4: Backward Compatibility
**Tujuan:** Memastikan project lama masih bisa diakses

**Langkah:**
1. Cek project yang sudah ada sebelum fix ini
2. Login sebagai user di divisi yang terkait dengan project lama

**Verifikasi:**
- Project lama HARUS tetap muncul untuk semua user di divisi terkait
- Tidak ada perubahan behavior untuk project lama

**Expected Result:** ✅ Project lama tetap accessible (backward compatible)

---

### Test 5: Create Report dengan Assignment
**Tujuan:** Memastikan validasi akses bekerja saat create report

**Langkah:**
1. Buat project dengan user spesifik (seperti Test 1)
2. Login sebagai user yang TIDAK di-assign
3. Coba buat report untuk project tersebut (via API atau manipulasi form)

**Expected Result:** ✅ Harus mendapat error "You are not assigned to this project"

---

## Verifikasi Database

Jalankan query berikut di Supabase SQL Editor:

```sql
-- Cek project dengan assignments
SELECT 
    p.name,
    (SELECT COUNT(*) FROM project_assignments pa WHERE pa.project_id = p.id) as assignment_count,
    (SELECT string_agg(u.name, ', ') 
     FROM project_assignments pa 
     JOIN users u ON pa.user_id = u.id 
     WHERE pa.project_id = p.id) as assigned_users
FROM projects p
WHERE p.created_at > NOW() - INTERVAL '1 day'
ORDER BY p.created_at DESC;
```

**Expected:**
- Project dengan user spesifik: assignment_count > 0
- Project untuk semua divisi: assignment_count = 0

---

## Troubleshooting

### Problem: Semua user masih bisa melihat project padahal sudah pilih user spesifik

**Solusi:**
1. Cek di database apakah data tersimpan:
   ```sql
   SELECT * FROM project_assignments WHERE project_id = 'PROJECT_ID';
   ```
2. Jika kosong, berarti ada error saat create project
3. Cek console browser untuk error message
4. Cek Supabase logs

### Problem: User yang di-assign tidak bisa melihat project

**Solusi:**
1. Cek RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'project_assignments';
   ```
2. Pastikan user sudah login ulang (refresh token)
3. Clear browser cache

### Problem: Error "relation project_assignments does not exist"

**Solusi:**
1. Tabel belum dibuat, jalankan migration:
   ```bash
   # Atau jalankan SQL di Supabase SQL Editor
   ```
2. Lihat file `supabase/migrations/create_project_assignments_table.sql`

---

## Checklist Testing

- [ ] Test 1: Project dengan user spesifik - PASS
- [ ] Test 2: Project untuk semua divisi - PASS
- [ ] Test 3: Project multi-divisi dengan assignment - PASS
- [ ] Test 4: Backward compatibility - PASS
- [ ] Test 5: Create report validation - PASS
- [ ] Verifikasi database - PASS

Jika semua test PASS, fix berhasil! ✅
