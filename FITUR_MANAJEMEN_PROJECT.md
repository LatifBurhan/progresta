# Fitur Manajemen Project Lengkap

## Overview
Fitur lengkap untuk PM, HRD, CEO, dan ADMIN dalam mengelola project perusahaan dengan kemampuan menambah, mengedit, menghapus project, serta timeline otomatis dengan perhitungan durasi pengerjaan.

## Akses & Permissions

### Role yang Dapat Mengakses
- **PM**: Dapat menambah, edit, aktivasi/deaktivasi project
- **HRD**: Dapat menambah, edit, aktivasi/deaktivasi project
- **CEO**: Dapat menambah, edit, aktivasi/deaktivasi project
- **ADMIN**: Full access termasuk hapus project

### URL & Navigasi
- **URL**: `/dashboard/admin/projects`
- **Navigasi**: Dashboard → Admin Panel → ⚙️ Kelola Project

## Fitur Utama

### 1. 📋 Daftar Project
- **Grid Layout**: Tampilan card responsif dengan warna divisi
- **Informasi Lengkap**: Nama, deskripsi, divisi, timeline, status, jumlah laporan
- **Status Otomatis**: 
  - 📋 Draft (belum ada timeline)
  - ⏳ Belum Dimulai (sebelum start date)
  - 🚀 Sedang Berjalan (dalam periode timeline)
  - ✅ Selesai (setelah end date)
  - ❌ Non-Aktif (dinonaktifkan)
- **Durasi Otomatis**: Perhitungan hari pengerjaan berdasarkan timeline

### 2. 🔍 Filter & Pencarian
- **Search Bar**: Cari berdasarkan nama project, deskripsi, atau divisi
- **Filter Status**: Semua, Aktif, Non-Aktif
- **Filter Divisi**: Dropdown untuk filter berdasarkan divisi
- **Real-time Filtering**: Filter langsung tanpa reload

### 3. ➕ Tambah Project Baru
- **Modal Create**: Form lengkap untuk project baru
- **Field yang Diperlukan**:
  - Nama project (wajib)
  - Deskripsi (opsional)
  - Divisi penanggung jawab (wajib, hanya divisi aktif)
  - Tanggal mulai (opsional)
  - Tanggal selesai (opsional)
- **Timeline Validation**: End date harus setelah start date
- **Durasi Otomatis**: Menampilkan jumlah hari pengerjaan
- **Preview**: Live preview project sebelum dibuat

### 4. ✏️ Edit Project
- **Modal Edit**: Form lengkap untuk edit project
- **Field yang Dapat Diedit**:
  - Nama project
  - Deskripsi
  - Divisi penanggung jawab
  - Timeline (start date & end date)
- **Info Display**: Menampilkan jumlah laporan terkait
- **Timeline Warning**: Peringatan jika mengubah timeline project yang sudah ada laporan
- **Preview**: Live preview perubahan

### 5. 🗑️ Hapus Project
- **Konfirmasi Ketat**: Harus ketik "HAPUS" untuk konfirmasi
- **Smart Validation**: Tidak bisa hapus jika ada laporan terkait
- **Warning System**: Peringatan jelas tentang konsekuensi
- **ADMIN Only**: Hanya ADMIN yang bisa menghapus

### 6. 🔄 Aktivasi/Deaktivasi Project
- **Toggle Status**: Aktifkan atau nonaktifkan project
- **Instant Update**: Status berubah langsung di UI
- **Impact**: Project nonaktif tidak muncul di dropdown laporan

## Timeline & Durasi Otomatis

### Perhitungan Durasi
- **Formula**: `Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))`
- **Tampilan**: "X hari pengerjaan" dengan highlight biru
- **Real-time**: Update otomatis saat mengubah tanggal
- **Validasi**: End date harus setelah start date

### Status Project Otomatis
```javascript
const getProjectStatus = (project) => {
  if (!project.isActive) return 'Non-Aktif'
  if (!project.startDate || !project.endDate) return 'Draft'
  
  const now = new Date()
  const start = new Date(project.startDate)
  const end = new Date(project.endDate)
  
  if (now < start) return 'Belum Dimulai'
  if (now > end) return 'Selesai'
  return 'Sedang Berjalan'
}
```

## Kontrol Akses Detail

### PM, HRD, CEO Permissions
- ✅ Lihat semua project
- ✅ Tambah project baru
- ✅ Edit project (nama, deskripsi, divisi, timeline)
- ✅ Aktivasi/deaktivasi project
- ❌ Hapus project

### ADMIN Permissions
- ✅ Lihat semua project
- ✅ Tambah project baru
- ✅ Edit project
- ✅ Aktivasi/deaktivasi project
- ✅ Hapus project (jika tidak ada laporan)

## API Endpoints

### 1. GET `/dashboard/admin/projects`
**Fungsi**: Halaman utama kelola project
**Response**: Render halaman dengan data project dan divisi

### 2. POST `/api/admin/projects/create`
**Fungsi**: Tambah project baru
```json
{
  "name": "Website Company Profile",
  "description": "Pembuatan website profil perusahaan dengan fitur modern",
  "divisionId": "uuid-divisi",
  "startDate": "2024-01-15",
  "endDate": "2024-03-15"
}
```

