# Department System - RLS Fix

## Problem

Dropdown departemen di form "Tambah Divisi" tidak menampilkan pilihan departemen (kosong).

### Root Cause

Table `departments` memiliki Row Level Security (RLS) yang aktif secara default, tetapi tidak ada policy yang mengizinkan akses. Ini menyebabkan error:

```
permission denied for table departments
```

## Solution

Disable RLS pada table `departments` karena ini adalah reference table yang aman untuk dibaca oleh semua user yang terautentikasi.

## How to Fix

### Option 1: Via Supabase Dashboard (RECOMMENDED)

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar kiri
4. Klik **New Query**
5. Copy-paste SQL berikut:

```sql
-- Disable RLS on departments table
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
```

6. Klik **Run** atau tekan `Ctrl+Enter`
7. Refresh halaman aplikasi dan coba buka form "Tambah Divisi" lagi

### Option 2: Via Migration File

Jika Anda ingin menjalankan migration file:

1. Buka file: `template/supabase/migrations/fix_departments_rls.sql`
2. Copy isi file tersebut
3. Jalankan di Supabase SQL Editor (ikuti langkah Option 1)

## Verification

Setelah menjalankan fix, verifikasi dengan:

1. Buka aplikasi
2. Login sebagai ADMIN/HRD/CEO
3. Pergi ke halaman **Kelola Divisi**
4. Klik tombol **Tambah Divisi**
5. Dropdown **Departemen** seharusnya menampilkan 4 pilihan:
   - Al-Wustho
   - Elfan Academy
   - Ufuk Hijau
   - Aflaha

## Technical Details

### Why Disable RLS?

Table `departments` adalah reference data yang:
- Hanya berisi 4 departemen tetap
- Tidak berisi data sensitif
- Perlu dibaca oleh semua user yang terautentikasi
- Jarang diubah (hanya oleh ADMIN)

Oleh karena itu, lebih simple untuk disable RLS daripada membuat complex policies.

### Alternative: Enable RLS with Policies

Jika Anda ingin tetap menggunakan RLS, gunakan SQL berikut:

```sql
-- Enable RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role has full access to departments"
ON departments FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- Allow authenticated users to read
CREATE POLICY "Authenticated users can read departments"
ON departments FOR SELECT TO authenticated
USING (true);

-- Allow ADMIN/HRD/CEO to manage
CREATE POLICY "Admins can manage departments"
ON departments FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('ADMIN', 'HRD', 'CEO')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('ADMIN', 'HRD', 'CEO')
  )
);
```

## Files Modified

- `template/supabase/migrations/fix_departments_rls.sql` - Migration file
- `template/app/api/admin/departments/route.ts` - Added logging for debugging
- `template/DEPARTMENT_SYSTEM_FIX.md` - This documentation

## Next Steps

Setelah fix ini diterapkan, lanjutkan dengan:

1. ✅ Test dropdown departemen di form "Tambah Divisi"
2. ⏳ Update Edit Division Modal (add department dropdown)
3. ⏳ Update Division List Display (show department name)
4. ⏳ Update User Management (add department selection)
5. ⏳ Update Project Management (multi-department selection)
6. ⏳ Add Department Filters (Dashboard, Reports)
