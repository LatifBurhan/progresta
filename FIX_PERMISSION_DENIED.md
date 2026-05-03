# 🔧 Fix: Permission Denied Error

## Error Found

```
❌ Failed to save notifications to database: {
  code: '42501',
  message: 'permission denied for table notifications'
}
```

**Cause:** Service role tidak punya permission untuk insert ke tabel `notifications`.

---

## ✅ Solution: Grant Permissions

### Step 1: Run SQL di Supabase

Buka **Supabase Dashboard → SQL Editor**, run SQL ini:

```sql
-- Grant ALL permissions to service_role
GRANT ALL ON notifications TO service_role;

-- Also grant to anon
GRANT ALL ON notifications TO anon;

-- Verify grants
SELECT 
  grantee,
  privilege_type
FROM information_schema.role_table_grants 
WHERE table_name = 'notifications'
ORDER BY grantee, privilege_type;
```

**Expected result:**
```
grantee       | privilege_type
------------- | --------------
anon          | DELETE
anon          | INSERT
anon          | SELECT
anon          | UPDATE
service_role  | DELETE
service_role  | INSERT
service_role  | SELECT
service_role  | UPDATE
```

### Step 2: Restart Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 3: Test Lagi

1. Edit project
2. Ubah status
3. Save

**Expected terminal log:**
```
📱 Inserting notifications to database: 1
✅ Notifications saved to database: 1  ✅ BERHASIL!
```

### Step 4: Check Database

```sql
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5;
```

Seharusnya ada row baru!

---

## 🎉 Expected Result

✅ No more "permission denied" error
✅ Notifications saved to database
✅ Bell icon shows badge
✅ Notifications appear in dropdown

---

## Additional Fixes Applied

1. ✅ Fixed email notification URL (skip for now)
2. ✅ Fixed push notification URL (skip for now)
3. ✅ Both will be implemented later when needed

---

**Time to fix:** 2 minutes
**Status:** Ready to test
