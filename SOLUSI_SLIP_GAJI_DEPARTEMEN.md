# Solusi: Slip Gaji Salah Departemen

## Masalah
User dari departemen Ufuk menerima slip gaji yang dibuat oleh admin Al-Wustho. Seharusnya admin hanya bisa membuat slip gaji untuk karyawan di departemen mereka sendiri.

## Penyebab
1. Sistem saat ini tidak membatasi admin berdasarkan departemen
2. Admin bisa melihat dan memilih SEMUA karyawan aktif, tidak peduli departemen
3. Tidak ada validasi di backend untuk memastikan admin hanya membuat slip untuk departemen mereka

## Solusi yang Direkomendasikan

### Opsi 1: Batasi Admin per Departemen (RECOMMENDED)

**Implementasi:**
1. Tambah field `department_id` di session/context admin
2. Filter `initialEmployees` hanya dari departemen admin
3. Validasi di API bulk create: cek apakah semua `user_ids` ada di departemen admin
4. Default filter departemen ke departemen admin (tidak bisa diubah)

**Kelebihan:**
- Lebih aman, tidak ada kesalahan departemen
- Setiap departemen manage sendiri
- Clear separation of concerns

**Kekurangan:**
- Admin tidak bisa bantu departemen lain
- Perlu super admin jika ada kebutuhan cross-department

### Opsi 2: Warning System (ALTERNATIVE)

**Implementasi:**
1. Tampilkan semua karyawan seperti sekarang
2. Beri badge/warning jika karyawan beda departemen
3. Konfirmasi sebelum generate slip untuk karyawan beda departemen
4. Log activity untuk audit

**Kelebihan:**
- Fleksibel, admin bisa bantu departemen lain
- Tetap ada kontrol dan warning

**Kekurangan:**
- Masih bisa terjadi kesalahan human error
- Perlu UI tambahan untuk warning

## Implementasi Opsi 1 (Step by Step)

### Step 1: Tambah Helper untuk Get Admin Department

```typescript
// lib/payslip/department.ts
export async function getAdminDepartment(userId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('user_departments')
    .select('department_id')
    .eq('user_id', userId)
    .maybeSingle()
  
  return data?.department_id || null
}
```

### Step 2: Update Page untuk Filter Employees

```typescript
// app/dashboard/admin/payslips/page.tsx
const adminDepartmentId = await getAdminDepartment(session.userId)

let employeesQuery = supabaseAdmin
  .from('users')
  .select('id, name, email, role, employee_status')
  .eq('status', 'ACTIVE')

if (adminDepartmentId) {
  // Filter hanya karyawan dari departemen admin
  const { data: userIds } = await supabaseAdmin
    .from('user_departments')
    .select('user_id')
    .eq('department_id', adminDepartmentId)
  
  const ids = (userIds ?? []).map(r => r.user_id)
  employeesQuery = employeesQuery.in('id', ids)
}

const { data: employees } = await employeesQuery.order('name')
```

### Step 3: Update Client untuk Lock Department Filter

```typescript
// PayslipAdminClient.tsx
// Set default departemenId ke departemen admin
// Disable dropdown jika bukan super admin
```

### Step 4: Validasi di API Bulk

```typescript
// app/api/admin/payslips/bulk/route.ts
// Tambah validasi:
const adminDepartmentId = await getAdminDepartment(session.userId)

if (adminDepartmentId) {
  // Cek apakah semua user_ids ada di departemen admin
  const { data: userDepts } = await supabaseAdmin
    .from('user_departments')
    .select('user_id')
    .eq('department_id', adminDepartmentId)
    .in('user_id', user_ids)
  
  const validUserIds = new Set(userDepts?.map(d => d.user_id) || [])
  const invalidUsers = user_ids.filter(id => !validUserIds.has(id))
  
  if (invalidUsers.length > 0) {
    return payslipError('FORBIDDEN', 
      'Anda tidak bisa membuat slip gaji untuk karyawan di luar departemen Anda', 
      403
    )
  }
}
```

## Quick Fix (Temporary)

Jika tidak bisa implement full solution sekarang, lakukan ini:

1. **Cek data yang salah:**
   ```sql
   -- Jalankan CHECK_USER_DEPARTMENT.sql
   ```

2. **Hapus slip gaji yang salah:**
   ```sql
   -- Hapus slip gaji yang salah departemen
   DELETE FROM payslips 
   WHERE id IN (
     -- ID slip gaji yang salah
   );
   ```

3. **Edukasi admin:**
   - Pastikan admin hanya pilih karyawan dari departemen mereka
   - Gunakan filter departemen sebelum bulk generate

## Testing

### Test 1: Admin Ufuk
1. Login sebagai admin dari departemen Ufuk
2. Buka "Kelola Slip Gaji & Cuti"
3. Pilih departemen "Ufuk" di filter
4. Hanya karyawan Ufuk yang muncul
5. Generate slip gaji
6. Verifikasi: Hanya karyawan Ufuk yang dapat slip

### Test 2: Admin Al-Wustho
1. Login sebagai admin dari departemen Al-Wustho
2. Buka "Kelola Slip Gaji & Cuti"
3. Pilih departemen "Al-Wustho" di filter
4. Hanya karyawan Al-Wustho yang muncul
5. Generate slip gaji
6. Verifikasi: Hanya karyawan Al-Wustho yang dapat slip

## Rekomendasi

Saya sarankan implement **Opsi 1** dengan langkah-langkah di atas. Ini akan memastikan:
- Tidak ada lagi slip gaji salah departemen
- Setiap departemen manage sendiri
- Lebih aman dan terstruktur

Apakah Anda ingin saya implement Opsi 1 sekarang?
