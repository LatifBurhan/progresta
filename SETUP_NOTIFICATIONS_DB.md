# 🚀 Setup Notifikasi Database - Quick Guide

## Step 1: Run Migration

### Via Supabase Dashboard (Recommended)

1. Buka **Supabase Dashboard** → Project Anda
2. Klik **SQL Editor** di sidebar kiri
3. Klik **New Query**
4. Copy-paste isi file `supabase/migrations/create_notifications_table.sql`
5. Klik **Run** atau tekan `Ctrl+Enter`
6. ✅ Seharusnya muncul: "Success. No rows returned"

### Via Supabase CLI (Alternative)

```bash
# Install Supabase CLI jika belum
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Push migration
supabase db push
```

---

## Step 2: Verify Table Created

Jalankan query ini di SQL Editor:

```sql
-- Check table exists
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'notifications'
ORDER BY ordinal_position;

-- Should return 11 columns:
-- id, user_id, type, title, message, priority, 
-- action_url, data, read, created_at, expires_at, updated_at
```

---

## Step 3: Test Insert (Optional)

```sql
-- Test insert notification
INSERT INTO notifications (
  user_id, 
  type, 
  title, 
  message, 
  priority
) VALUES (
  'your-user-id-here',
  'system_alert',
  'Test Notification',
  'This is a test notification',
  'medium'
);

-- Check if inserted
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 1;
```

---

## Step 4: Verify RLS Policies

```sql
-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'notifications';

-- Should return 4 policies:
-- 1. Users can view own notifications (SELECT)
-- 2. Users can update own notifications (UPDATE)
-- 3. Service role can insert notifications (INSERT)
-- 4. Service role can delete notifications (DELETE)
```

---

## Step 5: Test dari Aplikasi

### Development Mode:

```bash
npm run dev
```

1. Login sebagai admin
2. Create project baru
3. Assign user ke project
4. Check console log: "Notifications sent to X assigned users"
5. Login sebagai user yang di-assign
6. Refresh page beberapa kali
7. ✅ Notifikasi masih ada!

### Check Database:

```sql
-- Check notifications created
SELECT 
  id,
  user_id,
  title,
  message,
  read,
  created_at,
  expires_at
FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## Step 6: Setup Cron Job (Production)

### Add Cron Secret to Vercel:

1. Buka **Vercel Dashboard** → Your Project
2. Go to **Settings** → **Environment Variables**
3. Add new variable:
   - **Name**: `CRON_SECRET`
   - **Value**: Generate random string (e.g., `openssl rand -hex 32`)
   - **Environment**: Production, Preview, Development
4. Save

### Verify Cron Jobs:

1. Deploy ke Vercel: `git push`
2. Go to **Vercel Dashboard** → **Settings** → **Cron Jobs**
3. Should see:
   - `/api/cron/cleanup-notifications` - Daily at 2 AM
   - `/api/cron/update-overdue-projects` - Daily at midnight

---

## Step 7: Test Cleanup Cron

### Manual Test:

```bash
# Without auth (if CRON_SECRET not set)
curl https://your-app.vercel.app/api/cron/cleanup-notifications

# With auth (if CRON_SECRET set)
curl https://your-app.vercel.app/api/cron/cleanup-notifications \
  -H "Authorization: Bearer your-cron-secret"
```

Expected response:
```json
{
  "success": true,
  "message": "Successfully deleted X expired notifications",
  "deletedCount": 0
}
```

---

## ✅ Checklist

- [ ] Migration dijalankan di Supabase
- [ ] Table `notifications` exists
- [ ] 11 columns ada semua
- [ ] 4 RLS policies active
- [ ] Test insert berhasil
- [ ] Test dari aplikasi berhasil
- [ ] Notifikasi persistent setelah refresh
- [ ] Mark as read berfungsi
- [ ] Cron secret di-setup di Vercel
- [ ] Cron jobs muncul di Vercel dashboard
- [ ] Test cleanup endpoint berhasil

---

## 🐛 Common Issues

### Error: "relation 'notifications' does not exist"
**Fix**: Run migration di SQL Editor

### Error: "new row violates row-level security policy"
**Fix**: Check RLS policies, pastikan service role key digunakan

### Notifikasi tidak muncul setelah refresh
**Fix**: 
1. Check browser console
2. Verify table ada data: `SELECT * FROM notifications`
3. Check RLS policies

### Cron job tidak jalan
**Fix**:
1. Verify `vercel.json` exists
2. Redeploy: `git push`
3. Check Vercel logs

---

## 📞 Need Help?

Check dokumentasi lengkap:
- `NOTIFICATION_PERSISTENCE_UPDATE.md` - Full documentation
- `NOTIFICATION_PROJECT_INTEGRATION.md` - Project integration
- `NOTIFICATION_QUICKSTART.md` - Quick start guide

---

**Estimated Setup Time**: 5-10 minutes
**Difficulty**: Easy
**Status**: ✅ Production Ready
