# Fitur Kelola Divisi Lengkap

## Overview
Fitur lengkap untuk HRD, CEO, dan ADMIN dalam mengelola divisi perusahaan dengan kemampuan menambah, mengedit, menghapus, dan mengatur status divisi.

## Akses & Permissions

### Role yang Dapat Mengakses
- **HRD**: Dapat menambah, edit, aktivasi/deaktivasi divisi
- **CEO**: Dapat menambah, edit, aktivasi/deaktivasi divisi
- **ADMIN**: Full access termasuk hapus divisi

### URL & Navigasi
- **URL**: `/dashboard/admin/divisions`
- **Navigasi**: Dashboard → Admin Panel → ⚙️ Kelola Divisi

## Fitur Utama

### 1. 📋 Daftar Divisi
- **Grid Layout**: Tampilan card yang responsif dengan warna divisi
- **Informasi Lengkap**: Nama, deskripsi, status, jumlah karyawan, jumlah project
- **Color Coding**: Setiap divisi memiliki warna identitas visual
- **Badge System**: Status aktif/nonaktif dengan warna yang berbeda
- **Statistics**: Counter karyawan dan project per divisi

### 2. 🔍 Filter & Pencarian
- **Search Bar**: Cari berdasarkan nama atau deskripsi divisi
- **Filter Status**: Semua, Aktif, Non-Aktif
- **Real-time Filtering**: Filter langsung tanpa reload

### 3. ➕ Tambah Divisi Baru
- **Modal Create**: Form lengkap untuk divisi baru
- **Field yang Diperlukan**:
  - Nama divisi (wajib, unique)
  - Deskripsi (opsional)
  - Warna divisi (pilihan 10 warna preset)
- **Preview**: Live preview divisi sebelum dibuat
- **Validasi**: Nama unique, tidak boleh kosong

### 4. ✏️ Edit Divisi
- **Modal Edit**: Form lengkap untuk edit divisi
- **Field yang Dapat Diedit**:
  - Nama divisi (dengan validasi unique)
  - Deskripsi
  - Warna divisi
- **Info Display**: Menampilkan jumlah karyawan dan project
- **Preview**: Live preview perubahan

### 5. 🗑️ Hapus Divisi
- **Konfirmasi Ketat**: Harus ketik "HAPUS" untuk konfirmasi
- **Smart Validation**: Tidak bisa hapus jika ada karyawan/project
- **Warning System**: Peringatan jelas tentang konsekuensi
- **ADMIN Only**: Hanya ADMIN yang bisa menghapus

### 6. 🔄 Aktivasi/Deaktivasi Divisi
- **Toggle Status**: Aktifkan atau nonaktifkan divisi
- **Smart Validation**: Tidak bisa nonaktif jika ada karyawan aktif
- **Instant Update**: Status berubah langsung di UI

## Kontrol Akses Detail

### HRD & CEO Permissions
- ✅ Lihat semua divisi
- ✅ Tambah divisi baru
- ✅ Edit divisi (nama, deskripsi, warna)
- ✅ Aktivasi/deaktivasi divisi (dengan validasi)
- ❌ Hapus divisi

### ADMIN Permissions
- ✅ Lihat semua divisi
- ✅ Tambah divisi baru
- ✅ Edit divisi
- ✅ Aktivasi/deaktivasi divisi
- ✅ Hapus divisi (jika tidak ada karyawan/project)

## API Endpoints

### 1. GET `/dashboard/admin/divisions`
**Fungsi**: Halaman utama kelola divisi
**Response**: Render halaman dengan data divisi dan statistik

### 2. POST `/api/admin/divisions/create`
**Fungsi**: Tambah divisi baru
```json
{
  "name": "IT Development",
  "description": "Divisi pengembangan teknologi informasi",
  "color": "#3B82F6"
}
```

### 3. PUT `/api/admin/divisions/update`
**Fungsi**: Update divisi
```json
{
  "divisionId": "uuid",
  "name": "IT Development Updated",
  "description": "Deskripsi baru",
  "color": "#10B981"
}
```

### 4. DELETE `/api/admin/divisions/delete`
**Fungsi**: Hapus divisi (ADMIN only)
```json
{
  "divisionId": "uuid"
}
```

### 5. PUT `/api/admin/divisions/toggle`
**Fungsi**: Aktivasi/deaktivasi divisi
```json
{
  "divisionId": "uuid",
  "isActive": true
}
```

## Validasi & Keamanan