### 3. PUT `/api/admin/projects/update`
**Fungsi**: Update project
```json
{
  "projectId": "uuid",
  "name": "Website Company Profile Updated",
  "description": "Deskripsi baru",
  "divisionId": "uuid-divisi",
  "startDate": "2024-01-20",
  "endDate": "2024-03-20"
}
```

### 4. DELETE `/api/admin/projects/delete`
**Fungsi**: Hapus project (ADMIN only)
```json
{
  "projectId": "uuid"
}
```

### 5. PUT `/api/admin/projects/toggle`
**Fungsi**: Aktivasi/deaktivasi project
```json
{
  "projectId": "uuid",
  "isActive": true
}
```

## Validasi & Keamanan

### Validasi Business Logic
- **Nama Required**: Nama project wajib diisi
- **Divisi Active**: Hanya bisa assign ke divisi aktif
- **Timeline Logic**: End date harus setelah start date
- **Hapus Project**: Hanya bisa hapus jika tidak ada laporan
- **Divisi Validation**: Divisi harus exist dan aktif

### Keamanan
- **Session Verification**: Semua API memerlukan session valid
- **Role-based Access**: Kontrol akses berdasarkan role
- **Input Sanitization**: Trim whitespace, validasi input
- **Date Validation**: Validasi format dan logika tanggal

### Error Handling
- **User-friendly Messages**: Pesan error yang jelas
- **Validation Feedback**: Real-time validation di form
- **Loading States**: Indikator loading untuk UX yang baik
- **Transaction Safety**: Database consistency

## Format Tanggal

### Input Format
- **HTML Date Input**: YYYY-MM-DD
- **Database Storage**: ISO DateTime string
- **Display Format**: DD MMM YYYY (Indonesia)

### Contoh Implementasi
```javascript
// Format untuk display
const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

// Perhitungan durasi
const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return null
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}
```

## File Structure

### Pages & Components
```
app/dashboard/admin/projects/
├── page.tsx                      # Main page
├── ProjectManagementClient.tsx   # Main client component
├── CreateProjectModal.tsx        # Create project modal
├── EditProjectModal.tsx          # Edit project modal
└── DeleteProjectModal.tsx        # Delete confirmation modal
```

### API Routes
```
app/api/admin/projects/
├── create/route.ts               # POST - Create project
├── update/route.ts               # PUT - Update project
├── delete/route.ts               # DELETE - Delete project
└── toggle/route.ts               # PUT - Toggle status
```

## Cara Penggunaan

### 1. Akses Halaman
- Login sebagai PM/HRD/CEO/ADMIN
- Navigasi: Dashboard → Admin Panel → ⚙️ Kelola Project

### 2. Melihat Daftar Project
- Semua project ditampilkan dengan status otomatis
- Informasi timeline dan durasi pengerjaan
- Filter berdasarkan status atau divisi

### 3. Tambah Project Baru
- Klik tombol "Tambah Project"
- Isi nama project dan pilih divisi
- Tambahkan deskripsi (opsional)
- Set timeline untuk perhitungan durasi otomatis
- Lihat preview dan klik "Buat Project"

### 4. Edit Project
- Klik tombol "Edit" pada card project
- Ubah nama, deskripsi, divisi, atau timeline
- Perhatikan warning jika project sudah ada laporan
- Lihat preview perubahan dan klik "Simpan"

### 5. Hapus Project (ADMIN only)
- Pastikan project tidak memiliki laporan
- Klik tombol trash (merah)
- Baca peringatan dengan seksama
- Ketik "HAPUS" untuk konfirmasi

### 6. Aktivasi/Deaktivasi
- Klik "Aktifkan" atau "Nonaktif" pada card
- Status berubah langsung
- Project nonaktif tidak muncul di dropdown laporan

## Integrasi dengan Sistem Lain

### 1. **Report Management**
- Project muncul di dropdown saat buat laporan
- Counter laporan per project
- Prevent delete project yang memiliki laporan

### 2. **Division Management**
- Warna divisi konsisten di card project
- Hanya divisi aktif yang bisa dipilih
- Filter project berdasarkan divisi

### 3. **User Management**
- Role-based access untuk fitur project
- Tracking siapa yang membuat/edit project

## Keuntungan Fitur

### 1. **Timeline Otomatis**
- Perhitungan durasi pengerjaan otomatis
- Status project berdasarkan timeline
- Visual indicator untuk progress

### 2. **Smart Validation**
- Business logic yang ketat
- Prevent data inconsistency
- User-friendly error messages

### 3. **Integration Ready**
- Siap terintegrasi dengan report system
- Konsisten dengan division management
- Role-based access control

### 4. **User Experience**
- Interface yang intuitif dengan preview
- Real-time validation dan feedback
- Responsive design untuk mobile

## Status: ✅ READY FOR PRODUCTION

Fitur manajemen project lengkap sudah siap digunakan dengan:
- ✅ CRUD operations lengkap
- ✅ Timeline otomatis dengan durasi
- ✅ Status project otomatis
- ✅ Business logic validation
- ✅ Role-based access control
- ✅ Responsive UI/UX
- ✅ Integration ready
- ✅ API endpoints tested