# Test Checklist - Fitur Manajemen Project

## 🎯 Test Navigation & Access

### ✅ Akses Halaman
- [ ] Login sebagai PM → dapat akses `/dashboard/admin/projects`
- [ ] Login sebagai HRD → dapat akses `/dashboard/admin/projects`
- [ ] Login sebagai CEO → dapat akses `/dashboard/admin/projects`
- [ ] Login sebagai ADMIN → dapat akses `/dashboard/admin/projects`
- [ ] Login sebagai KARYAWAN → tidak dapat akses (redirect ke dashboard)
- [ ] User tidak login → redirect ke login

### ✅ Navigasi
- [ ] Sidebar menu "⚙️ Kelola Project" muncul untuk PM/HRD/CEO/ADMIN
- [ ] Klik menu sidebar → navigasi ke halaman kelola project
- [ ] Breadcrumb "Kembali" berfungsi

## 📋 Test Daftar Project

### ✅ Tampilan Data
- [ ] Semua project ditampilkan dalam grid card
- [ ] Warna divisi ditampilkan dengan benar di card
- [ ] Nama, deskripsi, divisi, timeline tampil lengkap
- [ ] Status project otomatis sesuai timeline
- [ ] Counter laporan akurat
- [ ] Durasi pengerjaan dihitung otomatis
- [ ] Grid responsive di desktop dan mobile

### ✅ Status Project Otomatis
- [ ] Project tanpa timeline → status "📋 Draft"
- [ ] Project sebelum start date → status "⏳ Belum Dimulai"
- [ ] Project dalam periode → status "🚀 Sedang Berjalan"
- [ ] Project setelah end date → status "✅ Selesai"
- [ ] Project nonaktif → status "❌ Non-Aktif"

### ✅ Filter & Search
- [ ] Search bar: cari berdasarkan nama → hasil sesuai
- [ ] Search bar: cari berdasarkan deskripsi → hasil sesuai
- [ ] Search bar: cari berdasarkan divisi → hasil sesuai
- [ ] Filter status "Aktif" → hanya project aktif
- [ ] Filter status "Non-Aktif" → hanya project nonaktif
- [ ] Filter status "Semua" → semua project
- [ ] Filter divisi → hasil sesuai divisi yang dipilih
- [ ] Kombinasi search + filter berfungsi

## ➕ Test Tambah Project

### ✅ Permission Control
- [ ] PM: dapat akses tombol "Tambah Project"
- [ ] HRD: dapat akses tombol "Tambah Project"
- [ ] CEO: dapat akses tombol "Tambah Project"
- [ ] ADMIN: dapat akses tombol "Tambah Project"

### ✅ Form Create
- [ ] Klik "Tambah Project" → modal terbuka
- [ ] Field nama, deskripsi, divisi, timeline tersedia
- [ ] Dropdown divisi hanya menampilkan divisi aktif
- [ ] Date picker untuk start date dan end date
- [ ] Preview project update real-time

### ✅ Timeline & Durasi
- [ ] Input start date dan end date → durasi dihitung otomatis
- [ ] Durasi ditampilkan dalam format "X hari pengerjaan"
- [ ] End date min value = start date
- [ ] Preview menampilkan timeline dengan format Indonesia

### ✅ Validasi Create
- [ ] Nama kosong → error "Nama project wajib diisi"
- [ ] Divisi tidak dipilih → error "Divisi wajib dipilih"
- [ ] End date sebelum start date → error "Tanggal selesai harus setelah tanggal mulai"
- [ ] Data valid → berhasil create
- [ ] Preview sesuai dengan hasil akhir

### ✅ Create Success
- [ ] Setelah create berhasil → modal tertutup
- [ ] Project baru muncul di daftar (paling atas)
- [ ] Alert "Project berhasil dibuat" muncul
- [ ] Counter project bertambah

## ✏️ Test Edit Project

### ✅ Permission Control
- [ ] PM: dapat edit semua project
- [ ] HRD: dapat edit semua project
- [ ] CEO: dapat edit semua project
- [ ] ADMIN: dapat edit semua project

### ✅ Form Edit
- [ ] Klik "Edit" → modal terbuka dengan data project
- [ ] Nama field terisi dengan nama saat ini
- [ ] Deskripsi field terisi dengan deskripsi saat ini
- [ ] Divisi terpilih sesuai divisi saat ini
- [ ] Timeline terisi dengan tanggal saat ini
- [ ] Info jumlah laporan ditampilkan
- [ ] Preview update real-time

### ✅ Timeline Edit
- [ ] Ubah start date → durasi recalculate
- [ ] Ubah end date → durasi recalculate
- [ ] Timeline warning jika project ada laporan
- [ ] Date validation tetap berlaku

### ✅ Validasi Edit
- [ ] Nama kosong → error "Nama project wajib diisi"
- [ ] Divisi tidak dipilih → error "Divisi wajib dipilih"
- [ ] End date sebelum start date → error timeline
- [ ] Data valid → berhasil update

### ✅ Edit Success
- [ ] Setelah edit berhasil → modal tertutup
- [ ] Data di card langsung terupdate
- [ ] Alert "Project berhasil diupdate" muncul
- [ ] Status project update jika timeline berubah

## 🗑️ Test Hapus Project

### ✅ Permission Control
- [ ] PM: tidak ada tombol hapus
- [ ] HRD: tidak ada tombol hapus
- [ ] CEO: tidak ada tombol hapus
- [ ] ADMIN: ada tombol hapus (icon trash merah)

