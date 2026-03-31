# 🧪 Testing Guide - Profile Revision

## Quick Start Testing

### Prerequisites
- ✅ Migrations run successfully
- ✅ Application deployed
- ✅ Test accounts available

---

## 🎯 Critical Test Scenarios

### Test 1: Create User with New Fields
**Goal:** Verify new fields save correctly

1. Login as ADMIN or GENERAL_AFFAIR
2. Navigate to Database Karyawan → Tambah User
3. Fill in all fields:
   - Email: `test-new@example.com`
   - Password: `test123`
   - Nama: `Test User Baru`
   - No Telp: `081234567890`
   - Status Karyawan: `Kontrak`
   - Alamat: `Jl. Test No. 123, Jakarta`
   - Catatan: `Test catatan internal`
   - Role: `Staff`
   - Department: Select any
   - Division: Select any
4. Click "Buat User"
5. **Expected:** Success message, user appears in list
6. **Verify:** Open edit modal, all fields populated correctly

---

### Test 2: Edit Existing User
**Goal:** Verify updates work correctly

1. Login as ADMIN or GENERAL_AFFAIR
2. Navigate to Database Karyawan
3. Click edit on any user
4. Update fields:
   - Status Karyawan: Change to `Tetap`
   - Alamat: Update address
   - Catatan: Add/update notes
5. Click "Simpan Perubahan"
6. **Expected:** Success message
7. **Verify:** Reopen edit modal, changes persisted

---

### Test 3: Role Display & Filtering
**Goal:** Verify new role names display correctly

1. Navigate to Database Karyawan
2. **Check role badges:**
   - ✅ "Staff" (not "Karyawan")
   - ✅ "General Affair" (not "HRD")
   - ✅ "Project Manager"
   - ✅ "CEO"
   - ✅ "Admin"
3. **Test role filter:**
   - Select "Staff" from dropdown
   - **Expected:** Only staff users shown
   - Select "General Affair" from dropdown
   - **Expected:** Only General Affair users shown
4. **Verify:** No "HRD" or "KARYAWAN" text anywhere

---

### Test 4: Permission Checks
**Goal:** Verify role-based permissions work

#### As ADMIN:
1. Login as ADMIN
2. Navigate to Database Karyawan
3. **Verify can:**
   - ✅ Create user
   - ✅ Edit any user
   - ✅ Delete user
   - ✅ Edit notes field
   - ✅ Activate/deactivate user

#### As GENERAL_AFFAIR:
1. Login as GENERAL_AFFAIR (ex-HRD)
2. Navigate to Database Karyawan
3. **Verify can:**
   - ✅ Create user
   - ✅ Edit STAFF and PM users
   - ✅ Delete user
   - ✅ Edit notes field
   - ✅ Activate/deactivate user

#### As CEO:
1. Login as CEO
2. Navigate to Database Karyawan
3. **Verify can:**
   - ✅ Create user
   - ✅ Edit STAFF and PM users
   - ❌ Cannot delete user
   - ❌ Cannot edit notes field
   - ✅ Activate/deactivate user

#### As PM:
1. Login as PM
2. **Verify:**
   - ✅ Can access admin panel
   - ❌ Cannot create user
   - ❌ Cannot edit user
   - ❌ Cannot delete user

#### As STAFF:
1. Login as STAFF (ex-KARYAWAN)
2. **Verify:**
   - ❌ Cannot access Database Karyawan
   - ✅ Can access own profile
   - ✅ Can create reports

---

### Test 5: Notes Field Permissions
**Goal:** Verify notes field is admin-only

1. Login as ADMIN
2. Edit any user
3. **Verify:** Notes field is editable
4. Add text to notes field
5. Save changes
6. Logout

7. Login as GENERAL_AFFAIR
8. Edit same user
9. **Verify:** Notes field is editable
10. Can see previous notes
11. Can update notes

12. Login as CEO
13. Edit same user
14. **Verify:** Notes field should not be editable (or not visible)

---

### Test 6: Department/Division Filtering
**Goal:** Verify department filtering works

1. Login as ADMIN
2. Navigate to Tambah User
3. Select a Department
4. **Verify:** Division dropdown updates
5. **Verify:** Only divisions from selected department shown
6. Change Department
7. **Verify:** Division dropdown updates again
8. **Verify:** Previous division cleared if not in new department

---

### Test 7: Migration Data Integrity
**Goal:** Verify existing data migrated correctly

1. Login as ADMIN
2. Navigate to Database Karyawan
3. Find users that were previously "HRD"
4. **Verify:** Now show as "General Affair"
5. Find users that were previously "KARYAWAN"
6. **Verify:** Now show as "Staff"
7. Check user count before/after migration
8. **Verify:** No users lost

---

## 🐛 Bug Report Template

If you find issues, report using this format:

```
**Issue:** [Brief description]
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happened]

**User Role:** [ADMIN/GENERAL_AFFAIR/CEO/PM/STAFF]
**Browser:** [Chrome/Firefox/Safari]
**Screenshots:** [If applicable]
```

---

## ✅ Test Completion Checklist

- [ ] Test 1: Create User - PASSED
- [ ] Test 2: Edit User - PASSED
- [ ] Test 3: Role Display - PASSED
- [ ] Test 4: Permissions (ADMIN) - PASSED
- [ ] Test 4: Permissions (GENERAL_AFFAIR) - PASSED
- [ ] Test 4: Permissions (CEO) - PASSED
- [ ] Test 4: Permissions (PM) - PASSED
- [ ] Test 4: Permissions (STAFF) - PASSED
- [ ] Test 5: Notes Field - PASSED
- [ ] Test 6: Dept/Div Filtering - PASSED
- [ ] Test 7: Migration Data - PASSED

---

## 🚨 Critical Issues to Watch For

1. **Role validation errors** - Old role values being used
2. **Permission denied errors** - Role checks not updated
3. **Data not saving** - New fields not in API
4. **UI showing old role names** - Cache issues
5. **Migration failures** - ENUM values not added first

---

## 📊 Test Results Summary

**Date Tested:** ___________  
**Tested By:** ___________  
**Environment:** [ ] Staging [ ] Production  

**Overall Status:** [ ] PASS [ ] FAIL  
**Issues Found:** ___________  
**Blockers:** ___________  

**Sign-Off:** ___________  
**Date:** ___________

---

**Need Help?** Contact development team or check PROFILE_REVISION_COMPLETE.md
