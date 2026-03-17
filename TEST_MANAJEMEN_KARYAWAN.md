# Test Checklist - Fitur Manajemen Karyawan

## 🎯 Test Navigation & Access

### ✅ Akses Halaman
- [ ] Login sebagai HRD → dapat akses `/dashboard/admin/users/manage`
- [ ] Login sebagai CEO → dapat akses `/dashboard/admin/users/manage`
- [ ] Login sebagai ADMIN → dapat akses `/dashboard/admin/users/manage`
- [ ] Login sebagai KARYAWAN → tidak dapat akses (redirect ke dashboard)
- [ ] User tidak login → redirect ke login

### ✅ Navigasi
- [ ] Sidebar menu "⚙️ Kelola Karyawan" muncul untuk HRD/CEO/ADMIN
- [ ] Klik menu sidebar → navigasi ke halaman manage
- [ ] Tombol "Kelola Karyawan" di halaman admin users berfungsi
- [ ] Breadcrumb "Kembali" berfungsi

## 📋 Test Daftar Karyawan

### ✅ Tampilan Data
- [ ] Semua karyawan aktif dan nonaktif ditampilkan
- [ ] Avatar/initial ditampilkan dengan benar
- [ ] Nama, email, role, status, posisi, telepon, divisi tampil lengkap
- [ ] Badge role dengan warna yang sesuai
- [ ] Badge status (Aktif/Non-Aktif) dengan warna yang sesuai
- [ ] Grid responsive di desktop dan mobile

### ✅ Filter & Search
- [ ] Search bar: cari berdasarkan nama → hasil sesuai
- [ ] Search bar: cari berdasarkan email → hasil sesuai
- [ ] Search bar: cari berdasarkan posisi → hasil sesuai
- [ ] Filter status "Aktif" → hanya user aktif
- [ ] Filter status "Non-Aktif" → hanya user nonaktif
- [ ] Filter status "Semua" → semua user
- [ ] Filter role → hasil sesuai role yang dipilih
- [ ] Kombinasi search + filter berfungsi

## ✏️ Test Edit Karyawan

### ✅ Permission Control
- [ ] HRD: dapat edit KARYAWAN dan PM
- [ ] HRD: tidak dapat edit HRD, CEO, ADMIN (tombol edit tidak muncul)
- [ ] CEO: dapat edit semua kecuali ADMIN
- [ ] CEO: tidak dapat edit ADMIN (tombol edit tidak muncul)
- [ ] ADMIN: dapat edit semua user

### ✅ Form Edit
- [ ] Klik "Edit" → modal terbuka dengan data user
- [ ] Email field terisi dengan email saat ini
- [ ] Nama field terisi dengan nama saat ini
- [ ] Phone, position, role, divisi terisi dengan data saat ini
- [ ] Checkbox "Ubah Password" berfungsi
- [ ] Show/hide password toggle berfungsi

### ✅ Validasi Edit
- [ ] Email kosong → error "Email wajib diisi"
- [ ] Nama kosong → error "Nama wajib diisi"
- [ ] Divisi tidak dipilih → error "Divisi wajib diisi"
- [ ] Email sudah digunakan user lain → error "Email already exists"
- [ ] Password < 6 karakter (jika diubah) → error "Password minimal 6 karakter"
- [ ] Data valid → berhasil update

### ✅ Update Success
- [ ] Setelah update berhasil → modal tertutup
- [ ] Data di card langsung terupdate
- [ ] Alert "User berhasil diupdate" muncul
- [ ] Jika password diubah → user bisa login dengan password baru

## 🗑️ Test Hapus Karyawan

### ✅ Permission Control
- [ ] HRD: tidak ada tombol hapus
- [ ] CEO: tidak ada tombol hapus
- [ ] ADMIN: ada tombol hapus (icon trash merah)

### ✅ Konfirmasi Hapus
- [ ] Klik tombol hapus → modal konfirmasi terbuka
- [ ] Modal menampilkan data user yang akan dihapus
- [ ] Peringatan "TINDAKAN TIDAK DAPAT DIBATALKAN" jelas
- [ ] Input konfirmasi "HAPUS" required
- [ ] Tombol "Hapus User" disabled jika belum ketik "HAPUS"

### ✅ Proses Hapus
- [ ] Ketik "HAPUS" → tombol enabled
- [ ] Klik "Hapus User" → loading state
- [ ] Berhasil hapus → user hilang dari daftar
- [ ] Alert "User berhasil dihapus" muncul
- [ ] User yang dihapus tidak bisa login lagi

## 🔄 Test Aktivasi/Deaktivasi

### ✅ Toggle Status
- [ ] User aktif → tombol "Nonaktif" (orange) muncul
- [ ] User nonaktif → tombol "Aktifkan" (green) muncul
- [ ] Klik tombol → modal konfirmasi terbuka

### ✅ Konfirmasi Action
- [ ] Modal menampilkan data user dan status saat ini
- [ ] Penjelasan dampak aktivasi/deaktivasi jelas
- [ ] Tombol konfirmasi dengan warna sesuai (green/orange)

### ✅ Proses Action
- [ ] Konfirmasi aktivasi → user status jadi ACTIVE
- [ ] Konfirmasi deaktivasi → user status jadi INACTIVE
- [ ] Status di card langsung terupdate
- [ ] Badge status berubah warna
- [ ] Alert berhasil muncul

## 🔐 Test Keamanan

### ✅ API Security
- [ ] Request tanpa session → 401 Unauthorized
- [ ] Request dengan role tidak sesuai → 403 Forbidden
- [ ] Update user dengan email existing → 400 Bad Request
- [ ] Delete user sendiri → 400 Bad Request (prevent self-deletion)

### ✅ Data Validation
- [ ] SQL injection attempt → handled safely
- [ ] XSS attempt → sanitized
- [ ] Invalid UUID → handled gracefully
- [ ] Missing required fields → proper error message

## 📱 Test Responsiveness

### ✅ Mobile View
- [ ] Grid cards responsive di mobile
- [ ] Modal edit responsive dan scrollable
- [ ] Filter controls stack properly di mobile
- [ ] Touch interactions berfungsi
- [ ] Text readable di small screen

### ✅ Tablet View
- [ ] Grid layout optimal di tablet
- [ ] Modal sizing appropriate
- [ ] Navigation accessible

## 🚀 Test Performance

### ✅ Loading States
- [ ] Loading state saat fetch data
- [ ] Loading state saat submit edit
- [ ] Loading state saat delete
- [ ] Loading state saat activate/deactivate

### ✅ Error Handling
- [ ] Network error → user-friendly message
- [ ] Server error → proper error display
- [ ] Timeout → handled gracefully
- [ ] Invalid response → fallback behavior

## 📊 Test Data Integrity

### ✅ Database Consistency
- [ ] Update user → profile juga terupdate
- [ ] Delete user → profile ikut terhapus (cascade)
- [ ] Delete user → reports tetap ada (user reference null)
- [ ] Transaction rollback jika ada error

### ✅ Real-time Updates
- [ ] Edit user di tab A → refresh tab B menampilkan data terbaru
- [ ] Delete user di tab A → user hilang di tab B setelah refresh

## Status Test: 🧪 READY FOR TESTING

Semua test case sudah disiapkan. Jalankan test ini secara sistematis untuk memastikan fitur berfungsi dengan baik sebelum production.