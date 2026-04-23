# Fix: Project "Selesai" Hilang dari Riwayat

## Masalah
Ketika status project diubah dari "Aktif" ke "Selesai", project hilang dari halaman riwayat. User tidak bisa melihat report lama mereka untuk project yang sudah selesai.

## Penyebab
API `/api/reports/projects` hanya menampilkan project dengan status "Aktif". API ini digunakan untuk 2 tujuan berbeda:
1. Dropdown "Buat Laporan" → harus filter hanya "Aktif" (user tidak boleh buat report baru untuk project selesai)
2. Grid riwayat project → harus tampilkan semua status termasuk "Selesai"

## Solusi
Menambahkan query parameter `include_completed` ke API:
- Default (tanpa parameter): Hanya tampilkan project "Aktif"
- Dengan `?include_completed=true`: Tampilkan semua status

## File yang Diubah

### 1. `/app/api/reports/projects/route.ts`
**Perubahan:**
- Tambah parameter `include_completed` dari query string
- Conditional filter status berdasarkan parameter:
  - Jika `include_completed=true`: Tidak filter status (tampilkan semua)
  - Jika tidak ada parameter: Filter hanya status "Aktif"

### 2. `/app/dashboard/reports/page.tsx`
**Perubahan:**
- Update `loadProjects()` untuk mengirim parameter `?include_completed=true`
- Sekarang halaman riwayat akan menampilkan project dengan semua status

### 3. `/components/reports/ReportForm.tsx`
**Tidak diubah** - Tetap fetch tanpa parameter, jadi dropdown "Buat Laporan" hanya menampilkan project "Aktif"

## Behavior Setelah Fix

### Halaman Riwayat (`/dashboard/reports`)
- Menampilkan SEMUA project yang user terlibat, termasuk:
  - Aktif
  - Selesai
  - Ditunda
  - Non-Aktif
  - Dibatalkan
- User bisa melihat report lama mereka untuk project yang sudah selesai

### Form Buat Laporan
- Dropdown project hanya menampilkan project dengan status "Aktif"
- User TIDAK bisa membuat report baru untuk project yang sudah selesai
- Ini adalah behavior yang benar

## Testing

### Test 1: Project Selesai Muncul di Riwayat
1. Login sebagai user yang terlibat di project
2. Buka halaman "Riwayat Progres"
3. Project dengan status "Selesai" **HARUS muncul** di grid
4. Klik project → bisa melihat report lama

### Test 2: Project Selesai Tidak Muncul di Dropdown
1. Buka halaman "Buat Laporan"
2. Klik dropdown "Pilih Project"
3. Project dengan status "Selesai" **TIDAK BOLEH muncul**
4. Hanya project "Aktif" yang muncul

### Test 3: Ubah Status Project
1. Login sebagai admin
2. Ubah status project dari "Aktif" ke "Selesai"
3. Login sebagai user biasa
4. Buka "Riwayat Progres" → project masih muncul ✅
5. Buka "Buat Laporan" → project tidak muncul di dropdown ✅

## Backward Compatibility
✅ Tidak ada breaking changes
✅ API tetap backward compatible (default behavior tidak berubah)
✅ Existing code yang tidak kirim parameter tetap bekerja seperti sebelumnya

## Catatan
- Project dengan status apapun akan muncul di riwayat jika user pernah terlibat
- Admin tetap bisa melihat semua project di halaman "Project Management"
- Filter status di halaman admin tidak terpengaruh oleh perubahan ini
