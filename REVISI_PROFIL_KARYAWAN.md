# 🔄 Revisi Profil Karyawan - Implementation Plan

## 📋 Overview

Perubahan besar pada sistem profil karyawan dengan penambahan field baru, perubahan role names, dan support untuk multiple departments & divisions.

## 🎯 Goals

1. ✅ Tambah field baru: Status Karyawan, Alamat, Catatan
2. ✅ Hapus field: Posisi/Jabatan
3. ✅ Support multiple departments & divisions per user
4. ✅ Ubah role names: HRD → General Affair, KARYAWAN → Staff
5. ✅ Semua user bisa upload foto profil sendiri
6. ✅ Catatan hanya bisa diedit oleh Admin & General Affair

## 📊 Database Changes

### New Tables

**user_departments** (many-to-many)
```sql
- id: UUID (PK)
- user_id: UUID (FK → users)
- department_id: UUID (FK → departments)
- created_at: TIMESTAMP
```

**user_divisions** (many-to-many)
```sql
- id: UUID (PK)
- user_id: UUID (FK → users)
- division_id: UUID (FK → divisions)
- created_at: TIMESTAMP
```

### Updated Users Table

**New Columns:**
- `employee_status` TEXT - Status karyawan (diketik bebas)
- `address` TEXT - Alamat lengkap
- `notes` TEXT - Catatan (hanya Admin & General Affair yang edit)

**Removed Columns:**
- `position` - Dihapus (tidak digunakan lagi)

**Updated:**
- `divisionId` - Tetap ada untuk backward compatibility, tapi tidak digunakan

### Role Changes

| Old Role | New Role | Display Name |
|----------|----------|--------------|
| HRD | GENERAL_AFFAIR | General Affair |
| KARYAWAN | STAFF | Staff |
| ADMIN | ADMIN | Admin |
| CEO | CEO | CEO |
| PM | PM | Project Manager |

## 📝 Form Fields

### Create/Edit User (Admin & General Affair)

**Basic Info:**
1. Nama (text, required)
2. Email (email, required, unique)
3. Password (password, required on create)
4. No Telp (text, optional)
5. Status Karyawan (text, optional) - contoh: Tetap, Kontrak, Magang
6. Alamat (textarea, optional)

**System Info:**
7. Role (dropdown, required)
   - Admin
   - CEO
   - General Affair
   - Project Manager
   - Staff

8. Departments (multi-select, optional)
   - Bisa pilih lebih dari 1 department
   
9. Divisions (multi-select, optional)
   - Filtered by selected departments
   - Bisa pilih lebih dari 1 division
   - Contoh: User pilih 2 dept → bisa pilih 4 divisi dari 2 dept tersebut

10. Catatan (textarea, optional)
    - Hanya bisa diedit oleh Admin & General Affair
    - Semua admin bisa lihat

11. Foto Profil (upload, optional)
    - Semua user bisa upload foto sendiri

### Edit Profile (Staff/User Biasa)

**Yang bisa diedit:**
- ✅ Foto Profil ONLY

**Yang tidak bisa diedit:**
- ❌ Nama
- ❌ Email
- ❌ Password (harus request ke admin)
- ❌ No Telp
- ❌ Status Karyawan
- ❌ Alamat
- ❌ Role
- ❌ Departments
- ❌ Divisions
- ❌ Catatan

## 🔐 Permissions

### Create User
- ✅ Admin
- ✅ General Affair
- ❌ CEO
- ❌ PM
- ❌ Staff

### Edit User (Full)
- ✅ Admin (semua field)
- ✅ General Affair (semua field)
- ❌ CEO
- ❌ PM
- ❌ Staff

### Edit Profile (Self)
- ✅ Semua user (hanya foto profil)

### View User Details
- ✅ Admin (semua field termasuk catatan)
- ✅ General Affair (semua field termasuk catatan)
- ✅ CEO (semua field kecuali catatan)
- ✅ PM (semua field kecuali catatan)
- ✅ Staff (hanya profil sendiri, kecuali catatan)

### Edit Catatan
- ✅ Admin
- ✅ General Affair
- ❌ Others

## 🔄 Migration Strategy

### Data Lama

**Users dengan 1 divisi:**
- Otomatis migrate ke `user_divisions` table
- `divisionId` tetap ada tapi tidak digunakan

