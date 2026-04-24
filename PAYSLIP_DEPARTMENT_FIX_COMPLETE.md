# Fix Payslip Department Filtering - Complete Implementation

## Problem
Users from department "Ufuk" were receiving payslips created by admin from "Al-Wustho". The system didn't restrict admins to only manage their own department's payslips.

## Root Cause
- No department validation in payslip creation/update APIs
- Admin could see and manage all employees regardless of department
- No filtering based on admin's department assignment

## Solution Implemented
Implemented role-based department restrictions:
- **Unrestricted Roles** (GENERAL_AFFAIR, CEO, ADMIN): Can manage payslips for ALL departments
- **Other Roles**: Restricted to their own department only

## Changes Made

### 1. Updated Department Helper Functions
**File**: `lib/payslip/department.ts`
- Added `canAccessAllDepartments(role)` - Check if role has unrestricted access
- Updated `getAdminDepartment(userId, userRole)` - Returns null for unrestricted roles
- `getDepartmentName(departmentId)` - Get department name
- `validateUsersDepartment(userIds, departmentId)` - Validate users belong to department

### 2. Updated Server Page
**File**: `app/dashboard/admin/payslips/page.tsx`
- Fetches admin's department using `getAdminDepartment(userId, role)`
- For unrestricted roles: Shows ALL employees from ALL departments
- For restricted roles: Shows only employees from admin's department
- Passes `adminDepartmentId` to client component

### 3. Updated Client Component
**File**: `app/dashboard/admin/payslips/PayslipAdminClient.tsx`
- Added `adminDepartmentId` prop
- If `adminDepartmentId` exists: Department filter locked to that department
- If `adminDepartmentId` is null: Can select any department (unrestricted access)

### 4. Added API Validation - Bulk Create
**File**: `app/api/admin/payslips/bulk/route.ts`
- Checks user role first
- Unrestricted roles: No validation, can create for any department
- Restricted roles: Validates all `user_ids` belong to admin's department
- Returns 403 error if restricted admin tries cross-department creation

### 5. Added API Validation - Single Create
**File**: `app/api/admin/payslips/route.ts` (POST)
- Checks user role first
- Unrestricted roles: No validation
- Restricted roles: Validates `user_id` belongs to admin's department

### 6. Added API Validation - Update
**File**: `app/api/admin/payslips/[id]/route.ts` (PUT)
- Checks user role first
- Unrestricted roles: Can update any payslip
- Restricted roles: Validates payslip's user belongs to admin's department

### 7. Added API Validation - Delete
**File**: `app/api/admin/payslips/[id]/route.ts` (DELETE)
- Checks user role first
- Unrestricted roles: Can delete any payslip
- Restricted roles: Validates payslip's user belongs to admin's department

### 8. Added API Validation - Publish
**File**: `app/api/admin/payslips/publish/route.ts`
- Checks user role first
- Unrestricted roles: Can publish payslips from all departments
- Restricted roles: Only publishes payslips from admin's department

## How It Works

### Unrestricted Roles (GENERAL_AFFAIR, CEO, ADMIN)
1. **Admin Login**: System detects unrestricted role
2. **Employee List**: Shows ALL employees from ALL departments
3. **Department Filter**: Can select any department or "Semua Departemen"
4. **Create Payslip**: Can create for ANY employee from ANY department
5. **Update Payslip**: Can update ANY payslip
6. **Delete Payslip**: Can delete ANY payslip
7. **Publish Payslips**: Can publish payslips from ANY department

### Restricted Roles (Other roles with payslip access)
1. **Admin Login**: System identifies admin's department
2. **Employee List**: Only shows employees from admin's department
3. **Department Filter**: Locked to admin's department (cannot change)
4. **Create Payslip**: Can only create for their department's employees
5. **Update Payslip**: Can only update their department's payslips
6. **Delete Payslip**: Can only delete their department's payslips
7. **Publish Payslips**: Only publishes their department's payslips

## Access Matrix

