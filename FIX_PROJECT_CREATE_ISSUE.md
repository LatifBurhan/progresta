# Fix: Project Creation Error - Field Mismatch

## Masalah yang Ditemukan

Fitur tambah project mengalami error karena **mismatch antara field yang dikirim dari UI dan field yang ada di database Supabase**.

### Detail Masalah:

1. **UI (CreateProjectModal.tsx)** mengirim data dengan format camelCase:
   - `tanggalMulai`
   - `tanggalSelesai`
   - `outputDiharapkan`
   - `lampiranUrl`

2. **Database Supabase** memiliki kolom dengan format snake_case:
   - `tanggal_mulai`
   - `tanggal_selesai`
   - `output_diharapkan`
   - `lampiran_url`

3. **API Route** (`/api/admin/projects/create/route.ts`) mencoba insert dengan field yang SALAH:
   - `startDate` ❌ (tidak ada di database)
   - `endDate` ❌ (tidak ada di database)
   - `isActive` ❌ (tidak ada di database)
   - `divisionId` ❌ (tidak ada di database)

## Solusi yang Diterapkan

### 1. Perbaikan API Route (`template/app/api/admin/projects/create/route.ts`)

**Sebelum:**
```typescript
const projectData = {
  id: projectId,
  name: name.trim(),
  description: description?.trim() || null,
  startDate: tanggalMulai || null,  // ❌ Field tidak ada
  endDate: tanggalSelesai || null,   // ❌ Field tidak ada
  isActive: true,                     // ❌ Field tidak ada
  divisionId: divisionIds[0] || null, // ❌ Field tidak ada
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}
```

**Sesudah:**
```typescript
const projectData = {
  id: projectId,
  name: name.trim(),
  tujuan: tujuan?.trim() || null,
  description: description?.trim() || null,
  pic: pic?.trim() || null,
  prioritas: prioritas || null,
  tanggal_mulai: tanggalMulai || null,        // ✅ Sesuai database
  tanggal_selesai: tanggalSelesai || null,    // ✅ Sesuai database
  output_diharapkan: outputDiharapkan?.trim() || null, // ✅ Sesuai database
  catatan: catatan?.trim() || null,
  lampiran_url: lampiranUrl?.trim() || null,  // ✅ Sesuai database
  status: 'Aktif',                             // ✅ Sesuai database
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}
```

### 2. Perbaikan Query untuk Mengambil Data Project dengan Divisions

**Sebelum:**
```typescript
const { data: completeProject, error: fetchError } = await supabaseAdmin
  .from('projects')
  .select(`
    *,
    divisions:divisionId (  // ❌ Field tidak ada
      id,
      name,
      color
    )
  `)
  .eq('id', newProject.id)
  .single()
```

**Sesudah:**
```typescript
const { data: projectDivisionsData, error: pdError } = await supabaseAdmin
  .from('project_divisions')  // ✅ Menggunakan tabel relasi yang benar
  .select(`
    division_id,
    divisions:division_id (
      id,
      name,
      color
    )
  `)
  .eq('project_id', newProject.id)

const transformedProject = {
  ...newProject,
  divisions: projectDivisionsData?.map(pd => pd.divisions).filter(Boolean) || []
}
```

## Struktur Database yang Benar

### Tabel `projects`:
```sql
- id (UUID, PRIMARY KEY)
- name (VARCHAR, NOT NULL)
- tujuan (TEXT)
- description (TEXT)
- pic (VARCHAR)
- prioritas (VARCHAR) CHECK IN ('Rendah', 'Sedang', 'Tinggi', 'Urgent')
- tanggal_mulai (DATE)
- tanggal_selesai (DATE)
- output_diharapkan (TEXT)
- catatan (TEXT)
- lampiran_url (TEXT)
- status (VARCHAR) DEFAULT 'Aktif' CHECK IN ('Aktif', 'Selesai', 'Ditunda', 'Dibatalkan')
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
- created_by (UUID, REFERENCES auth.users)
```

