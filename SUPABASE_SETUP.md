# 🗄️ Supabase Database Setup

Panduan lengkap untuk setup database Supabase sebelum deployment.

## Prerequisites

- Akun Supabase (gratis di [supabase.com](https://supabase.com))
- Project Supabase sudah dibuat

## Step 1: Create Project (jika belum ada)

1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Klik **New Project**
3. Isi:
   - **Name:** Progresta (atau nama lain)
   - **Database Password:** Buat password yang kuat
   - **Region:** Pilih yang terdekat (contoh: Southeast Asia)
4. Klik **Create new project**
5. Tunggu ~2 menit sampai project ready

## Step 2: Run Migrations

### Opsi A: Via Supabase Dashboard (Recommended)

1. Pergi ke **SQL Editor** di sidebar
2. Klik **New query**
3. Copy-paste isi file migrations satu per satu:

#### Migration 1: Initial Schema
```sql
-- Copy dari: supabase/migrations/20240101000000_initial_schema.sql
-- Paste di SQL Editor
-- Klik Run
```

#### Migration 2: Add Department System
```sql
-- Copy dari: supabase/migrations/add_department_system.sql
-- Paste di SQL Editor
-- Klik Run
```

#### Migration 3: Fix Departments RLS
```sql
-- Copy dari: supabase/migrations/fix_departments_rls.sql
-- Paste di SQL Editor
-- Klik Run
```

#### Migration 4: Grant Permissions
```sql
-- Copy dari: supabase/migrations/grant_departments_permissions.sql
-- Paste di SQL Editor
-- Klik Run
```

### Opsi B: Via Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Step 3: Create Storage Buckets

### 3.1 Avatars Bucket

1. Pergi ke **Storage** di sidebar
2. Klik **New bucket**
3. Isi:
   - **Name:** `avatars`
   - **Public bucket:** ✅ (checked)
4. Klik **Create bucket**

### 3.2 Project Attachments Bucket

1. Klik **New bucket** lagi
2. Isi:
   - **Name:** `project-attachments`
   - **Public bucket:** ✅ (checked)
3. Klik **Create bucket**

### 3.3 Report Photos Bucket

1. Klik **New bucket** lagi
2. Isi:
   - **Name:** `report-photos`
   - **Public bucket:** ✅ (checked)
3. Klik **Create bucket**

## Step 4: Configure Storage Policies

### 4.1 Avatars Bucket Policies

1. Klik bucket **avatars**
2. Pergi ke tab **Policies**
3. Klik **New policy**
4. Pilih **For full customization**
5. Add policy:

**Policy 1: Public Read**
```sql
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

**Policy 2: Authenticated Upload**
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');
```

**Policy 3: Owner Delete**
```sql
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 4.2 Project Attachments Policies

Ulangi langkah yang sama untuk bucket `project-attachments`:

```sql
-- Public read
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-attachments');

-- Authenticated upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-attachments');

-- Admin delete
CREATE POLICY "Admins can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-attachments' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('ADMIN', 'CEO', 'HRD')
  )
);
```

### 4.3 Report Photos Policies

Ulangi untuk bucket `report-photos`:

```sql
-- Public read
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'report-photos');

-- Authenticated upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'report-photos');

-- Owner or admin delete
CREATE POLICY "Owner or admin can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'report-photos' AND
  (
    auth.uid()::text = (storage.foldername(name))[1] OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('ADMIN', 'CEO', 'HRD')
    )
  )
);
```

## Step 5: Create Admin Account

Setelah migrations selesai, create admin account:

1. Pergi ke **SQL Editor**
2. Run query ini (ganti password):

```sql
-- Create admin user
INSERT INTO users (
  id,
  email,
  password,
  name,
  role,
  division_id,
  is_approved,
  is_active
) VALUES (
  gen_random_uuid(),
  'admin@progresta.com',
  crypt('admin123', gen_salt('bf')), -- Ganti 'admin123' dengan password Anda
  'Administrator',
  'ADMIN',
  NULL,
  true,
  true
);
```

## Step 6: Verify Setup

### 6.1 Check Tables

Pergi ke **Table Editor**, pastikan tables ini ada:
- ✅ users
- ✅ divisions
- ✅ departments
- ✅ projects
- ✅ reports
- ✅ attendance

### 6.2 Check Storage

Pergi ke **Storage**, pastikan buckets ini ada:
- ✅ avatars
- ✅ project-attachments
- ✅ report-photos

### 6.3 Check RLS

Pergi ke **Authentication** > **Policies**, pastikan RLS enabled untuk semua tables.

## Step 7: Get API Credentials

1. Pergi ke **Settings** > **API**
2. Copy credentials ini untuk deployment:

```bash
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co

# anon/public key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# service_role key (⚠️ Keep secret!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## Troubleshooting

### Error: "relation does not exist"

**Penyebab:** Migrations belum dijalankan

**Solusi:** Jalankan semua migrations di Step 2

### Error: "permission denied for table"

**Penyebab:** RLS policies belum dikonfigurasi

**Solusi:** 
1. Check RLS enabled: Table Editor > [Table] > RLS enabled
2. Run grant permissions migration

### Error: "bucket not found"

**Penyebab:** Storage buckets belum dibuat

**Solusi:** Create buckets di Step 3

### Can't upload files

**Penyebab:** Storage policies belum dikonfigurasi

**Solusi:** Configure policies di Step 4

## Next Steps

Setelah setup selesai:
1. ✅ Database ready
2. ✅ Storage ready
3. ✅ Admin account ready
4. 🚀 Ready to deploy!

Lanjut ke [QUICK_START_VERCEL.md](./QUICK_START_VERCEL.md) untuk deploy ke Vercel.

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase SQL Editor](https://supabase.com/docs/guides/database/overview)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**Estimated Time:** 15-20 menit
**Difficulty:** Medium 🟡
