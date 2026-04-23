# Fix: PM Tidak Bisa Lihat Departemen

## 🔍 Masalah
Ketika user dengan role **PM** (Project Manager) ingin membuat project, dropdown "Departemen Terlibat" tidak menampilkan data.

## 🎯 Penyebab
1. **API Permission** - API `/api/admin/departments` hanya mengizinkan role `ADMIN`, `GENERAL_AFFAIR`, dan `CEO`
2. **RLS Policy** - Tabel `departments` mungkin belum memiliki policy yang benar

## ✅ Solusi yang Sudah Diterapkan

### 1. Update API Permission
File: `app/api/admin/departments/route.ts`

**Sebelum:**
```typescript
// Only ADMIN, GENERAL_AFFAIR, CEO can access departments
if (!['ADMIN', 'GENERAL_AFFAIR', 'CEO'].includes(session.role)) {
  return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
}
```

**Sesudah:**
```typescript
// Allow ADMIN, GENERAL_AFFAIR, CEO, and PM to access departments
if (!['ADMIN', 'GENERAL_AFFAIR', 'CEO', 'PM'].includes(session.role)) {
  return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 })
}
```

### 2. Fix RLS Policy di Database
Jalankan script SQL: `fix_departments_rls_for_pm.sql`

```sql
-- 1. Aktifkan RLS
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- 2. Policy: Semua authenticated user bisa read
CREATE POLICY "Allow authenticated users to read departments"
ON departments FOR SELECT
TO authenticated
USING (true);

-- 3. Policy: Admin/CEO/HRD bisa manage
CREATE POLICY "Allow admin to manage departments"
ON departments FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('ADMIN', 'CEO', 'GENERAL_AFFAIR')
  )
);

-- 4. Grant permissions
GRANT SELECT ON departments TO authenticated;
GRANT ALL ON departments TO service_role;
```

## 📋 Langkah yang Harus Dilakukan

### Step 1: Jalankan SQL di Supabase
1. Buka Supabase Dashboard → SQL Editor
2. Copy-paste isi file `fix_departments_rls_for_pm.sql`
3. Klik **Run**

### Step 2: Restart Development Server
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 3: Test sebagai PM
1. Login sebagai user dengan role **PM**
2. Buka halaman **Projects Management**
3. Klik **"Inisiasi Project"**
4. Cek apakah dropdown **"Departemen Terlibat"** sudah menampilkan data

## 🔍 Cara Cek Apakah Sudah Fix

### Cek di Browser Console
1. Buka DevTools (F12)
2. Buka tab **Network**
3. Klik tombol "Inisiasi Project"
4. Cari request ke `/api/admin/departments`
5. Cek response:
   - ✅ Status: 200 OK
   - ✅ Body: `{ success: true, departments: [...] }`
   - ❌ Status: 403 Forbidden (masih ada masalah)

### Cek di Database
Jalankan script: `check_departments_rls.sql`

```sql
-- Cek RLS aktif
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename = 'departments';

-- Cek policy yang ada
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'departments';

-- Cek data departments
SELECT id, name, "isActive" FROM departments;
```

## 🎉 Hasil Setelah Fix

Setelah fix diterapkan:
- ✅ PM bisa melihat list departemen
- ✅ PM bisa membuat project baru
- ✅ PM bisa memilih departemen & divisi
- ✅ Dropdown "Departemen Terlibat" terisi dengan data

## 📝 File yang Diubah

1. ✅ `app/api/admin/departments/route.ts` - Tambah PM ke allowed roles
2. ✅ `fix_departments_rls_for_pm.sql` - Script SQL untuk fix RLS

## ⚠️ Catatan Penting

- **Jangan lupa jalankan SQL script** di Supabase!
- **Restart dev server** setelah jalankan SQL
- **Clear browser cache** jika masih tidak muncul (Ctrl+Shift+R)

## 🔧 Troubleshooting

### Masih tidak muncul setelah fix?

1. **Cek Console Error**
   ```
   F12 → Console → Cari error merah
   ```

2. **Cek Network Request**
   ```
   F12 → Network → Cari /api/admin/departments
   Status harus 200, bukan 403 atau 500
   ```

3. **Cek RLS Policy**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'departments';
   ```

4. **Cek Data Departments**
   ```sql
   SELECT * FROM departments WHERE "isActive" = true;
   ```

Jika masih ada masalah, screenshot error di console dan kirim ke saya! 😊