### Tabel `project_divisions`:
```sql
- id (UUID, PRIMARY KEY)
- project_id (UUID, REFERENCES projects, NOT NULL)
- division_id (UUID, REFERENCES divisions, NOT NULL)
- created_at (TIMESTAMPTZ)
- UNIQUE(project_id, division_id)
```

## Testing

Untuk test koneksi database dan fitur create project:

1. **Test koneksi database:**
   ```
   GET /api/test-db-simple
   ```

2. **Test create project:**
   ```
   POST /api/admin/projects/create
   Body: {
     "name": "Test Project",
     "tujuan": "Testing purpose",
     "description": "Test description",
     "divisionIds": ["6a0aee24-fed6-4933-ac26-930825abea6c"],
     "pic": "John Doe",
     "prioritas": "Tinggi",
     "tanggalMulai": "2026-04-01",
     "tanggalSelesai": "2026-05-01",
     "outputDiharapkan": "Working project creation",
     "catatan": "Test notes",
     "lampiranUrl": "https://example.com"
   }
   ```

## Kesimpulan

Masalah sudah diperbaiki dengan menyesuaikan field names di API route agar sesuai dengan struktur database Supabase yang menggunakan snake_case. Sekarang fitur tambah project seharusnya berfungsi dengan baik.

## File yang Diubah

1. ✅ `template/app/api/admin/projects/create/route.ts` - Diperbaiki field mapping untuk create
2. ✅ `template/app/api/admin/projects/[id]/route.ts` - Diperbaiki field mapping untuk update & delete
3. ✅ `template/app/dashboard/admin/projects/page.tsx` - Diperbaiki query untuk fetch projects dengan divisions yang benar

## Cara Test

### 1. Test Koneksi Database
```bash
curl http://localhost:3000/api/test-db-simple
```

### 2. Test Create Project (via UI)
1. Login sebagai user dengan role PM/HRD/CEO/ADMIN
2. Buka halaman `/dashboard/admin/projects`
3. Klik tombol "Tambah Project Baru"
4. Isi form dengan data lengkap:
   - Nama Project (required)
   - Tujuan
   - Deskripsi
   - Pilih minimal 1 divisi (required)
   - PIC
   - Prioritas (Rendah/Sedang/Tinggi/Urgent)
   - Tanggal Mulai & Selesai
   - Output yang Diharapkan
   - Catatan
   - Link Lampiran
5. Klik "Buat Project"
6. Project seharusnya berhasil dibuat dan muncul di list

### 3. Test Update Project
1. Klik tombol edit pada salah satu project
2. Ubah beberapa field
3. Klik "Update Project"
4. Perubahan seharusnya tersimpan

### 4. Test Delete Project
1. Klik tombol delete pada salah satu project (hanya ADMIN)
2. Konfirmasi penghapusan
3. Project seharusnya terhapus dari database

## Troubleshooting

### Jika masih error saat create project:

1. **Cek koneksi database:**
   ```bash
   curl http://localhost:3000/api/test-db-simple
   ```

2. **Cek struktur tabel di Supabase:**
   - Buka Supabase Dashboard
   - Masuk ke SQL Editor
   - Jalankan query:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'projects';
   ```

3. **Cek RLS (Row Level Security) policies:**
   - Pastikan service role key sudah benar di `.env`
   - Pastikan RLS policies mengizinkan insert untuk role yang sesuai

4. **Cek logs di browser console dan server terminal:**
   - Buka Developer Tools (F12) di browser
   - Lihat tab Console untuk error dari frontend
   - Lihat terminal server untuk error dari backend

### Error: "Failed to create project-division relationship"

Ini berarti tabel `project_divisions` belum ada atau RLS policy-nya belum benar. Jalankan SQL ini di Supabase:

```sql
-- Cek apakah tabel ada
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_name = 'project_divisions'
);

-- Jika belum ada, buat dengan menjalankan file:
-- CREATE_NEW_PROJECTS_TABLE.sql
```
