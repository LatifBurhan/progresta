# Fix: Bug Project Assignment

## Masalah
Ketika membuat project dengan memilih user tertentu saja, semua user di divisi yang dipilih tetap mendapatkan akses ke project tersebut, padahal seharusnya hanya user yang dipilih saja.

## Penyebab Root
1. **Tabel `project_assignments` tidak ada di database** - Ini adalah masalah utama!
2. Kode API sudah mencoba menyimpan data ke tabel ini, tapi karena tabelnya tidak ada, data tidak tersimpan
3. Logika query untuk mengambil daftar project user hanya memeriksa `project_divisions` (divisi yang terkait dengan project), tanpa memeriksa `project_assignments` (user spesifik yang di-assign ke project)

## Solusi
Implementasi logika filtering yang lebih cerdas:

1. **Jika project memiliki assignment spesifik** (`project_assignments` tidak kosong):
   - Hanya user yang di-assign yang bisa melihat project
   
2. **Jika project tidak memiliki assignment spesifik** (`project_assignments` kosong):
   - Semua user di divisi yang terkait bisa melihat project

## Langkah Perbaikan

### 1. Buat Tabel `project_assignments`
Jalankan migration untuk membuat tabel yang hilang:

```sql
-- File: supabase/migrations/create_project_assignments_table.sql
-- Sudah dijalankan via MCP tool
```

Tabel ini menyimpan assignment spesifik user ke project dengan struktur:
- `id`: UUID primary key
- `user_id`: Foreign key ke users table
- `project_id`: Foreign key ke projects table
- `created_at`: Timestamp
- Unique constraint pada (user_id, project_id)

### 2. Setup RLS Policies
RLS policies sudah dikonfigurasi:
- Users dapat melihat assignment mereka sendiri
- Admin dapat melihat dan manage semua assignments
- Service role memiliki akses penuh

## File yang Diubah

### 1. `/app/api/reports/projects/route.ts`
Endpoint untuk mengambil daftar project yang bisa diakses user.

**Perubahan:**
- Tambah query untuk mengecek `project_assignments` user
- Tambah query untuk mengecek semua `project_assignments` per project
- Filter project berdasarkan logika assignment

### 2. `/app/api/dashboard/stats/route.ts`
Endpoint untuk mengambil statistik dashboard termasuk active projects.

**Perubahan:**
- Sama seperti di atas, tambah logika filtering berdasarkan assignment

### 3. `/app/api/reports/create/route.ts`
Endpoint untuk membuat report baru.

**Perubahan:**
- Validasi akses user ke project sekarang memeriksa:
  1. Apakah user di-assign secara spesifik
  2. Jika tidak, apakah divisi user terkait dengan project
  3. Jika divisi terkait, apakah project memiliki assignment spesifik
  4. Jika ada assignment spesifik tapi user tidak di-assign, tolak akses

### 4. `/app/api/reports/update/[id]/route.ts`
Endpoint untuk update report.

**Perubahan:**
- Sama seperti create report, validasi akses diperbaiki

### 5. `/app/dashboard/report/page.tsx` ⭐ PENTING
Halaman create report yang fetch projects langsung dari database.

**Perubahan:**
- **INI ADALAH FIX UTAMA UNTUK MASALAH ANDA!**
- Sebelumnya: Fetch semua projects dan filter hanya berdasarkan division
- Sekarang: Menggunakan logika assignment yang sama dengan API endpoints
- Filter projects berdasarkan:
  1. Cek apakah user di-assign
  2. Cek apakah project punya assignments
  3. Hanya tampilkan project jika user di-assign ATAU project tidak punya assignments

## Testing
Untuk menguji fix ini:

1. Buat project baru dengan memilih departemen dan divisi tertentu
2. Pilih hanya beberapa user spesifik (tidak semua user di divisi)
3. Login sebagai user yang dipilih → harus bisa melihat project
4. Login sebagai user yang tidak dipilih (tapi di divisi yang sama) → tidak boleh melihat project
5. Buat project lain tanpa memilih user spesifik → semua user di divisi harus bisa melihat

## Catatan
- Perubahan ini backward compatible dengan project yang sudah ada
- Project lama tanpa assignment spesifik akan tetap bisa diakses oleh semua user di divisi terkait
- Project baru dengan assignment spesifik hanya bisa diakses oleh user yang di-assign
