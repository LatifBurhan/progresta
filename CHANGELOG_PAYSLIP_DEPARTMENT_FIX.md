# Changelog - Payslip Department Access Control

## Version 1.1.0 - Role-Based Department Access

### Date
2026-04-24

### Type
Feature Enhancement / Bug Fix

### Summary
Implemented role-based access control for payslip management to prevent unauthorized cross-department payslip creation while allowing designated roles (GENERAL_AFFAIR, CEO, ADMIN) to manage all departments.

### Problem
- Users from department "Ufuk" were receiving payslips created by admins from "Al-Wustho"
- No department validation in payslip APIs
- All admins could see and manage employees from all departments regardless of their own department

### Solution
Implemented two-tier access control:

1. **Unrestricted Access** (GENERAL_AFFAIR, CEO, ADMIN)
   - Can view all employees from all departments
   - Can create/edit/delete payslips for any department
   - Department dropdown is unlocked
   - No API restrictions

2. **Restricted Access** (Other roles)
   - Can only view employees from their own department
   - Can only create/edit/delete payslips for their department
   - Department dropdown is locked to their department
   - API returns 403 for cross-department attempts

### Changes

#### New Files
- `lib/payslip/department.ts` - Department access control helpers
- `PAYSLIP_DEPARTMENT_FIX_COMPLETE.md` - Complete documentation
- `PAYSLIP_ROLE_BASED_ACCESS_SUMMARY.md` - Quick reference
- `TESTING_GUIDE_PAYSLIP_DEPARTMENT.md` - Testing instructions
- `test_payslip_department_isolation.sql` - Database verification queries

#### Modified Files
1. **lib/payslip/department.ts** (created)
   - Added `canAccessAllDepartments(role)` function
   - Added `getAdminDepartment(userId, userRole)` function
   - Added `getDepartmentName(departmentId)` function
   - Added `validateUsersDepartment(userIds, departmentId)` function

2. **app/dashboard/admin/payslips/page.tsx**
   - Added role parameter to `getAdminDepartment()` call
   - Filters employees based on admin's department (if restricted)
   - Passes `adminDepartmentId` to client component

3. **app/dashboard/admin/payslips/PayslipAdminClient.tsx**
   - Added `adminDepartmentId` prop to interface
   - Sets default department to admin's department
   - Locks department dropdown for restricted roles
   - Removes "Semua Departemen" option for restricted roles

4. **app/api/admin/payslips/bulk/route.ts**
   - Added role-based department validation
   - Validates all user_ids belong to admin's department (if restricted)
   - Returns 403 for unauthorized cross-department attempts

5. **app/api/admin/payslips/route.ts** (POST)
   - Added role-based department validation
   - Validates user_id belongs to admin's department (if restricted)
   - Returns 403 for unauthorized attempts

6. **app/api/admin/payslips/[id]/route.ts** (PUT & DELETE)
   - Added role-based department validation for updates
   - Added role-based department validation for deletes
   - Returns 403 for unauthorized attempts

7. **app/api/admin/payslips/publish/route.ts**
   - Added role-based filtering for publish operations
   - Unrestricted roles can publish all departments
   - Restricted roles only publish their department

### API Changes

#### New Behavior
All payslip management endpoints now check:
1. User's role (unrestricted vs restricted)
2. If restricted: Validates department access
3. Returns 403 if restricted user attempts cross-department operation

#### Affected Endpoints
- `POST /api/admin/payslips` - Create single payslip
- `POST /api/admin/payslips/bulk` - Bulk create payslips
- `PUT /api/admin/payslips/[id]` - Update payslip
- `DELETE /api/admin/payslips/[id]` - Delete payslip
- `POST /api/admin/payslips/publish` - Publish payslips

### Database Impact
- No schema changes required
- Uses existing `user_departments` table for validation
- No data migration needed

### Backward Compatibility
- ✅ Fully backward compatible
- Existing payslips remain unchanged
- Old cross-department payslips (if any) remain for historical record
- New restrictions only apply to new operations

### Security Improvements
- ✅ Prevents unauthorized cross-department payslip creation
- ✅ API-level validation (cannot be bypassed via UI manipulation)
- ✅ Role-based access control
- ✅ Department isolation for restricted roles

### Testing
See `TESTING_GUIDE_PAYSLIP_DEPARTMENT.md` for complete testing instructions.

Key test scenarios:
1. GENERAL_AFFAIR can manage all departments ✅
2. CEO can manage all departments ✅
3. ADMIN can manage all departments ✅
4. Restricted roles limited to their department ✅
5. API blocks unauthorized cross-department attempts ✅

### Deployment Notes
1. No database migrations required
2. No environment variable changes
3. Build successful (verified)
4. No breaking changes
5. Can be deployed immediately

### Rollback Plan
If issues occur, revert these commits:
- Revert changes to `lib/payslip/department.ts`
- Revert changes to all payslip API routes
- Revert changes to payslip page and client components

### Known Limitations
- Users must be assigned to a department in `user_departments` table
- If restricted user has no department assignment, they see no employees
- Historical payslips created before this fix may show cross-department (expected)

### Future Enhancements
- Add audit log for cross-department payslip creation by unrestricted roles
- Add UI indicator showing which role created each payslip
- Add department filter in employee payslip view

### Contributors
- Kiro AI Assistant

### References
- Issue: User dari departemen Ufuk menerima slip gaji dari admin Alwustho
- Requirement: GENERAL_AFFAIR harus bisa menggaji semua departemen
- Solution: Role-based access control dengan 2 tier (unrestricted/restricted)
