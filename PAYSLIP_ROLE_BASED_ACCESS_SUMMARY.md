# Payslip Role-Based Access Control - Summary

## Problem Solved
Users dari departemen berbeda menerima slip gaji yang salah karena tidak ada pembatasan departemen.

## Solution
Implementasi role-based access control dengan 2 level akses:

### Level 1: Unrestricted Access (Full Access)
**Roles**: GENERAL_AFFAIR, CEO, ADMIN

**Dapat melakukan**:
- ✅ Melihat SEMUA karyawan dari SEMUA departemen
- ✅ Membuat slip gaji untuk karyawan MANAPUN
- ✅ Edit slip gaji dari departemen MANAPUN
- ✅ Hapus slip gaji dari departemen MANAPUN
- ✅ Publish slip gaji dari departemen MANAPUN
- ✅ Dropdown departemen TIDAK terkunci (bisa pilih semua)

**Contoh**: GENERAL_AFFAIR dari UFUK bisa menggaji karyawan ALWUSTHO, UFUK, dan ELFAN.

### Level 2: Restricted Access (Department Only)
**Roles**: Role lain yang punya akses payslip

**Dapat melakukan**:
- ✅ Melihat karyawan dari departemen mereka SAJA
- ✅ Membuat slip gaji untuk departemen mereka SAJA
- ✅ Edit slip gaji dari departemen mereka SAJA
- ✅ Hapus slip gaji dari departemen mereka SAJA
- ✅ Publish slip gaji dari departemen mereka SAJA
- ✅ Dropdown departemen TERKUNCI (tidak bisa ganti)

**Contoh**: PM dari ALWUSTHO hanya bisa menggaji karyawan ALWUSTHO.

## Technical Implementation

### Files Modified
1. `lib/payslip/department.ts` - Added role-based access check
2. `app/dashboard/admin/payslips/page.tsx` - Filter employees by role
3. `app/dashboard/admin/payslips/PayslipAdminClient.tsx` - Lock/unlock dropdown
4. `app/api/admin/payslips/bulk/route.ts` - Validate bulk creation
5. `app/api/admin/payslips/route.ts` - Validate single creation
6. `app/api/admin/payslips/[id]/route.ts` - Validate update & delete
7. `app/api/admin/payslips/publish/route.ts` - Filter publish by role

### Key Function
```typescript
// Returns null for unrestricted roles (can access all)
// Returns department_id for restricted roles
getAdminDepartment(userId: string, userRole: string): Promise<string | null>
```

## Testing
Lihat file: `TESTING_GUIDE_PAYSLIP_DEPARTMENT.md`

## Status
✅ Implementation Complete
⏳ Ready for Testing

## Expected Behavior After Fix

| Scenario | Before Fix | After Fix |
|----------|-----------|-----------|
| GENERAL_AFFAIR dari UFUK buat slip untuk ALWUSTHO | ❌ Tidak bisa | ✅ Bisa |
| GENERAL_AFFAIR dari UFUK buat slip untuk UFUK | ✅ Bisa | ✅ Bisa |
| PM dari ALWUSTHO buat slip untuk ALWUSTHO | ✅ Bisa | ✅ Bisa |
| PM dari ALWUSTHO buat slip untuk UFUK | ❌ Bisa (BUG) | ❌ Tidak bisa (403) |
| User UFUK terima slip dari admin ALWUSTHO | ❌ Ya (BUG) | ✅ Tidak (kecuali dari GENERAL_AFFAIR) |

## Key Points
1. **GENERAL_AFFAIR, CEO, ADMIN** = Full access ke semua departemen
2. **Role lain** = Restricted ke departemen mereka sendiri
3. **API validation** mencegah unauthorized cross-department access
4. **UI locked** untuk restricted roles (tidak bisa pilih departemen lain)
5. **Backward compatible** - slip gaji lama tetap ada untuk historical record
