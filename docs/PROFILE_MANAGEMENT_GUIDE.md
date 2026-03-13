# 👤 Profile Management - User Guide

## Overview
Halaman Profile di Progresta menampilkan informasi lengkap tentang akun pengguna, termasuk role, status, divisi, dan memungkinkan pengguna untuk mengelola informasi personal mereka.

## 🎯 Fitur Utama

### 1. **Informasi Akun Lengkap**
Menampilkan detail akun dengan visual yang jelas:

```
📧 Email: user@alwustho.com
👑 Role: CEO - Chief Executive Officer
✅ Status: ACTIVE - Akun aktif dan dapat menggunakan semua fitur
🏢 Divisi: Frontend - Tim pengembangan antarmuka pengguna
📅 Bergabung Sejak: Jumat, 13 Maret 2026
```

### 2. **Role-Based Information**
Setiap role memiliki informasi dan akses yang berbeda:

#### **CEO (👑)**
- **Label**: Chief Executive Officer
- **Deskripsi**: Akses penuh ke semua divisi dan dashboard perusahaan
- **Warna**: Purple badge
- **Akses**: Semua fitur, semua divisi, analytics perusahaan

#### **HRD (👥)**
- **Label**: Human Resource Development
- **Deskripsi**: Mengelola karyawan, approval akun, dan monitoring produktivitas
- **Warna**: Blue badge
- **Akses**: User management, approval workflow, semua divisi

#### **PM (📊)**
- **Label**: Project Manager
- **Deskripsi**: Monitoring project, kendala tim, dan koordinasi antar divisi
- **Warna**: Green badge
- **Akses**: Project monitoring, issue tracking, semua divisi

#### **ADMIN (⚙️)**
- **Label**: Administrator
- **Deskripsi**: Akses penuh sistem untuk maintenance dan konfigurasi
- **Warna**: Red badge
- **Akses**: System administration, semua fitur

#### **KA
RYAWAN (👨‍💻)**
- **Label**: Karyawan
- **Deskripsi**: Melaporkan progres kerja dan melihat feed divisi
- **Warna**: Gray badge
- **Akses**: Reporting, division feed, own profile

### 3. **Status Account**
Menampilkan status akun dengan indikator visual:

#### **ACTIVE (✅)**
- **Warna**: Green badge
- **Deskripsi**: Akun aktif dan dapat menggunakan semua fitur
- **Akses**: Full access sesuai role

#### **PENDING (⏳)**
- **Warna**: Yellow badge
- **Deskripsi**: Akun menunggu persetujuan dari HRD/Admin
- **Akses**: Limited, menunggu approval

#### **INACTIVE (❌)**
- **Warna**: Red badge
- **Deskripsi**: Akun dinonaktifkan, hubungi HRD untuk aktivasi
- **Akses**: No access, contact HRD

### 4. **Profile Management**
Pengguna dapat mengelola informasi personal:

#### **Foto Profil**
- **Upload**: JPEG, PNG, WebP, GIF (max 2MB)
- **Preview**: Real-time preview sebelum save
- **Compression**: Otomatis dikompres untuk performa
- **Delete**: Hapus foto dengan konfirmasi

#### **Informasi Personal**
- **Nama Lengkap**: Nama yang ditampilkan di sistem
- **Nomor Telepon**: Kontak untuk komunikasi
- **Jabatan**: Posisi/title dalam perusahaan
- **Email**: Read-only, tidak bisa diubah

## 📱 UI Components

### Account Information Card
```
┌─────────────────────────────────────────────────┐
│ 🛡️ Informasi Akun                              │
│                                                 │
│ 📧 Email                                        │
│ user@alwustho.com                              │
│                                                 │
│ 👤 Role & Akses                                │
│ [👑 CEO] Chief Executive Officer               │
│ Akses penuh ke semua divisi dan dashboard      │
│                                                 │
│ ✅ Status Akun                                 │
│ [ACTIVE] Akun aktif dan dapat menggunakan      │
│ semua fitur                                     │
│                                                 │
│ 🏢 Divisi                                      │
│ [Frontend] Tim pengembangan antarmuka          │
│                                                 │
│ 📅 Bergabung Sejak                            │
│ Jumat, 13 Maret 2026                          │
└─────────────────────────────────────────────────┘
```

