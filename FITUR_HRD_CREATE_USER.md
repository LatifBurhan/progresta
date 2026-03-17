# Fitur HRD - Tambah User dengan Role dan Divisi

## Overview
Fitur ini memungkinkan HRD, CEO, dan ADMIN untuk menambah user baru secara langsung dengan memilih role dan divisi, tanpa perlu menunggu proses registrasi dan approval.

## Akses
- **Role yang dapat mengakses**: HRD, CEO, ADMIN
- **URL**: `/dashboard/admin/users/create`
- **Navigasi**: Dashboard → Admin Panel → Manajemen User → ➕ Tambah User

## Update Path
Karena ada konflik dengan admin layout authentication, halaman create user dipindahkan ke dalam dashboard layout:
- **Path Lama**: `/admin/users/create` (bermasalah dengan authentication)
- **Path Baru**: `/dashboard/admin/users/create` (menggunakan dashboard layout yang stabil)

## Fitur Utama

### 1. Form Tambah User
- **Email**: Email unik untuk login
- **Password**: Password minimal 6 karakter (dengan toggle show/hide)
- **Nama Lengkap**: Nama lengkap karyawan
- **No. Telepon**: Opsional
- **Posisi/Jabatan**: Opsional

### 2. Pemilihan Role
- **👨‍💻 Karyawan**: Akses standar untuk pelaporan
- **📊 Project Manager**: Monitoring project dan tim
- **👥 HRD**: Manajemen karyawan dan approval
- **👑 CEO**: Akses penuh ke semua data

### 3. Pemilihan Divisi
- Dropdown dengan semua divisi aktif
- Wajib dipilih saat membuat user

## Keamanan & Validasi

### Validasi Form
- Email harus valid dan unik
- Password minimal 6 karakter
- Nama lengkap wajib diisi
- Role dan divisi wajib dipilih

### Kontrol Akses
- Hanya HRD, CEO, ADMIN yang dapat mengakses
- ADMIN tidak dapat dibuat oleh non-ADMIN
- Password di-hash menggunakan bcryptjs

### Status User
- User yang dibuat langsung berstatus **ACTIVE**
- Tidak perlu proses approval seperti self-registration

## API Endpoint

### POST `/api/admin/users/create`
```json
{
  "email": "user@company.com",
  "password": "password123",
  "name": "Nama Lengkap",
  "phone": "08123456789",
  "position": "Frontend Developer",
  "role": "KARYAWAN",
  "divisionId": "uuid-divisi"
}
```

**Response Success:**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "email": "user@company.com",
    "role": "KARYAWAN",
    "status": "ACTIVE",
    "profile": {
      "name": "Nama Lengkap",
      "phone": "08123456789",
      "position": "Frontend Developer"
    },
    "division": {
      "name": "IT Development",
      "color": "#3B82F6"
    }
  }
}
```

## File yang Dibuat/Dimodifikasi

### File Baru
1. `app/admin/users/CreateUserModal.tsx` - Modal component untuk create user
2. `app/admin/users/CreateUserForm.tsx` - Form component untuk create user (versi lama)
3. `app/admin/users/create/page.tsx` - Halaman create user (versi lama)
4. `app/dashboard/admin/users/create/page.tsx` - Halaman create user (versi baru)
5. `app/dashboard/admin/users/create/CreateUserForm.tsx` - Form component (versi baru)
6. `app/api/admin/users/create/route.ts` - API endpoint untuk create user

### File yang Dimodifikasi
1. `app/admin/users/UserManagement.tsx` - Tambah tombol "Tambah User"
2. `app/dashboard/ResponsiveLayout.tsx` - Tambah submenu "➕ Tambah User"

## Cara Penggunaan

1. **Login sebagai HRD/CEO/ADMIN**
2. **Navigasi ke Admin Panel**
   - Dashboard → Admin Panel → Manajemen User
3. **Klik tombol "Tambah User"** atau navigasi ke submenu "➕ Tambah User"
4. **Isi form dengan data lengkap**:
   - Email dan password (wajib)
   - Nama lengkap (wajib)
   - Phone dan position (opsional)
   - Pilih role yang sesuai
   - Pilih divisi
5. **Klik "Buat User"**
6. **User langsung aktif** dan bisa login

## Keuntungan Fitur Ini

1. **Efisiensi**: HRD tidak perlu menunggu user registrasi sendiri
2. **Kontrol Penuh**: HRD bisa langsung menentukan role dan divisi
3. **Keamanan**: Validasi ketat dan kontrol akses yang tepat
4. **User Experience**: Interface yang intuitif dan mudah digunakan
5. **Integrasi**: Terintegrasi dengan sistem manajemen user yang sudah ada

## Catatan Penting

- User yang dibuat melalui fitur ini langsung berstatus ACTIVE
- Password akan di-hash secara otomatis untuk keamanan
- Email harus unik di seluruh sistem
- Hanya role yang sesuai yang dapat mengakses fitur ini
- Divisi harus aktif untuk bisa dipilih