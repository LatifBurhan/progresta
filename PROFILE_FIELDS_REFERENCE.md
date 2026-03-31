# Referensi Field Profil Karyawan

Dokumen ini menjelaskan semua field yang tersedia di sistem profil karyawan Al-Wustho.

## 📋 Daftar Field Lengkap

### 1. Informasi Personal

| Field | Nama Database | Tipe | Wajib | Keterangan |
|-------|---------------|------|-------|------------|
| **Foto Profil** | `fotoProfil` | String (URL) | ❌ | Upload JPG/PNG max 5MB, disimpan di Supabase Storage bucket `profile-photos` |
| **Nama Lengkap** | `name` | String | ✅ | Nama lengkap karyawan |
| **Email** | `email` | String | ✅ | Email unik untuk login, tidak boleh duplikat |
| **No. Telepon** | `phone` | String | ❌ | Nomor telepon karyawan (format: 08xxxxxxxxxx) |

### 2. Informasi Pekerjaan

| Field | Nama Database | Tipe | Wajib | Keterangan |
|-------|---------------|------|-------|------------|
| **Jabatan/Role** | `role` | Enum | ✅ | Pilihan: CEO, GENERAL_AFFAIR, PM, ADMIN, STAFF |
| **Status Karyawan** | `employee_status` | String | ❌ | Free text: "Tetap", "Kontrak", "Magang", "Freelance", dll |
| **Posisi/Jabatan** | `position` | String | ❌ | Untuk backward compatibility, tidak ditampilkan di UI |
| **Departemen** | `departmentId` | UUID | ✅ | Foreign key ke tabel `departments` |
| **Divisi** | `divisionId` | UUID | ✅ | Foreign key ke tabel `divisions` |
| **Alamat** | `address` | Text | ❌ | Alamat lengkap karyawan (text area) |

### 3. Informasi Sistem

| Field | Nama Database | Tipe | Wajib | Keterangan |
|-------|---------------|------|-------|------------|
| **Status Akun** | `status` | Enum | ✅ | ACTIVE, PENDING, INACTIVE (auto-generated) |
| **Catatan** | `notes` | Text | ❌ | Hanya Admin & General Affair yang bisa edit/lihat |
| **User ID** | `id` | UUID | ✅ | Auto-generated oleh sistem |
| **Tanggal Bergabung** | `createdAt` | Timestamp | ✅ | Auto-generated saat user dibuat |
| **Terakhir Diupdate** | `updatedAt` | Timestamp | ✅ | Auto-updated saat data berubah |

## 🔐 Hak Akses Edit Field

### STAFF (Karyawan Biasa)
- ✅ Foto Profil (upload/hapus)
- ❌ Semua field lainnya (read-only)

### PM (Project Manager)
- ✅ Foto Profil (upload/hapus)
- ❌ Semua field lainnya (read-only)

### GENERAL_AFFAIR
- ✅ Semua field kecuali:
  - ❌ Tidak bisa edit user dengan role CEO atau ADMIN
  - ✅ Bisa edit STAFF dan PM
  - ✅ Bisa lihat dan edit field "Catatan"

### CEO
- ✅ Semua field kecuali:
  - ❌ Tidak bisa edit user dengan role ADMIN
  - ✅ Bisa edit STAFF, PM, dan GENERAL_AFFAIR

### ADMIN (Super Admin)
- ✅ Semua field tanpa batasan
- ✅ Bisa edit semua role termasuk CEO
- ✅ Bisa lihat dan edit field "Catatan"

## 📍 Lokasi Field di UI

### Halaman Profil User (`/dashboard/profile`)
Menampilkan semua field milik user yang sedang login:
- Foto profil dengan upload/remove button
- Nama, email, phone
- Role, status akun, status karyawan
- Divisi, alamat
- User ID, tanggal bergabung

**Catatan:** Field "notes" TIDAK ditampilkan di halaman profil user (hanya admin yang bisa lihat di detail modal)

### Database Karyawan (`/dashboard/admin/users/manage`)
Tabel menampilkan:
- Foto profil (thumbnail)
- Nama & email
- Role & divisi
- Status akun (aktif/non-aktif)
- Progress harian
- Tombol aksi: Detail, Edit, Aktifkan/Nonaktifkan, Hapus

### Modal Detail User
Menampilkan semua field dalam format read-only:
- Foto profil (besar)
- Semua informasi kontak
- Semua informasi pekerjaan
- Field "Catatan" (hanya jika ada dan user adalah Admin/General Affair)

