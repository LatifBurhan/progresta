# 🔔 Notifikasi Persistent - Update

## ✅ FIXED: Notifikasi Sekarang Disimpan 3 Hari

Notifikasi sekarang disimpan di database dan tidak hilang ketika refresh!

---

## 🎯 Perubahan yang Dilakukan

### 1. **Database Table: `notifications`**
- ✅ Notifikasi disimpan ke database Supabase
- ✅ Auto-expire setelah 3 hari
- ✅ Support mark as read/unread
- ✅ RLS policies untuk security

**Schema:**
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key to users)
- type: TEXT (notification type)
- title: TEXT
- message: TEXT
- priority: TEXT (low/medium/high/urgent)
- action_url: TEXT (optional)
- data: JSONB (optional metadata)
- read: BOOLEAN (default: false)
- created_at: TIMESTAMPTZ
- expires_at: TIMESTAMPTZ (default: NOW() + 3 days)
```

### 2. **Notification Library Update**
File: `lib/notifications.ts`

**Sebelum:**
- Notifikasi hanya dikirim via Realtime broadcast
- Tidak disimpan ke database
- Hilang ketika refresh

**Sesudah:**
- ✅ Notifikasi disimpan ke database dulu
- ✅ Kemudian broadcast via Realtime
- ✅ Persistent across sessions
- ✅ Auto-expire setelah 3 hari

### 3. **NotificationBell Component Update**
File: `components/notifications/NotificationBell.tsx`

**Fitur Baru:**
- ✅ Load existing notifications dari database saat mount
- ✅ Mark as read → update database
- ✅ Mark all as read → update database
- ✅ Clear all → delete dari database
- ✅ Unread count accurate dari database

### 4. **Cron Job untuk Cleanup**
File: `app/api/cron/cleanup-notifications/route.ts`

- ✅ Auto-delete notifikasi yang sudah expired (> 3 hari)
- ✅ Runs daily at 2 AM (via Vercel Cron)
- ✅ Bisa dipanggil manual untuk testing

---

## 🚀 Cara Kerja Baru

### Flow Notifikasi:

```
1. Admin creates/updates project
   ↓
2. sendNotification() dipanggil
   ↓
3. Notifikasi disimpan ke database
   - user_id
   - title, message, priority
   - expires_at = NOW() + 3 days
   - read = false
   ↓
4. Broadcast via Supabase Realtime
   ↓
5. User menerima notifikasi:
   - Bell icon update (production)
   - Toast popup (all modes)
   ↓
6. User refresh page
   ↓
7. NotificationBell load dari database
   - Semua notifikasi masih ada!
   - Unread count accurate
   ↓
8. User click notification
   ↓
9. Mark as read di database
   ↓
10. Setelah 3 hari
    ↓
11. Cron job auto-delete expired notifications
```

---

## 📦 File yang Dimodifikasi/Dibuat

### Modified:
1. `lib/notifications.ts` - Save to database before broadcast
2. `components/notifications/NotificationBell.tsx` - Load from DB, update DB

### Created:
1. `supabase/migrations/create_notifications_table.sql` - Database schema
2. `app/api/cron/cleanup-notifications/route.ts` - Cleanup cron job
3. `vercel.json` - Cron job configuration
4. `NOTIFICATION_PERSISTENCE_UPDATE.md` - This documentation

---

## 🧪 Testing

### 1. Test Persistence (Development)

```bash
# Start dev server
npm run dev

# 1. Login sebagai user
# 2. Buka dashboard
# 3. Admin create project dan assign ke user tersebut
# 4. User akan menerima notifikasi
# 5. REFRESH PAGE
# 6. ✅ Notifikasi masih ada!
# 7. Click notification
# 8. ✅ Mark as read
# 9. REFRESH PAGE
# 10. ✅ Notifikasi masih ada dan tetap read
```

### 2. Test Database

```sql
-- Check notifications table
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;

-- Check unread notifications for a user
SELECT * FROM notifications 
WHERE user_id = 'your-user-id' 
AND read = false 
ORDER BY created_at DESC;

-- Check expired notifications
SELECT * FROM notifications 
WHERE expires_at < NOW();
```

### 3. Test Cleanup Cron Job

**Manual trigger:**
```bash
# Call the endpoint directly
curl http://localhost:3000/api/cron/cleanup-notifications

# Or with cron secret (if configured)
curl http://localhost:3000/api/cron/cleanup-notifications \
  -H "Authorization: Bearer your-cron-secret"
```

**Check logs:**
```
Cleanup completed: X expired notifications deleted
```

### 4. Test Mark as Read

```javascript
// Open browser console on notification bell
// Click a notification
// Check database:
SELECT read FROM notifications WHERE id = 'notification-id';
// Should be: true
```

---

## 🔧 Setup Instructions

### 1. Run Migration

**Option A: Via Supabase Dashboard**
1. Go to Supabase Dashboard → SQL Editor
2. Copy content dari `supabase/migrations/create_notifications_table.sql`
3. Run the SQL
4. ✅ Table created

**Option B: Via Supabase CLI**
```bash
supabase db push
```

### 2. Verify Table Created

```sql
-- Check if table exists
SELECT * FROM information_schema.tables 
WHERE table_name = 'notifications';