### Validasi Business Logic
- **Nama Unique**: Tidak boleh ada divisi dengan nama sama
- **Hapus Divisi**: Hanya bisa hapus jika tidak ada karyawan/project
- **Deaktivasi**: Tidak bisa nonaktif jika ada karyawan aktif
- **Nama Required**: Nama divisi wajib diisi

### Keamanan
- **Session Verification**: Semua API memerlukan session valid
- **Role-based Access**: Kontrol akses berdasarkan role
- **Input Sanitization**: Trim whitespace, validasi input
- **SQL Injection Protection**: Menggunakan Prisma ORM

### Error Handling
- **User-friendly Messages**: Pesan error yang jelas
- **Validation Feedback**: Real-time validation di form
- **Loading States**: Indikator loading untuk UX yang baik
- **Rollback Protection**: Transaction safety

## Color System

### Preset Colors
1. **Biru** (#3B82F6) - Default
2. **Hijau** (#10B981) - Success/Growth
3. **Ungu** (#8B5CF6) - Creative/Innovation
4. **Merah** (#EF4444) - Important/Critical
5. **Orange** (#F59E0B) - Energy/Marketing
6. **Pink** (#EC4899) - Design/Creative
7. **Indigo** (#6366F1) - Technology
8. **Teal** (#14B8A6) - Support/Service
9. **Gray** (#6B7280) - Operations
10. **Emerald** (#059669) - Finance/Growth

## File Structure

### Pages & Components
```
app/dashboard/admin/divisions/
├── page.tsx                      # Main page
├── DivisionManagementClient.tsx  # Main client component
├── CreateDivisionModal.tsx       # Create division modal
├── EditDivisionModal.tsx         # Edit division modal
└── DeleteDivisionModal.tsx       # Delete confirmation modal
```

### API Routes
```
app/api/admin/divisions/
├── create/route.ts               # POST - Create division
├── update/route.ts               # PUT - Update division
├── delete/route.ts               # DELETE - Delete division
└── toggle/route.ts               # PUT - Toggle status
```

## Cara Penggunaan

### 1. Akses Halaman
- Login sebagai HRD/CEO/ADMIN
- Navigasi: Dashboard → Admin Panel → ⚙️ Kelola Divisi

### 2. Melihat Daftar Divisi
- Semua divisi ditampilkan dalam grid card dengan warna
- Informasi lengkap: nama, deskripsi, status, statistik
- Gunakan search bar untuk mencari divisi

### 3. Tambah Divisi Baru
- Klik tombol "Tambah Divisi"
- Isi nama divisi (wajib)
- Tambahkan deskripsi (opsional)
- Pilih warna dari 10 preset
- Lihat preview dan klik "Buat Divisi"

### 4. Edit Divisi
- Klik tombol "Edit" pada card divisi
- Ubah nama, deskripsi, atau warna
- Lihat preview perubahan
- Klik "Simpan Perubahan"

### 5. Hapus Divisi (ADMIN only)
- Pastikan divisi tidak memiliki karyawan/project
- Klik tombol trash (merah)
- Baca peringatan dengan seksama
- Ketik "HAPUS" untuk konfirmasi
- Klik "Hapus Divisi"

### 6. Aktivasi/Deaktivasi
- Klik "Aktifkan" atau "Nonaktif" pada card
- Sistem akan validasi otomatis
- Status berubah langsung jika valid

## Integrasi dengan Sistem Lain

### 1. **User Management**
- Dropdown divisi di form create/edit user
- Validasi divisi aktif saat assign user
- Prevent delete divisi yang memiliki user

### 2. **Project Management**
- Divisi terkait dengan project
- Prevent delete divisi yang memiliki project
- Color coding konsisten di seluruh sistem

### 3. **Reporting**
- Statistik per divisi
- Filter laporan berdasarkan divisi
- Dashboard analytics per divisi

## Keuntungan Fitur

### 1. **Organisasi yang Jelas**
- Struktur divisi yang terorganisir
- Visual identity dengan color coding
- Statistik real-time per divisi

### 2. **Keamanan Data**
- Validasi business logic yang ketat
- Prevent data inconsistency
- Role-based access control

### 3. **User Experience**
- Interface yang intuitif
- Real-time preview dan validation
- Responsive design untuk mobile

### 4. **Maintainability**
- Modular component structure
- Consistent API patterns
- Type safety dengan TypeScript

## Status: ✅ READY FOR PRODUCTION

Fitur kelola divisi lengkap sudah siap digunakan dengan:
- ✅ CRUD operations lengkap
- ✅ Business logic validation
- ✅ Role-based access control
- ✅ Color system yang konsisten
- ✅ Responsive UI/UX
- ✅ Error handling yang baik
- ✅ API endpoints tested
- ✅ Integration ready