### ✅ Validasi Hapus
- [ ] Project dengan laporan → tombol hapus disabled + warning
- [ ] Project tanpa laporan → tombol hapus enabled

### ✅ Konfirmasi Hapus
- [ ] Klik tombol hapus → modal konfirmasi terbuka
- [ ] Modal menampilkan data project yang akan dihapus
- [ ] Timeline dan info laporan ditampilkan
- [ ] Peringatan "TINDAKAN TIDAK DAPAT DIBATALKAN" jelas
- [ ] Input konfirmasi "HAPUS" required
- [ ] Tombol "Hapus Project" disabled jika belum ketik "HAPUS"

### ✅ Proses Hapus
- [ ] Ketik "HAPUS" → tombol enabled
- [ ] Klik "Hapus Project" → loading state
- [ ] Berhasil hapus → project hilang dari daftar
- [ ] Alert "Project berhasil dihapus" muncul

## 🔄 Test Aktivasi/Deaktivasi

### ✅ Toggle Status
- [ ] Project aktif → tombol "Nonaktif" (orange) muncul
- [ ] Project nonaktif → tombol "Aktifkan" (green) muncul

### ✅ Proses Toggle
- [ ] Konfirmasi aktivasi → project status jadi ACTIVE
- [ ] Konfirmasi deaktivasi → project status jadi INACTIVE
- [ ] Status di card langsung terupdate
- [ ] Badge status berubah warna dan text
- [ ] Alert berhasil muncul

## 📅 Test Timeline & Durasi

### ✅ Perhitungan Durasi
- [ ] Start: 1 Jan, End: 2 Jan → durasi 1 hari
- [ ] Start: 1 Jan, End: 31 Jan → durasi 30 hari
- [ ] Start: 1 Jan, End: 1 Feb → durasi 31 hari
- [ ] Durasi ditampilkan dengan highlight biru
- [ ] Durasi update real-time saat ubah tanggal

### ✅ Format Tanggal
- [ ] Input date dalam format YYYY-MM-DD
- [ ] Display dalam format DD MMM YYYY (Indonesia)
- [ ] Contoh: 2024-01-15 → 15 Jan 2024

### ✅ Status Berdasarkan Timeline
- [ ] Hari ini sebelum start date → "Belum Dimulai"
- [ ] Hari ini antara start-end → "Sedang Berjalan"
- [ ] Hari ini setelah end date → "Selesai"
- [ ] Status update otomatis setiap hari

## 🔐 Test Keamanan

### ✅ API Security
- [ ] Request tanpa session → 401 Unauthorized
- [ ] Request dengan role tidak sesuai → 403 Forbidden
- [ ] Create project dengan divisi nonaktif → 400 Bad Request
- [ ] Delete project dengan laporan → 400 Bad Request
- [ ] Timeline invalid → 400 Bad Request

### ✅ Data Validation
- [ ] SQL injection attempt → handled safely
- [ ] XSS attempt → sanitized
- [ ] Invalid UUID → handled gracefully
- [ ] Invalid date format → handled gracefully
- [ ] Missing required fields → proper error message

## 📱 Test Responsiveness

### ✅ Mobile View
- [ ] Grid cards responsive di mobile
- [ ] Modal create/edit responsive dan scrollable
- [ ] Date picker accessible di mobile
- [ ] Filter controls stack properly di mobile
- [ ] Touch interactions berfungsi
- [ ] Timeline info readable di small screen

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
- [ ] Create project → data tersimpan dengan benar
- [ ] Update project → perubahan tersimpan
- [ ] Delete project → data terhapus permanen
- [ ] Toggle status → isActive berubah
- [ ] Timeline tersimpan dalam format ISO DateTime

### ✅ Business Logic
- [ ] Hanya divisi aktif yang bisa dipilih
- [ ] Tidak bisa hapus project dengan laporan
- [ ] Timeline validation berlaku
- [ ] Status project calculate dengan benar

## 🔗 Test Integration

### ✅ Division Integration
- [ ] Warna divisi konsisten di card project
- [ ] Dropdown divisi hanya menampilkan divisi aktif
- [ ] Filter divisi berfungsi dengan benar
- [ ] Ubah divisi → warna card berubah

### ✅ Report Integration
- [ ] Counter laporan per project akurat
- [ ] Project dengan laporan tidak bisa dihapus
- [ ] Project nonaktif tidak muncul di dropdown laporan

### ✅ User Management Integration
- [ ] Role-based access berfungsi
- [ ] Permission sesuai dengan role user
- [ ] Session verification berlaku

## 📈 Test Edge Cases

### ✅ Timeline Edge Cases
- [ ] Start date = end date → error validation
- [ ] Start date di masa lalu → tetap bisa dibuat
- [ ] End date jauh di masa depan → tetap bisa dibuat
- [ ] Ubah timeline project yang sedang berjalan → warning

### ✅ Data Edge Cases
- [ ] Nama project sangat panjang → handled gracefully
- [ ] Deskripsi sangat panjang → truncated dengan line-clamp
- [ ] Project tanpa deskripsi → tidak error
- [ ] Project tanpa timeline → status "Draft"

## Status Test: 🧪 READY FOR COMPREHENSIVE TESTING

Semua test case sudah disiapkan. Jalankan test ini secara sistematis untuk memastikan fitur manajemen project berfungsi dengan baik sebelum production.