# Testing Guide - Payslip Department Isolation

## Quick Test Steps

### Preparation
1. Make sure you have users with different roles:
   - GENERAL_AFFAIR (unrestricted - can manage all departments)
   - CEO (unrestricted - can manage all departments)
   - ADMIN (unrestricted - can manage all departments)
   - Other roles with payslip access (restricted to their department)

2. Make sure you have employees in each department:
   - ALWUSTHO
   - UFUK HIJAU ENERGY
   - ELFAN ACADEMY

### Test 1: Unrestricted Role (GENERAL_AFFAIR, CEO, ADMIN)
1. Login as GENERAL_AFFAIR user
2. Go to "Kelola Slip Gaji & Cuti"
3. **Expected Results**:
   - Can see ALL employees from ALL departments
   - Department dropdown is UNLOCKED (can select any department)
   - Can filter by department or select "Semua Departemen"
   - Can create payslips for ANY employee
   - Can edit ANY payslip
   - Can delete ANY payslip

4. Test creating payslip for employee from different department
5. **Expected**: Success (no 403 error)

### Test 2: Restricted Role
1. Login as user with restricted role (not GENERAL_AFFAIR/CEO/ADMIN) from ALWUSTHO
2. Go to "Kelola Slip Gaji & Cuti"
3. **Expected Results**:
   - Can ONLY see ALWUSTHO employees
   - Department dropdown is LOCKED to "ALWUSTHO"
   - Cannot change department filter
   - Can create payslips for ALWUSTHO employees only

4. Try to create payslip for UFUK employee (via API test)
5. **Expected**: 403 Forbidden error

### Test 3: GENERAL_AFFAIR Cross-Department Access
1. Login as GENERAL_AFFAIR from UFUK department
2. Go to "Kelola Slip Gaji & Cuti"
3. Select "ALWUSTHO" from department dropdown
4. **Expected**: Shows ALWUSTHO employees
5. Create payslip for ALWUSTHO employee
6. **Expected**: Success
7. Change to "ELFAN ACADEMY" department
8. **Expected**: Shows ELFAN employees
9. Create payslip for ELFAN employee
10. **Expected**: Success

This confirms GENERAL_AFFAIR can manage ALL departments.

### Test 4: Cross-Department Prevention (Restricted Roles Only)
You can test this using browser DevTools or Postman:

**Test 4a: Try to create payslip for different department**
```bash
# Get user_id from UFUK department
# Try to create payslip while logged in as ALWUSTHO admin

POST /api/admin/payslips
{
  "user_id": "UFUK_USER_ID_HERE",
  "periode_bulan": 1,
  "periode_tahun": 2026,
  "gaji_pokok": 5000000,
  "lembur": 0,
  "insentif": 0,
  "tunjangan": 0,
  "dinas_luar": 0
}

Expected Response: 403 Forbidden
Message: "Anda hanya dapat membuat slip gaji untuk karyawan di departemen Anda"
```

**Test 4b: Try bulk generate with mixed departments**
```bash
POST /api/admin/payslips/bulk
{
  "user_ids": ["ALWUSTHO_USER_1", "UFUK_USER_1", "ELFAN_USER_1"],
  "periode_bulan": 1,
  "periode_tahun": 2026,
  "gaji_pokok": 5000000,
  ...
}

Expected Response: 403 Forbidden
Message: "Anda hanya dapat membuat slip gaji untuk karyawan di departemen Anda. X karyawan tidak valid."
```

### Test 5: Verify User Receives Correct Payslips
1. Login as employee from UFUK department
2. Go to "Slip Gaji" menu
3. **Expected**: See payslips created for UFUK employees
4. Note: If GENERAL_AFFAIR created the payslip, it's still valid (they have permission)

### Test 6: Database Verification
Run the SQL queries in `test_payslip_department_isolation.sql`:

**Most Important Query** (check for unauthorized cross-department payslips):
```sql
-- This checks if restricted roles created cross-department payslips
-- Should return 0 rows for restricted roles
SELECT 
  p.id,
  creator.name as creator_name,
  creator.role as creator_role,
  emp_dept.name as employee_department,
  creator_dept.name as creator_department
FROM payslips p
JOIN users u ON p.user_id = u.id
LEFT JOIN user_departments emp_ud ON u.id = emp_ud.user_id
LEFT JOIN departments emp_dept ON emp_ud.department_id = emp_dept.id
LEFT JOIN users creator ON p.created_by = creator.id
LEFT JOIN user_departments creator_ud ON creator.id = creator_ud.user_id
LEFT JOIN departments creator_dept ON creator_ud.department_id = creator_dept.id
WHERE emp_dept.id != creator_dept.id
  AND creator.role NOT IN ('GENERAL_AFFAIR', 'CEO', 'ADMIN');
```

If this returns > 0, there are payslips created by restricted roles that violate department isolation.

### Test 7: Publish Isolation
1. Login as restricted role from ALWUSTHO
2. Create some draft payslips for ALWUSTHO employees
3. Click "Publish Semua Draft"
4. **Expected**: Only ALWUSTHO payslips are published
5. Login as GENERAL_AFFAIR
6. Create draft payslips for UFUK employees
7. Click "Publish Semua Draft"
8. **Expected**: Can publish payslips from any department (unrestricted)

### Test 8: Role-Based Access Verification
Test with each role to confirm access level:

| Role | Can See All Depts | Dropdown Locked | Can Manage All |
|------|------------------|-----------------|----------------|
| GENERAL_AFFAIR | ✅ Yes | ❌ No | ✅ Yes |
| CEO | ✅ Yes | ❌ No | ✅ Yes |
| ADMIN | ✅ Yes | ❌ No | ✅ Yes |
| Other Roles | ❌ No | ✅ Yes | ❌ No |

## Common Issues & Solutions

### Issue 1: GENERAL_AFFAIR sees only their department
**Cause**: Role check not working properly
**Solution**: Verify user role is exactly "GENERAL_AFFAIR" (case-sensitive)

### Issue 2: Restricted admin sees all employees
**Cause**: Admin might not be assigned to a department
**Solution**: Check `user_departments` table and assign admin to correct department

### Issue 3: Department dropdown not locked for restricted role
**Cause**: `adminDepartmentId` is null even for restricted role
**Solution**: Verify admin has department assignment in database

### Issue 4: Old payslips show cross-department
**Cause**: Payslips created before this fix
**Solution**: This is expected. The fix prevents NEW unauthorized cross-department payslips. Old ones remain for historical record. GENERAL_AFFAIR can create cross-department payslips (authorized).

### Issue 5: API returns 403 for GENERAL_AFFAIR
**Cause**: Role check failing
**Solution**: Verify role is in UNRESTRICTED_ROLES array: ['GENERAL_AFFAIR', 'CEO', 'ADMIN']

## Success Criteria

✅ GENERAL_AFFAIR, CEO, ADMIN can see ALL employees from ALL departments
✅ GENERAL_AFFAIR, CEO, ADMIN have unlocked department dropdown
✅ GENERAL_AFFAIR, CEO, ADMIN can create/edit/delete payslips for ANY department
✅ Restricted roles can ONLY see their department's employees
✅ Restricted roles have locked department dropdown
✅ Restricted roles creating payslip for other department returns 403
✅ Restricted roles bulk generate with mixed departments returns 403
✅ Restricted roles editing other department's payslip returns 403
✅ Restricted roles deleting other department's payslip returns 403
✅ Restricted roles publishing only affects their department
✅ Employees receive payslips correctly
✅ Database query shows 0 unauthorized cross-department payslips

## Report Results

After testing, please report:
1. Which role you tested with (GENERAL_AFFAIR, CEO, ADMIN, or restricted role)
2. Which department the user belongs to
3. Whether unrestricted roles can see ALL employees
4. Whether unrestricted roles can create payslips for ANY department
5. Whether restricted roles can only see their department's employees
6. Whether restricted roles' department dropdown is locked
7. Whether API blocked unauthorized cross-department attempts (403 error)
8. Whether employees receive correct payslips
9. Result of database verification query (should be 0 for unauthorized cross-dept)

## Next Steps After Testing

If all tests pass:
- ✅ Mark Task 5 as COMPLETE
- ✅ Deploy to production
- ✅ Monitor for any issues

If tests fail:
- Report which specific test failed
- Provide error messages or screenshots
- Check browser console for errors
- Check server logs for API errors