-- Check RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'notifications';
```

### 3. Configure Cron Secret (Optional but Recommended)

Add to `.env.local`:
```env
CRON_SECRET=your-random-secret-here
```

Add to Vercel Environment Variables:
```
CRON_SECRET=your-random-secret-here
```

### 4. Deploy to Vercel

```bash
git add .
git commit -m "Add persistent notifications with 3-day expiration"
git push

# Vercel will auto-deploy and setup cron jobs
```

---

## 📊 Database Indexes

Untuk performa optimal, tabel sudah dilengkapi indexes:

```sql
-- User's notifications (most common query)
idx_notifications_user_unread (user_id, read, created_at DESC)

-- Individual indexes
idx_notifications_user_id (user_id)
idx_notifications_created_at (created_at DESC)
idx_notifications_read (read)
idx_notifications_expires_at (expires_at)
```

---

## 🔒 Security (RLS Policies)

### Users:
- ✅ Can SELECT own notifications only
- ✅ Can UPDATE own notifications (mark as read)
- ❌ Cannot INSERT notifications
- ❌ Cannot DELETE notifications

### Service Role (Backend):
- ✅ Can INSERT notifications
- ✅ Can DELETE notifications (cleanup)

---

## ⏰ Expiration Logic

### Default: 3 Days
```typescript
expires_at = NOW() + INTERVAL '3 days'
```

### Customize Expiration (Optional)

Edit `lib/notifications.ts`:
```typescript
// Change from 3 days to 7 days
const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
```

Or per notification type:
```typescript
const expirationDays = payload.priority === 'urgent' ? 7 : 3
const expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000).toISOString()
```

---

## 🐛 Troubleshooting

### Notifikasi tidak muncul setelah refresh:
1. Check database: `SELECT * FROM notifications WHERE user_id = 'your-id'`
2. Check RLS policies enabled
3. Check browser console for errors
4. Verify Supabase credentials in `.env`

### Notifikasi tidak ter-mark as read:
1. Check browser console for errors
2. Verify RLS policy "Users can update own notifications"
3. Check network tab untuk UPDATE request

### Cron job tidak jalan:
1. Verify `vercel.json` exists dan valid
2. Check Vercel Dashboard → Settings → Cron Jobs
3. Check Vercel logs untuk cron execution
4. Test manual: `curl /api/cron/cleanup-notifications`

### Database error saat insert:
1. Verify migration sudah dijalankan
2. Check table exists: `\dt notifications`
3. Check RLS policies: `\dp notifications`
4. Verify service role key di `.env`

---

## 📈 Performance Considerations

### Query Optimization:
- ✅ Composite index untuk `(user_id, read, created_at)`
- ✅ Limit 50 notifications per load
- ✅ Auto-cleanup expired notifications

### Scalability:
- **1000 users × 10 notifications/day = 10,000 rows/day**
- **With 3-day expiration = ~30,000 active rows**
- **With indexes = Fast queries even at 100K+ rows**

### Monitoring:
```sql
-- Check table size
SELECT pg_size_pretty(pg_total_relation_size('notifications'));

-- Check notification count
SELECT COUNT(*) FROM notifications;

-- Check expired notifications
SELECT COUNT(*) FROM notifications WHERE expires_at < NOW();
```

---

## 🎯 Next Steps (Optional Enhancements)

### 1. Notification Preferences
Allow users to configure which notifications they want:
```sql
CREATE TABLE notification_preferences (
  user_id UUID PRIMARY KEY,
  project_assigned BOOLEAN DEFAULT true,
  project_deadline BOOLEAN DEFAULT true,
  report_reminder BOOLEAN DEFAULT true,
  ...
);
```

### 2. Notification History Page
Create `/dashboard/notifications` page to show all notifications with pagination.

### 3. Email Digest
Send daily/weekly email digest of unread notifications.

### 4. Push Notifications
Implement Web Push API for browser notifications.

### 5. Custom Expiration
Allow different expiration times per notification type.

---

## 📚 Related Files

- **Migration**: `supabase/migrations/create_notifications_table.sql`
- **Core Library**: `lib/notifications.ts`
- **Bell Component**: `components/notifications/NotificationBell.tsx`
- **Cleanup Cron**: `app/api/cron/cleanup-notifications/route.ts`
- **Cron Config**: `vercel.json`
- **Project Integration**: `NOTIFICATION_PROJECT_INTEGRATION.md`
- **System Docs**: `NOTIFICATION_SYSTEM.md`

---

**Status**: ✅ Ready to Use
**Last Updated**: 2024
**Version**: 2.0.0 (Persistent Storage)