**Field position:**
- Tidak dimigrate (dihapus)
- Jika perlu, bisa dimasukkan ke notes manual

**Role names:**
- Otomatis update: HRD → GENERAL_AFFAIR, KARYAWAN → STAFF

## 📁 Files to Create/Modify

### Database
- ✅ `supabase/migrations/20240401000000_revisi_profil_karyawan.sql`

### Forms
- [ ] `app/dashboard/admin/users/create/CreateUserForm.tsx` - Update form
- [ ] `app/dashboard/admin/users/manage/EditUserModal.tsx` - Update form
- [ ] `app/dashboard/profile/page.tsx` - Profile page untuk user biasa

### API Endpoints
- [ ] `app/api/admin/users/create/route.ts` - Update untuk multiple depts/divs
- [ ] `app/api/admin/users/update/route.ts` - Update untuk multiple depts/divs
- [ ] `app/api/profile/update/route.ts` - Update foto profil only
- [ ] `app/api/admin/departments/route.ts` - Get departments list
- [ ] `app/api/admin/divisions/by-departments/route.ts` - Get divisions by departments

### Components
- [ ] Update semua role labels (HRD → General Affair, KARYAWAN → Staff)
- [ ] Update role badges
- [ ] Update permission checks

### Types
- [ ] Update TypeScript interfaces untuk User
- [ ] Add types untuk user_departments, user_divisions

## 🧪 Testing Checklist

### Create User
- [ ] Create user dengan 1 department, 1 division
- [ ] Create user dengan 2 departments, 4 divisions
- [ ] Create user tanpa department/division
- [ ] Validate required fields
- [ ] Test foto profil upload

### Edit User
- [ ] Edit user info (Admin)
- [ ] Edit user info (General Affair)
- [ ] Edit catatan (Admin)
- [ ] Edit catatan (General Affair)
- [ ] Add/remove departments
- [ ] Add/remove divisions
- [ ] Update foto profil

### Edit Profile (Self)
- [ ] Staff bisa upload foto profil
- [ ] Staff tidak bisa edit field lain
- [ ] PM bisa upload foto profil
- [ ] CEO bisa upload foto profil

### View User
- [ ] Admin bisa lihat semua field termasuk catatan
- [ ] General Affair bisa lihat semua field termasuk catatan
- [ ] CEO bisa lihat semua field kecuali catatan
- [ ] PM bisa lihat semua field kecuali catatan

### Migration
- [ ] Data lama ter-migrate dengan benar
- [ ] Role names ter-update
- [ ] Tidak ada data loss

## 📝 Implementation Steps

### Phase 1: Database (DONE ✅)
1. ✅ Create migration file
2. [ ] Run migration di Supabase
3. [ ] Verify tables created
4. [ ] Verify data migrated

### Phase 2: API Endpoints
1. [ ] Update create user API
2. [ ] Update update user API
3. [ ] Create profile update API
4. [ ] Create departments list API
5. [ ] Create divisions by departments API

### Phase 3: Forms & UI
1. [ ] Update CreateUserForm
2. [ ] Update EditUserModal
3. [ ] Create/Update ProfilePage
4. [ ] Update role labels everywhere
5. [ ] Update role badges

### Phase 4: Testing
1. [ ] Test create user
2. [ ] Test edit user
3. [ ] Test edit profile
4. [ ] Test permissions
5. [ ] Test migration

### Phase 5: Documentation
1. [ ] Update user guide
2. [ ] Update admin guide
3. [ ] Update API documentation

## ⚠️ Breaking Changes

1. **Role Names Changed**
   - Code yang hardcode 'HRD' atau 'KARYAWAN' perlu diupdate
   - Session checks perlu diupdate

2. **Division Relationship**
   - Tidak lagi menggunakan `users.divisionId`
   - Sekarang menggunakan `user_divisions` table

3. **Position Field Removed**
   - Code yang menggunakan `position` perlu dihapus

## 🚀 Deployment Steps

1. Backup database
2. Run migration
3. Deploy new code
4. Test thoroughly
5. Monitor for errors
6. Update documentation

---

**Status:** 🟡 In Progress
**Phase:** 1/5 (Database Migration Created)
**Next:** Run migration & create API endpoints
