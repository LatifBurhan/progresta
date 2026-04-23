# Role PM - Menu Restrictions

## Perubahan
Role PM sekarang tidak bisa mengakses menu:
1. **Database Karyawan** (`/dashboard/admin/users/manage`)
2. **Manajemen Divisi** (`/dashboard/admin/divisions`)

## Menu yang Bisa Diakses PM

### Menu Utama (Semua Role)
- Dashboard
- Buat Laporan
- Riwayat
- Lembur
- Slip Gaji
- Profil Saya

### Admin Panel (PM)
- ✅ Overview
- ❌ Database Karyawan (hanya GENERAL_AFFAIR, CEO, ADMIN)
- ✅ Kelola Project
- ❌ Manajemen Divisi (hanya GENERAL_AFFAIR, CEO, ADMIN)
- ✅ Laporan Project
- ❌ Kelola Lembur (hanya GENERAL_AFFAIR, CEO, ADMIN)
- ❌ Kelola Slip Gaji & Cuti (hanya GENERAL_AFFAIR, CEO, ADMIN)

## Akses Berdasarkan Role

### STAFF
- Menu utama saja
- Tidak ada akses Admin Panel

### PM (Project Manager)
- Menu utama
- Admin Panel:
  - Overview
  - Kelola Project
  - Laporan Project

### GENERAL_AFFAIR / CEO / ADMIN
- Menu utama
- Admin Panel lengkap:
  - Overview
  - Database Karyawan
  - Kelola Project
  - Manajemen Divisi
  - Laporan Project
  - Kelola Lembur
  - Kelola Slip Gaji & Cuti

## File yang Diubah
- `app/dashboard/ResponsiveLayout.tsx`
  - Wrap menu "Database Karyawan" dengan kondisi role
  - Wrap menu "Manajemen Divisi" dengan kondisi role

## Testing

### Test sebagai PM:
1. Login sebagai user dengan role PM
2. Buka sidebar
3. Di section "Admin Panel", harus muncul:
   - ✅ Overview
   - ✅ Kelola Project
   - ✅ Laporan Project
4. Yang TIDAK boleh muncul:
   - ❌ Database Karyawan
   - ❌ Manajemen Divisi
   - ❌ Kelola Lembur
   - ❌ Kelola Slip Gaji & Cuti

### Test sebagai ADMIN:
1. Login sebagai user dengan role ADMIN
2. Semua menu harus muncul

## Catatan
- PM tetap bisa mengelola project (create, edit, delete)
- PM tetap bisa melihat laporan project
- PM tidak bisa mengelola user/karyawan
- PM tidak bisa mengelola divisi
- PM tidak bisa mengelola lembur
- PM tidak bisa mengelola slip gaji & cuti