### Profile Form Card
```
┌─────────────────────────────────────────────────┐
│ 👤 Informasi Profile                           │
│                                                 │
│ Status Akun Saat Ini                          │
│ [👑 CEO] [✅ ACTIVE]                           │
│                                                 │
│        ┌─────────────┐                         │
│        │   [Photo]   │                         │
│        │  or Avatar  │                         │
│        └─────────────┘                         │
│         [📷 Ganti Foto]                        │
│                                                 │
│ Email: user@alwustho.com [disabled]            │
│ Nama Lengkap: [input field]                   │
│ 📞 Nomor Telepon: [input field]               │
│ 💼 Jabatan: [input field]                     │
│                                                 │
│         [Simpan Profile]                       │
└─────────────────────────────────────────────────┘
```

## 🔐 Security Features

### Role-Based Access Control
- **Visual Indicators**: Role badges dengan warna dan icon
- **Permission Display**: Deskripsi akses yang jelas
- **Status Validation**: Real-time status checking

### Data Protection
- **Email Protection**: Email tidak bisa diubah
- **Session Validation**: Setiap request divalidasi
- **File Upload Security**: Validasi tipe dan ukuran file

## 📊 Header Integration

### Navigation Header
Role ditampilkan di header dengan badge berwarna:

```
┌─────────────────────────────────────────────────┐
│ ☰ Dashboard    [Avatar] user@email.com    Logout│
│                        [👑 CEO]                 │
└─────────────────────────────────────────────────┘
```

### Mobile Header
Pada mobile, role tetap terlihat dengan responsive design:

```
┌─────────────────────────────────────────────────┐
│ ☰  Dashboard                    [Avatar] Logout │
│                                 [👑 CEO]        │
└─────────────────────────────────────────────────┘
```

## 🎨 Visual Design

### Color Coding
- **CEO**: Purple (#8B5CF6) - Authority, leadership
- **HRD**: Blue (#3B82F6) - Trust, management
- **PM**: Green (#10B981) - Growth, coordination
- **ADMIN**: Red (#EF4444) - Power, system control
- **KARYAWAN**: Gray (#6B7280) - Standard, employee

### Badge Styling
```css
.role-badge {
  padding: 4px 12px;
  border-radius: 9999px;
  font-weight: 500;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.status-active { background: #DCFCE7; color: #166534; }
.status-pending { background: #FEF3C7; color: #92400E; }
.status-inactive { background: #FEE2E2; color: #991B1B; }
```

## 🔄 API Integration

### Profile Update Endpoint
```javascript
PUT /api/profile/update
{
  "name": "John Doe",
  "phone": "+62 812-3456-7890",
  "position": "Senior Frontend Developer"
}
```

### Photo Upload Endpoint
```javascript
POST /api/profile/upload
FormData: { file: [image file] }
```

### Response Format
```json
{
  "success": true,
  "message": "Profile berhasil diperbarui",
  "profile": {
    "id": "uuid",
    "name": "John Doe",
    "phone": "+62 812-3456-7890",
    "position": "Senior Frontend Developer",
    "fotoProfil": "https://storage.url/photo.jpg"
  }
}
```

## 📱 Mobile Optimization

### Responsive Design
- **Breakpoints**: sm (640px), md (768px), lg (1024px)
- **Touch Targets**: Minimum 44px untuk buttons
- **Image Sizing**: Responsive avatar sizes
- **Form Layout**: Stack pada mobile, side-by-side pada desktop

### Performance
- **Image Compression**: Otomatis resize dan compress
- **Lazy Loading**: Images loaded on demand
- **Caching**: Profile data cached untuk performa

## 🎯 Usage Scenarios

### First Time Setup
1. **Login** dengan akun baru
2. **Check Role** di profile page
3. **Complete Profile** dengan foto dan informasi
4. **Verify Access** sesuai role yang diberikan

### Regular Updates
1. **Update Photo** saat diperlukan
2. **Update Contact** info jika berubah
3. **Check Status** jika ada masalah akses
4. **Verify Role** untuk memahami permission

### Troubleshooting
1. **Status PENDING**: Hubungi HRD untuk approval
2. **Status INACTIVE**: Hubungi HRD untuk aktivasi
3. **Wrong Role**: Hubungi HRD untuk perubahan role
4. **Missing Division**: Hubungi HRD untuk assignment

## 🔧 Admin Features

### For HRD/Admin
- **View All Profiles**: Access semua profile karyawan
- **Change Status**: Activate/deactivate accounts
- **Assign Roles**: Update user roles
- **Manage Divisions**: Assign users to divisions

### Bulk Operations
- **Mass Approval**: Approve multiple pending accounts
- **Role Updates**: Batch role changes
- **Status Changes**: Bulk activate/deactivate

---

**Profile Management siap digunakan! 🎉**

Akses melalui: Dashboard → Profile (sidebar navigation)