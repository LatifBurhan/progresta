# 🔧 User Action (Activate/Deactivate) - Fix

## Problem

Tombol "Nonaktifkan" tidak berfungsi di halaman Database Karyawan.

## Root Cause

1. **API menggunakan Prisma (dummy)** - File `/api/admin/users/action/route.ts` masih menggunakan `prisma` yang sebenarnya adalah dummy object
2. **Tidak ada error handling** - Function `handleUserAction` di client tidak menangani error dengan baik
3. **Tidak ada feedback** - User tidak mendapat notifikasi apakah action berhasil atau gagal

## Solution Applied

### 1. Update API Endpoint

**File:** `template/app/api/admin/users/action/route.ts`

**Changes:**
- ❌ Removed: `import prisma from '@/lib/prisma'`
- ✅ Added: `import { supabaseAdmin } from '@/lib/supabase'`
- ✅ Replaced all Prisma queries with Supabase queries
- ✅ Added proper error handling for Supabase operations

**Before:**
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId }
})
```

**After:**
```typescript
const { data: user, error: userError } = await supabaseAdmin
  .from('users')
  .select('*')
  .eq('id', userId)
  .single()
```

### 2. Improve Client Error Handling

**File:** `template/app/dashboard/admin/users/manage/UserManagementClient.tsx`

**Changes:**
- ✅ Added response data parsing
- ✅ Added success/error checking
- ✅ Added user feedback with alerts
- ✅ Added detailed error logging

**Before:**
```typescript
const handleUserAction = async (userId: string, action: 'activate' | 'deactivate') => {
  try {
    const response = await fetch('/api/admin/users/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action })
    })
    if (response.ok) {
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, status: action === 'activate' ? 'ACTIVE' : 'INACTIVE' } : u))
      setActionModal({ open: false, user: null, action: null })
    }
  } catch (error) { console.error(error) }
}
```

**After:**
```typescript
const handleUserAction = async (userId: string, action: 'activate' | 'deactivate') => {
  try {
    const response = await fetch('/api/admin/users/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, action })
    })
    
    const data = await response.json()
    
    if (response.ok && data.success) {
      setAllUsers(prev => prev.map(u => 
        u.id === userId 
          ? { ...u, status: action === 'activate' ? 'ACTIVE' : 'INACTIVE' } 
          : u
      ))
      setActionModal({ open: false, user: null, action: null })
      alert(`User berhasil ${action === 'activate' ? 'diaktifkan' : 'dinonaktifkan'}!`)
    } else {
      alert(`Gagal ${action === 'activate' ? 'mengaktifkan' : 'menonaktifkan'} user: ${data.message || 'Unknown error'}`)
      console.error('User action failed:', data)
    }
  } catch (error) {
    console.error('User action error:', error)
    alert(`Terjadi kesalahan saat ${action === 'activate' ? 'mengaktifkan' : 'menonaktifkan'} user`)
  }
}
```

### 3. Enhanced Status Indicators

**File:** `template/app/dashboard/admin/users/manage/UserManagementClient.tsx`

**Added:**
- ✅ CheckCircle2 icon for active users (green)
- ✅ XCircle icon for inactive users (red)
- ✅ Status badge with icon next to user name
- ✅ Visual feedback on avatar

## API Endpoints

### POST `/api/admin/users/action`

**Request Body:**
```json
{
  "userId": "uuid",
  "action": "activate" | "deactivate" | "delete"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "User activated successfully",
  "user": { ... }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Error message"
}
```

## Permissions

| Role | Activate | Deactivate | Delete |
|------|----------|------------|--------|
| ADMIN | ✅ | ✅ | ✅ |
| HRD | ✅ | ✅ | ✅ |
| CEO | ✅ | ✅ | ❌ |
| PM | ✅ | ✅ | ❌ |
| KARYAWAN | ❌ | ❌ | ❌ |

## Validation Rules

1. ✅ User cannot perform action on their own account
2. ✅ Cannot activate already active user
3. ✅ Cannot deactivate already inactive user
4. ✅ Only ADMIN can delete users
5. ✅ User must exist in database

## Testing

### Test Activate User
1. Login as ADMIN/HRD/CEO
2. Go to Database Karyawan
3. Find inactive user
4. Click activate button (green icon)
5. Confirm action
6. ✅ User status should change to ACTIVE
7. ✅ Success alert should appear
8. ✅ Icon should change to CheckCircle (green)

### Test Deactivate User
1. Login as ADMIN/HRD/CEO
2. Go to Database Karyawan
3. Find active user
4. Click deactivate button (orange icon)
5. Confirm action
6. ✅ User status should change to INACTIVE
7. ✅ Success alert should appear
8. ✅ Icon should change to XCircle (red)

## Troubleshooting

### Issue: Button does nothing

**Check:**
1. Browser console for errors
2. Network tab for API response
3. User permissions (role)
4. Database connection

**Solution:**
- Check Supabase credentials in `.env`
- Verify user has proper role
- Check browser console for detailed error

### Issue: "User not found"

**Cause:** User ID doesn't exist in database

**Solution:**
- Refresh page to reload user list
- Check database for user existence

### Issue: "Insufficient permissions"

**Cause:** User role doesn't have permission

**Solution:**
- Login with ADMIN/HRD/CEO account
- Check session role in browser DevTools

## Database Schema

```sql
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE');

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'KARYAWAN',
  status "UserStatus" DEFAULT 'ACTIVE',
  ...
);
```

## Files Modified

1. ✅ `app/api/admin/users/action/route.ts` - API endpoint
2. ✅ `app/dashboard/admin/users/manage/UserManagementClient.tsx` - Client component
3. ✅ `app/dashboard/admin/users/manage/UserActionModal.tsx` - Modal component

---

**Status:** ✅ FIXED
**Date:** 2024
**Tested:** ✅ Working
