# Phase 2: Update Role Labels

## 🎯 Objective
Update semua tampilan role dari:
- `HRD` → `General Affair` 
- `KARYAWAN` → `Staff`

## 📝 Changes Required

### Role Value (Database/Code)
- `HRD` → `GENERAL_AFFAIR` ✅ (Already done in migration)
- `KARYAWAN` → `STAFF` ✅ (Already done in migration)

### Role Display Label (UI)
- "HRD" → "General Affair"
- "Karyawan" → "Staff"

## 📂 Files to Update

### Priority 1: Core Components (CRITICAL)
1. ✅ `app/dashboard/admin/users/manage/UserManagementClient.tsx`
2. ✅ `app/dashboard/admin/users/create/CreateUserForm.tsx`
3. ✅ `app/dashboard/admin/users/manage/EditUserModal.tsx`
4. ✅ `app/admin/users/CreateUserModal.tsx`
5. ✅ `app/dashboard/ResponsiveLayout.tsx`
6. ✅ `app/dashboard/profile/page.tsx`

### Priority 2: Permission Checks (CRITICAL)
7. ✅ `app/dashboard/admin/users/manage/page.tsx`
8. ✅ `app/dashboard/admin/users/create/page.tsx`
9. ✅ `app/api/admin/users/action/route.ts`
10. ✅ `lib/session.ts` (if any)

### Priority 3: Display & UI
11. ✅ `app/dashboard/DashboardClient.tsx`
12. ✅ `app/dashboard/reports/page.tsx`
13. ✅ `app/reports/page.tsx`
14. ✅ `app/dashboard/profile/ProfileForm.tsx`
15. ✅ `app/dashboard/admin/per-user/page.tsx`

### Priority 4: Info Text
16. ✅ `app/(auth)/login/page.tsx`
17. ✅ `app/waiting-room/page.tsx`
18. ✅ `app/debug/page.tsx`

### Priority 5: API Routes
19. ✅ `app/api/admin/users/create/route.ts`
20. ✅ `app/api/admin/users/update/route.ts`
21. ✅ `app/api/admin/users/approve/route.ts`
22. ✅ `app/api/admin/divisions/*/route.ts`
23. ✅ `app/api/divisions/route.ts`
24. ✅ `app/api/reports/*/route.ts`
25. ✅ `app/api/dashboard/*/route.ts`
26. ✅ `app/api/admin/project-reports/*/route.ts`

## 🔄 Update Pattern

### For Role Checks (Code)
```typescript
// OLD
if (['HRD', 'CEO', 'ADMIN'].includes(role))

// NEW  
if (['GENERAL_AFFAIR', 'CEO', 'ADMIN'].includes(role))
```

### For Role Display (UI)
```typescript
// OLD
{ value: 'HRD', label: 'HRD', icon: '👥' }

// NEW
{ value: 'GENERAL_AFFAIR', label: 'General Affair', icon: '👥' }
```

### For Role Filter
```typescript
// OLD
<option value="HRD">HRD</option>

// NEW
<option value="GENERAL_AFFAIR">General Affair</option>
```

## ⚠️ Important Notes

1. **Database values** sudah berubah (HRD → GENERAL_AFFAIR)
2. **Code checks** harus update ke GENERAL_AFFAIR
3. **Display labels** bisa tetap user-friendly
4. **Backward compatibility** tidak perlu (data sudah dimigrate)

## 🧪 Testing Checklist

- [x] Login sebagai General Affair (ex-HRD)
- [x] Check permissions masih berfungsi
- [x] Create user dengan role General Affair
- [x] Edit user dengan role General Affair
- [x] Filter by role General Affair
- [x] Display role badge shows "General Affair"
- [x] No errors in console
- [x] No "HRD" or "KARYAWAN" text visible

---

**Status:** ✅ COMPLETED
**Completed Time:** Phase 2 Complete
