# Test Checklist - Fitur Kelola Divisi

## 🎯 Test Navigation & Access

### ✅ Akses Halaman
- [ ] Login sebagai HRD → dapat akses `/dashboard/admin/divisions`
- [ ] Login sebagai CEO → dapat akses `/dashboard/admin/divisions`
- [ ] Login sebagai ADMIN → dapat akses `/dashboard/admin/divisions`
- [ ] Login sebagai KARYAWAN → tidak dapat akses (redirect ke dashboard)
- [ ] User tidak login → redirect ke login

### ✅ Navigasi
- [ ] Sidebar menu "⚙️ Kelola Divisi" muncul untuk HRD/CEO/ADMIN
- [ ] Klik menu sidebar → navigasi ke halaman kelola divisi
- [ ] Breadcrumb "Kembali" berfungsi

## 📋 Test Daftar Divisi

### ✅ Tampilan Data
- [ ] Semua divisi ditampilkan dalam grid card
- [ ] Warna divisi ditampilkan dengan benar
- [ ] Nama, deskripsi, status tampil lengkap
- [ ] Badge status (Aktif/Non-Aktif) dengan warna yang sesuai
- [ ] Counter karyawan dan project akurat
- [ ] Grid responsive di desktop dan mobile

### ✅ Filter & Search
- [ ] Search bar: cari berdasarkan nama → hasil sesuai
- [ ] Search bar: cari berdasarkan deskripsi → hasil sesuai
- [ ] Filter status "Aktif" → hanya divisi aktif
- [ ] Filter status "Non-Aktif" → hanya divisi nonaktif
- [ ] Filter status "Semua" → semua divisi
- [ ] Kombinasi search + filter berfungsi

## ➕ Test Tambah Divisi

### ✅ Permission Control
- [ ] HRD: dapat akses tombol "Tambah Divisi"
- [ ] CEO: dapat akses tombol "Tambah Divisi"
- [ ] ADMIN: dapat akses tombol "Tambah Divisi"

