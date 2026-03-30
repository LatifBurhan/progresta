# Fitur Hapus User Permanen

## Overview

Fitur ini memungkinkan ADMIN untuk menghapus user secara permanen dari sistem (bukan hanya menonaktifkan).

## Implementasi

### 1. API Endpoint

**File**: `template/app/api/admin/users/delete/route.ts`

**Method**: `DELETE`

**Authorization**: Hanya role `ADMIN` yang dapat menghapus user

**Request Body**:
```json
{
  "userId": "uuid-user-id"
}
```

**Response Success**:
```json
{
  "success": true,
  "message": "User berhasil dihapus secara permanen"
}
```

**Response Error**:
```json
{
  "success": false,
  "message": "Error message"
}
```

**Validasi**:
- User ID wajib diisi
- User harus ada di database
- User tidak bisa menghapus dirinya sendiri
- Hanya ADMIN yang bisa menghapus user

**Proses Penghapusan**:
1. Validasi session dan role (harus ADMIN)
2. Cek apakah user exists di database
3. Cek apakah user mencoba menghapus dirinya sendiri (tidak diizinkan)
4. Hapus user dari Supabase Auth (sistem autentikasi)
5. Hapus user dari database (tabel users)
6. Return success response

**Catatan Penting**:
- User dihapus dari Supabase Auth terlebih dahulu
- Jika gagal hapus dari Auth, proses dihentikan dan error dikembalikan
- Laporan yang dibuat user TIDAK ikut terhapus (tetap ada di sistem)
- Menggunakan Supabase direct query (bukan Prisma) untuk menghindari schema issues

### 2. Delete User Modal

**File**: `template/app/dashboard/admin/users/manage/DeleteUserModal.tsx`

**Features**:
- Modal konfirmasi dengan warning kritis
- Menampilkan detail user yang akan dihapus (nama, email, role, divisi)
- Input konfirmasi: user harus ketik "HAPUS" untuk mengkonfirmasi
- Loading state saat proses penghapusan
- Error handling dengan pesan yang jelas
- Design modern dengan Tailwind CSS

**Props**:
```typescript
interface DeleteUserModalProps {
  open: boolean
  user: UserData | null
  onClose: () => void
  onSuccess: (userId: string) => void
}
```

**User Experience**:
1. Admin klik tombol hapus (ikon Trash2) di user list
2. Modal muncul dengan warning kritis berwarna merah
3. Menampilkan info user yang akan dihapus
4. Admin harus ketik "HAPUS" (case-insensitive) untuk enable tombol hapus
5. Klik tombol "Hapus Permanen"
6. Loading state ditampilkan
7. Jika sukses: modal tertutup, user dihapus dari list
8. Jika error: pesan error ditampilkan di modal

**Warning Messages**:
- User akan dihapus dari sistem autentikasi dan database
- Profil, akses, dan data personal akan hilang permanen
- Laporan yang dibuat user akan tetap ada (tidak terhapus)
- Tindakan ini tidak dapat dibatalkan

### 3. User Management Client

**File**: `template/app/dashboard/admin/users/manage/UserManagementClient.tsx`

**Changes**:
- Tombol hapus (Trash2 icon) sudah ada di action column
- Tombol hapus hanya muncul jika `canDeleteUser(user)` return true
- `canDeleteUser` function: hanya ADMIN yang bisa hapus user
- Integrasi dengan DeleteUserModal
- Handler `handleDeleteSuccess` untuk remove user dari list setelah berhasil dihapus

**Permission Logic**:
```typescript
const canDeleteUser = (user: UserData) => {
  // Only ADMIN can delete users
  if (currentUserRole === 'ADMIN') return true
  return false
}
```

## Access Control

### Role Permissions

| Role | Dapat Hapus User? | Catatan |
|------|-------------------|---------|
| ADMIN | ✅ Yes | Dapat hapus semua user kecuali dirinya sendiri |
| CEO | ❌ No | Hanya bisa edit dan nonaktifkan |
| HRD | ❌ No | Hanya bisa edit dan nonaktifkan |
| PM | ❌ No | Tidak ada akses hapus |
| KARYAWAN | ❌ No | Tidak ada akses hapus |

### Restrictions

1. **Self-Deletion Prevention**: User tidak bisa menghapus akun sendiri
2. **Admin Only**: Hanya role ADMIN yang memiliki akses hapus user
3. **Confirmation Required**: Harus ketik "HAPUS" untuk konfirmasi
4. **Permanent Action**: Tidak ada undo, user benar-benar terhapus dari sistem

## Database Impact

### Data yang Terhapus:
- ✅ User record di tabel `users`
- ✅ User account di Supabase Auth
- ✅ User profile data (name, phone, position, foto profil)
- ✅ User session dan access tokens

### Data yang TIDAK Terhapus:
- ❌ Laporan yang dibuat user (tetap ada di sistem)
- ❌ Project yang melibatkan user (tetap ada)
- ❌ History/log yang mencatat aktivitas user

## Testing Checklist

- [ ] ADMIN dapat melihat tombol hapus di user list
- [ ] Non-ADMIN tidak melihat tombol hapus
- [ ] Klik tombol hapus membuka modal konfirmasi
- [ ] Modal menampilkan detail user dengan benar
- [ ] Tombol "Hapus Permanen" disabled sampai user ketik "HAPUS"
- [ ] Input konfirmasi case-insensitive (hapus, HAPUS, Hapus semua valid)
- [ ] Proses penghapusan menampilkan loading state
- [ ] User berhasil dihapus dari list setelah konfirmasi
- [ ] User tidak bisa menghapus dirinya sendiri (error message muncul)
- [ ] User terhapus dari Supabase Auth
- [ ] User terhapus dari database
- [ ] Laporan yang dibuat user tetap ada setelah user dihapus
- [ ] Error handling bekerja dengan baik (network error, auth error, dll)

## Security Considerations

1. **Authorization**: Double-check di API level (session role harus ADMIN)
2. **Validation**: Validasi userId di API untuk prevent injection
3. **Audit Trail**: Consider logging deletion actions untuk audit purposes
4. **Cascade Delete**: Pastikan foreign key constraints di database handle dengan baik
5. **Auth Sync**: Hapus dari Auth dulu sebelum database untuk prevent orphaned accounts

## Future Improvements

1. **Soft Delete Option**: Tambah opsi soft delete (mark as deleted) sebagai alternatif
2. **Audit Log**: Log semua deletion actions dengan timestamp dan admin yang melakukan
3. **Bulk Delete**: Fitur hapus multiple users sekaligus
4. **Restore Feature**: Fitur restore user yang sudah dihapus (jika implement soft delete)
5. **Email Notification**: Kirim email notifikasi ke user yang dihapus
6. **Confirmation Email**: Require email confirmation dari admin sebelum hapus

## Related Files

- `template/app/api/admin/users/delete/route.ts` - API endpoint
- `template/app/dashboard/admin/users/manage/DeleteUserModal.tsx` - Modal component
- `template/app/dashboard/admin/users/manage/UserManagementClient.tsx` - User list with delete button
- `template/app/dashboard/admin/users/manage/page.tsx` - Page wrapper

## Migration Notes

**Changed from Prisma to Supabase**:
- Original implementation used Prisma ORM
- Updated to use Supabase direct queries
- Reason: Prisma schema column mapping issues (division_id vs divisionId)
- Benefit: Better compatibility with existing Supabase setup