| Role | Can Access All Departments | Department Filter | Can Manage All Payslips |
|------|---------------------------|-------------------|------------------------|
| GENERAL_AFFAIR | ✅ Yes | Unlocked | ✅ Yes |
| CEO | ✅ Yes | Unlocked | ✅ Yes |
| ADMIN | ✅ Yes | Unlocked | ✅ Yes |
| Other Roles | ❌ No | Locked | ❌ Only their dept |

## Examples

### Example 1: GENERAL_AFFAIR from UFUK
- Can see employees from: ALWUSTHO, UFUK, ELFAN (all)
- Can create payslips for: Anyone
- Can edit payslips from: Any department
- Department dropdown: Unlocked, can select any

### Example 2: PM or Other Role from ALWUSTHO
- Can see employees from: ALWUSTHO only
- Can create payslips for: ALWUSTHO employees only
- Can edit payslips from: ALWUSTHO only
- Department dropdown: Locked to ALWUSTHO

## Testing Checklist

### Test Case 1: GENERAL_AFFAIR Role (Unrestricted)
- [ ] Can see ALL employees from ALL departments
- [ ] Department dropdown is UNLOCKED (can select any department)
- [ ] Can create payslips for employees from ANY department
- [ ] Can edit payslips from ANY department
- [ ] Can delete payslips from ANY department
- [ ] Publish affects ALL departments (or selected department)

### Test Case 2: CEO Role (Unrestricted)
- [ ] Can see ALL employees from ALL departments
- [ ] Department dropdown is UNLOCKED
- [ ] Can create payslips for ANY employee
- [ ] Can edit ANY payslip
- [ ] Can delete ANY payslip
- [ ] Publish affects ALL departments

### Test Case 3: ADMIN Role (Unrestricted)
- [ ] Can see ALL employees from ALL departments
- [ ] Department dropdown is UNLOCKED
- [ ] Can create payslips for ANY employee
- [ ] Can edit ANY payslip
- [ ] Can delete ANY payslip
- [ ] Publish affects ALL departments

### Test Case 4: Restricted Role from ALWUSTHO
- [ ] Can only see ALWUSTHO employees
- [ ] Department dropdown is LOCKED to ALWUSTHO
- [ ] Can create payslips for ALWUSTHO employees only
- [ ] Cannot create payslips for UFUK or ELFAN employees (API returns 403)
- [ ] Can only edit ALWUSTHO payslips
- [ ] Can only delete ALWUSTHO payslips
- [ ] Publish only affects ALWUSTHO payslips

### Test Case 5: Restricted Role from UFUK HIJAU ENERGY
- [ ] Can only see UFUK employees
- [ ] Department dropdown is LOCKED to UFUK HIJAU ENERGY
- [ ] Can create payslips for UFUK employees only
- [ ] Cannot create payslips for ALWUSTHO or ELFAN employees (API returns 403)
- [ ] Can only edit UFUK payslips
- [ ] Can only delete UFUK payslips
- [ ] Publish only affects UFUK payslips

### Test Case 6: Cross-Department Attack Prevention (Restricted Roles Only)
- [ ] Restricted admin cannot use API directly to create payslip for other department
- [ ] Restricted admin cannot use API directly to edit other department's payslips
- [ ] Restricted admin cannot use API directly to delete other department's payslips
- [ ] Bulk generate with mixed departments is rejected for restricted roles
- [ ] Unrestricted roles (GENERAL_AFFAIR, CEO, ADMIN) CAN do all of the above

## User Verification

Users should receive payslips from their department:
- ALWUSTHO users → ALWUSTHO payslips
- UFUK HIJAU ENERGY users → UFUK payslips
- ELFAN ACADEMY users → ELFAN payslips

**Note**: With unrestricted roles, one GENERAL_AFFAIR can create payslips for all departments, which is the intended behavior.

## Files Modified
1. `lib/payslip/department.ts` (created)
2. `app/dashboard/admin/payslips/page.tsx`
3. `app/dashboard/admin/payslips/PayslipAdminClient.tsx`
4. `app/api/admin/payslips/bulk/route.ts`
5. `app/api/admin/payslips/route.ts`
6. `app/api/admin/payslips/[id]/route.ts`
7. `app/api/admin/payslips/publish/route.ts`

## Status
✅ Implementation Complete
⏳ Ready for Testing