### ✅ Form Create
- [ ] Klik "Tambah Divisi" → modal terbuka
- [ ] Field nama, deskripsi, color picker tersedia
- [ ] 10 pilihan warna preset ditampilkan
- [ ] Preview divisi update real-time
- [ ] Default warna biru (#3B82F6)

### ✅ Validasi Create
- [ ] Nama kosong → error "Nama divisi wajib diisi"
- [ ] Nama sudah ada → error "Nama divisi sudah digunakan"
- [ ] Data valid → berhasil create
- [ ] Preview sesuai dengan hasil akhir

### ✅ Create Success
- [ ] Setelah create berhasil → modal tertutup
- [ ] Divisi baru muncul di daftar (paling atas)
- [ ] Alert "Divisi berhasil dibuat" muncul
- [ ] Counter divisi bertambah

## ✏️ Test Edit Divisi

### ✅ Permission Control
- [ ] HRD: dapat edit semua divisi
- [ ] CEO: dapat edit semua divisi
- [ ] ADMIN: dapat edit semua divisi

### ✅ Form Edit
- [ ] Klik "Edit" → modal terbuka dengan data divisi
- [ ] Nama field terisi dengan nama saat ini
- [ ] Deskripsi field terisi dengan deskripsi saat ini
- [ ] Warna terpilih sesuai warna saat ini
- [ ] Info karyawan dan project ditampilkan
- [ ] Preview update real-time

### ✅ Validasi Edit
- [ ] Nama kosong → error "Nama divisi wajib diisi"
- [ ] Nama sudah digunakan divisi lain → error "Nama divisi sudah digunakan"
- [ ] Nama sama dengan nama saat ini → boleh (tidak error)
- [ ] Data valid → berhasil update

### ✅ Edit Success
- [ ] Setelah edit berhasil → modal tertutup
- [ ] Data di card langsung terupdate
- [ ] Alert "Divisi berhasil diupdate" muncul
- [ ] Warna divisi berubah jika diubah

## 🗑️ Test Hapus Divisi

### ✅ Permission Control
- [ ] HRD: tidak ada tombol hapus
- [ ] CEO: tidak ada tombol hapus
- [ ] ADMIN: ada tombol hapus (icon trash merah)

### ✅ Validasi Hapus
- [ ] Divisi dengan karyawan → tombol hapus disabled + warning
- [ ] Divisi dengan project → tombol hapus disabled + warning
- [ ] Divisi kosong → tombol hapus enabled

### ✅ Konfirmasi Hapus
- [ ] Klik tombol hapus → modal konfirmasi terbuka
- [ ] Modal menampilkan data divisi yang akan dihapus
- [ ] Peringatan "TINDAKAN TIDAK DAPAT DIBATALKAN" jelas
- [ ] Input konfirmasi "HAPUS" required
- [ ] Tombol "Hapus Divisi" disabled jika belum ketik "HAPUS"

### ✅ Proses Hapus
- [ ] Ketik "HAPUS" → tombol enabled
- [ ] Klik "Hapus Divisi" → loading state
- [ ] Berhasil hapus → divisi hilang dari daftar
- [ ] Alert "Divisi berhasil dihapus" muncul

## 🔄 Test Aktivasi/Deaktivasi

### ✅ Toggle Status
- [ ] Divisi aktif → tombol "Nonaktif" (orange) muncul
- [ ] Divisi nonaktif → tombol "Aktifkan" (green) muncul

### ✅ Validasi Status
- [ ] Deaktivasi divisi dengan karyawan → error + tidak berubah
- [ ] Deaktivasi divisi kosong → berhasil
- [ ] Aktivasi divisi nonaktif → berhasil

### ✅ Proses Toggle
- [ ] Konfirmasi aktivasi → divisi status jadi ACTIVE
- [ ] Konfirmasi deaktivasi → divisi status jadi INACTIVE
- [ ] Status di card langsung terupdate
- [ ] Badge status berubah warna
- [ ] Alert berhasil muncul

## 🎨 Test Color System

### ✅ Color Picker
- [ ] 10 warna preset ditampilkan dengan benar
- [ ] Klik warna → warna terpilih (border hitam + scale)
- [ ] Preview divisi update sesuai warna dipilih
- [ ] Tooltip nama warna muncul saat hover

### ✅ Color Display
- [ ] Warna divisi konsisten di card
- [ ] Initial divisi menggunakan warna yang dipilih
- [ ] Kontras text putih di background warna baik
- [ ] Warna tersimpan dan tampil konsisten

## 🔐 Test Keamanan

### ✅ API Security
- [ ] Request tanpa session → 401 Unauthorized
- [ ] Request dengan role tidak sesuai → 403 Forbidden
- [ ] Create divisi dengan nama existing → 400 Bad Request
- [ ] Delete divisi dengan karyawan → 400 Bad Request
- [ ] Deactivate divisi dengan karyawan → 400 Bad Request

### ✅ Data Validation
- [ ] SQL injection attempt → handled safely
- [ ] XSS attempt → sanitized
- [ ] Invalid UUID → handled gracefully
- [ ] Missing required fields → proper error message

## 📱 Test Responsiveness

### ✅ Mobile View
- [ ] Grid cards responsive di mobile
- [ ] Modal create/edit responsive dan scrollable
- [ ] Color picker accessible di mobile
- [ ] Filter controls stack properly di mobile
- [ ] Touch interactions berfungsi

### ✅ Tablet View
- [ ] Grid layout optimal di tablet
- [ ] Modal sizing appropriate
- [ ] Navigation accessible

## 🚀 Test Performance

### ✅ Loading States
- [ ] Loading state saat fetch data
- [ ] Loading state saat submit create
- [ ] Loading state saat submit edit
- [ ] Loading state saat delete
- [ ] Loading state saat toggle status

### ✅ Error Handling
- [ ] Network error → user-friendly message
- [ ] Server error → proper error display
- [ ] Timeout → handled gracefully
- [ ] Invalid response → fallback behavior

## 📊 Test Data Integrity

### ✅ Database Consistency
- [ ] Create divisi → data tersimpan dengan benar
- [ ] Update divisi → perubahan tersimpan
- [ ] Delete divisi → data terhapus permanen
- [ ] Toggle status → isActive berubah

### ✅ Business Logic
- [ ] Nama divisi unique constraint berfungsi
- [ ] Tidak bisa hapus divisi dengan karyawan
- [ ] Tidak bisa hapus divisi dengan project
- [ ] Tidak bisa nonaktif divisi dengan karyawan aktif

## 🔗 Test Integration

### ✅ User Management Integration
- [ ] Dropdown divisi di create user menampilkan divisi aktif
- [ ] Assign user ke divisi → counter bertambah
- [ ] Delete user → counter berkurang
- [ ] Divisi nonaktif tidak muncul di dropdown

### ✅ Project Integration
- [ ] Project terkait divisi → counter project akurat
- [ ] Delete project → counter berkurang
- [ ] Create project → counter bertambah

## Status Test: 🧪 READY FOR COMPREHENSIVE TESTING

Semua test case sudah disiapkan. Jalankan test ini secara sistematis untuk memastikan fitur kelola divisi berfungsi dengan baik sebelum production.