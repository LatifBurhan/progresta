# 🧪 Test Script - Perbaikan Login System

## 📋 Checklist Testing

### ✅ 1. Test Create User (Admin)

#### Prerequisites:
- Login sebagai HRD/CEO/ADMIN
- Pastikan ada divisi aktif di sistem

#### Steps:
1. **Akses Form Create User**
   ```
   URL: /dashboard/admin/users/create
   Expected: Form create user terbuka dengan field lengkap
   ```

2. **Fill Form dengan Data Test**
   ```
   Email: testuser@example.com
   Password: password123
   Nama: Test User Baru
   No. Telepon: 08123456789
   Posisi: Software Developer
   Role: Karyawan
   Divisi: [Pilih divisi aktif]
   ```

3. **Submit Form**
   ```
   Expected: 
   - Success message: "User berhasil dibuat dan dapat langsung login"
   - Form reset
   - Redirect ke manage users page
   ```

4. **Verify Database**
   ```sql
   -- Check di public.users
   SELECT id, email, name, role, status_pending FROM public.users 
   WHERE email = 'testuser@example.com';
   
   Expected: 
   - Record exists
   - status_pending = false
   - role = 'Karyawan'
   ```

### ✅ 2. Test Login User Baru

#### Steps:
1. **Logout dari Admin Account**
   ```
   Action: Klik logout
   Expected: Redirect ke login page
   ```

2. **Login dengan User Baru**
   ```
   URL: /login
   Email: testuser@example.com
   Password: password123
   ```

3. **Verify Login Success**
   ```
   Expected:
   - Login berhasil
   - Redirect ke /dashboard
   - Session created dengan role 'Karyawan'
   - Tidak ada error message
   ```

4. **Check Dashboard Access**
   ```
   Expected:
   - Dashboard terbuka normal
   - User info di header/sidebar sesuai
   - Menu sesuai dengan role Karyawan
   ```

### ✅ 3. Test Role-based Access

#### Test sebagai Karyawan:
```
✅ Dapat akses: /dashboard
✅ Dapat akses: /dashboard/reports (jika ada)
❌ Tidak dapat akses: /dashboard/admin/*
```

#### Test Create User dengan Role Berbeda:
```
1. Login sebagai HRD
2. Create user dengan role PM
3. Login dengan user PM baru
4. Verify access sesuai role PM
```

### ✅ 4. Test Error Scenarios

#### 4.1 Email Duplicate
```
Steps:
1. Create user dengan email yang sudah ada
Expected: Error "Email sudah terdaftar"
```

#### 4.2 Invalid Role
```
Steps:
1. Manually send request dengan role invalid
Expected: Error "Role tidak valid"
```

#### 4.3 Inactive Division
```
Steps:
1. Nonaktifkan divisi
2. Try create user dengan divisi tersebut
Expected: Error "Tidak dapat menambahkan user ke divisi yang tidak aktif"
```

#### 4.4 Wrong Password Login
```
Steps:
1. Login dengan password salah
Expected: Error "Email atau password salah"
```

## 🔍 Debugging Commands

### Check User in Database:
```sql
-- Check public.users
SELECT u.id, u.email, u.name, u.role, u.status_pending, d.name as division_name
FROM public.users u
LEFT JOIN public.divisions d ON u.division_id = d.id
ORDER BY u.created_at DESC
LIMIT 5;
```

### Check Supabase Auth Users:
```sql
-- Check auth.users (if accessible)
SELECT id, email, created_at, email_confirmed_at, last_sign_in_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

### Check Session:
```javascript
// In browser console
fetch('/api/auth/check')
  .then(res => res.json())
  .then(data => console.log('Session:', data))
```

## 🚨 Common Issues & Solutions

### Issue 1: "Supabase admin client not configured"
```
Solution: 
1. Check .env file has SUPABASE_SERVICE_ROLE_KEY
2. Restart development server
3. Verify key is correct in Supabase dashboard
```

### Issue 2: "Data user tidak ditemukan di sistem"
```
Solution:
1. Check if user exists in public.users table
2. Verify ID matches between auth.users and public.users
3. Check if user was created properly
```

### Issue 3: "Akun masih menunggu persetujuan admin"
```
Solution:
1. Check status_pending in public.users
2. Should be false for admin-created users
3. Update manually if needed:
   UPDATE public.users SET status_pending = false WHERE email = 'user@example.com';
```

### Issue 4: Role-based access not working
```
Solution:
1. Check session role matches database role
2. Verify role values are consistent ('Karyawan' not 'KARYAWAN')
3. Check middleware/auth guards
```

## ✅ Success Criteria

### All tests pass if:
1. ✅ Admin dapat create user baru
2. ✅ User baru dapat login dengan email/password
3. ✅ Session created dengan role yang benar
4. ✅ Dashboard accessible sesuai role
5. ✅ Error handling berfungsi dengan baik
6. ✅ Database consistency maintained

## 📊 Test Results Template

```
Date: [DATE]
Tester: [NAME]

✅ Create User Test: PASS/FAIL
   - Form accessible: PASS/FAIL
   - User created successfully: PASS/FAIL
   - Database record correct: PASS/FAIL

✅ Login Test: PASS/FAIL
   - Login successful: PASS/FAIL
   - Session created: PASS/FAIL
   - Dashboard accessible: PASS/FAIL

✅ Role Access Test: PASS/FAIL
   - Correct menu visibility: PASS/FAIL
   - Access control working: PASS/FAIL

✅ Error Handling Test: PASS/FAIL
   - Duplicate email handled: PASS/FAIL
   - Invalid data handled: PASS/FAIL
   - Wrong password handled: PASS/FAIL

Overall Status: PASS/FAIL
Notes: [Any issues or observations]
```

## 🎯 Next Steps After Testing

### If All Tests Pass:
1. ✅ System is ready for production
2. ✅ Document the fix for team
3. ✅ Update any existing users if needed

### If Tests Fail:
1. ❌ Check error logs
2. ❌ Verify environment variables
3. ❌ Check database schema
4. ❌ Review code changes
5. ❌ Test individual components

## 📝 Notes

- Test dengan berbagai role (Karyawan, PM, HRD, CEO)
- Test dengan berbagai divisi
- Test error scenarios untuk memastikan robustness
- Verify session management berfungsi dengan baik
- Check performance dengan multiple users