### Modal Edit User
Form edit dengan semua field yang bisa diedit sesuai hak akses:
- Informasi personal (nama, email, phone, posisi)
- Status karyawan (free text)
- Alamat (text area)
- Catatan (text area, dengan label "Admin Only")
- Departemen & divisi (dropdown)
- Role (radio buttons)
- Password (checkbox untuk enable, lalu input password)

## 🗄️ Struktur Database

### Tabel: `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  role Role NOT NULL DEFAULT 'STAFF',
  status Status NOT NULL DEFAULT 'PENDING',
  divisionId UUID REFERENCES divisions(id),
  
  -- New fields (Phase 1-5)
  name TEXT,
  phone TEXT,
  fotoProfil TEXT,
  employee_status TEXT,
  address TEXT,
  notes TEXT,
  
  -- Legacy field (backward compatibility)
  position TEXT,
  
  -- Timestamps
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

### Enum Types
```sql
CREATE TYPE Role AS ENUM (
  'STAFF',
  'PM', 
  'GENERAL_AFFAIR',
  'CEO',
  'ADMIN'
);

CREATE TYPE Status AS ENUM (
  'ACTIVE',
  'PENDING',
  'INACTIVE'
);
```

## 📝 Validasi Field

### Email
- Format: valid email address
- Unique: tidak boleh duplikat
- Required: wajib diisi

### Password (saat create/update)
- Minimal: 6 karakter
- Optional saat update (hanya jika checkbox "Ubah Password" dicentang)

### Foto Profil
- Format: JPG, JPEG, PNG
- Ukuran maksimal: 5MB
- Disimpan di: Supabase Storage bucket `profile-photos`
- Path format: `profile-photos/{userId}-{timestamp}.{ext}`

### Status Karyawan
- Free text input (bukan dropdown)
- Contoh nilai: "Tetap", "Kontrak", "Magang", "Freelance"
- Optional

### Catatan
- Text area
- Hanya Admin dan General Affair yang bisa edit/lihat
- Optional
- Untuk catatan internal tentang karyawan

## 🔄 API Endpoints

### GET `/api/users/[id]`
Mengambil data user lengkap termasuk foto profil dan semua field baru.

### PUT `/api/admin/users/update`
Update data user dengan validasi hak akses.

**Request Body:**
```json
{
  "userId": "uuid",
  "email": "string",
  "name": "string",
  "phone": "string",
  "position": "string",
  "employee_status": "string",
  "address": "string",
  "notes": "string",
  "role": "STAFF|PM|GENERAL_AFFAIR|CEO|ADMIN",
  "divisionId": "uuid",
  "password": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User berhasil diupdate",
  "user": {
    "id": "uuid",
    "email": "string",
    "role": "string",
    "status": "string",
    "divisionId": "uuid",
    "employee_status": "string",
    "address": "string",
    "notes": "string",
    "createdAt": "timestamp",
    "updatedAt": "timestamp",
    "division": {
      "name": "string",
      "color": "string"
    },
    "profile": {
      "name": "string",
      "phone": "string",
      "position": "string",
      "fotoProfil": "string"
    }
  }
}
```

### POST `/api/profile/photo/upload`
Upload foto profil user yang sedang login.

### DELETE `/api/profile/photo/remove`
Hapus foto profil user yang sedang login.

## 🐛 Troubleshooting

### Issue: Data kosong setelah edit
**Penyebab:** API tidak mengembalikan semua field yang diupdate
**Solusi:** Sudah diperbaiki - API sekarang mengembalikan semua field termasuk `employee_status`, `address`, `notes`, dan `fotoProfil`

### Issue: Foto hilang setelah refresh
**Penyebab:** API `/api/users/[id]` tidak mengembalikan field `fotoProfil`
**Solusi:** Sudah diperbaiki - API sekarang include `fotoProfil` dalam response

### Issue: Column "created_at" does not exist
**Penyebab:** Database menggunakan camelCase (`createdAt`) bukan snake_case
**Solusi:** Gunakan `createdAt` di semua query, bukan `created_at`

## 📚 Dokumentasi Terkait

- `PROFILE_REVISION_PHASE_1_TO_5_COMPLETE.md` - Dokumentasi lengkap implementasi Phase 1-5
- `PROFILE_PHOTO_UPLOAD_IMPLEMENTATION.md` - Detail implementasi upload foto
- `CARA_DEPLOY_PROFILE_REVISION.md` - Panduan deployment ke production
