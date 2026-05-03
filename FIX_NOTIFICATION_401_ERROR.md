# 🔧 Fix: Notification 401 Error

## Problem
Error 401 saat load notifications karena RLS policies tidak mengizinkan authenticated users untuk query tabel.

## Solution

### Step 1: Update RLS Policies

Run SQL ini di **Supabase Dashboard → SQL Editor**:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can delete notifications" ON notifications;

-- Create new policies that work with authenticated users

-- Policy 1: Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy 2: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy 3: Service role can insert notifications
CREATE POLICY "Service role can insert notifications"
  ON notifications
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Policy 4: Authenticated users can also insert (for testing)
CREATE POLICY "Authenticated can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy 5: Service role can delete notifications
CREATE POLICY "Service role can delete notifications"
  ON notifications
  FOR DELETE
  TO service_role
  USING (true);

-- Policy 6: Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notifications TO service_role;
```

### Step 2: Verify Policies

```sql
-- Check policies
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'notifications';

-- Should return 6 policies:
-- 1. Users can view own notifications (SELECT, authenticated)
-- 2. Users can update own notifications (UPDATE, authenticated)
-- 3. Service role can insert notifications (INSERT, service_role)
-- 4. Authenticated can insert notifications (INSERT, authenticated)
-- 5. Service role can delete notifications (DELETE, service_role)
-- 6. Users can delete own notifications (DELETE, authenticated)
```

### Step 3: Test

```bash
# Restart dev server
npm run dev

# Login ke aplikasi
# Buka dashboard
# Check console - error 401 seharusnya hilang
# Notifikasi seharusnya muncul
```

---

## What Changed?

### Before:
```sql
-- Policy hanya menggunakan auth.uid() tanpa TO authenticated
USING (auth.uid() = user_id)
```

### After:
```sql
-- Policy explicitly untuk authenticated role
TO authenticated
USING (user_id = auth.uid())
```

### Key Differences:
1. **Added `TO authenticated`** - Explicitly target authenticated users
2. **Added GRANT statements** - Give permissions to authenticated role
3. **Added user delete policy** - Users can delete their own notifications
4. **Added authenticated insert policy** - For testing purposes

---

## Files Modified

1. **Created**: `supabase/migrations/fix_notifications_rls.sql`
2. **Created**: `lib/supabase-client.ts` - Authenticated browser client
3. **Modified**: `components/notifications/NotificationBell.tsx` - Use authenticated client

---

## Verify Fix

### Check in Browser Console:

```javascript
// Should NOT see any 401 errors
// Should see:
console.log('Loaded X notifications')
```

### Check in Database:

```sql
-- Test query as authenticated user
SELECT * FROM notifications WHERE user_id = auth.uid();

-- Should return notifications without error
```

---

## Troubleshooting

### Still getting 401?

1. **Clear browser cache and cookies**
2. **Logout and login again**
3. **Check session is valid**:
   ```javascript
   // In browser console
   const supabase = getSupabaseBrowserClient()
   const { data } = await supabase.auth.getSession()
   console.log(data.session) // Should not be null
   ```

4. **Verify RLS policies applied**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'notifications';
   ```

5. **Check grants**:
   ```sql
   SELECT grantee, privilege_type 
   FROM information_schema.role_table_grants 
   WHERE table_name = 'notifications';
   ```

### Error: "auth.uid() is null"

This means user is not authenticated. Check:
1. User is logged in
2. Session cookie exists
3. Supabase client has valid session

---

## Summary

✅ **Fixed**: RLS policies now allow authenticated users to query notifications
✅ **Fixed**: NotificationBell uses authenticated Supabase client
✅ **Fixed**: Proper permissions granted to authenticated role

**Status**: Ready to test
**Time to fix**: 2-3 minutes
