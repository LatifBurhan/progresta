# 🐛 Debug: Notifikasi Update Project

## Testing Steps

### Step 1: Restart Server

```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

### Step 2: Update Project Status

1. Login sebagai **Admin**
2. Buka **Dashboard → Projects**
3. Pilih project yang sudah ada
4. Klik **Edit**
5. **Ubah Status** menjadi salah satu:
   - Selesai
   - Dibatalkan
   - Ditunda
6. Klik **Save/Update**

### Step 3: Check Console Logs

Buka **Terminal** tempat `npm run dev` jalan, cari log seperti ini:

```
=== NOTIFICATION DEBUG START ===
Status from request: Selesai
Old user IDs: [...]
New user IDs: [...]
Assigned users: [...]
Checking status change notification...
Status value: Selesai
Is status in list? true
All assigned user IDs for status notification: [...]
Sending status change notification to X users...
📧 sendNotification called with: {...}
📧 Recipients found: X [...]
📧 Sending in-app notification...
📱 sendInAppNotification called for X recipients
📱 Inserting notifications to database: X
✅ Notifications saved to database: X
📡 Broadcasting to realtime channels...
✅ All broadcasts completed
✅ Status change notification sent to X users
=== NOTIFICATION DEBUG END ===
```

### Step 4: Check Database

```sql
-- Check if notifications were inserted
SELECT 
  id,
  user_id,
  title,
  message,
  priority,
  read,
  created_at
FROM notifications 
ORDER BY created_at DESC 
LIMIT 10;
```

### Step 5: Check Browser Console

Login sebagai **User** yang di-assign ke project:

1. Buka **Dashboard**
2. Buka **Browser Console** (F12)
3. Cari log:
   ```
   Loaded X notifications
   ```
4. Check **Bell Icon** - seharusnya ada badge count
5. Click **Bell Icon** - seharusnya ada notifikasi

---

## Common Issues & Solutions

### Issue 1: "No assigned users to notify about status change"

**Cause**: Project tidak punya assigned users

**Solution**: 
1. Edit project
2. Tambahkan user di **"Personel Terpilih"**
3. Save
4. Coba update status lagi

### Issue 2: "Status not in notification list"

**Cause**: Status yang dipilih bukan Selesai/Dibatalkan/Ditunda

**Solution**: Pilih salah satu dari 3 status tersebut

### Issue 3: Notifikasi masuk DB tapi tidak muncul di UI

**Cause**: Realtime broadcast gagal atau user tidak subscribe

**Solution**:
1. Check production mode: `npm run build && npm start`
2. Refresh page
3. Notifikasi seharusnya load dari database

### Issue 4: "Failed to save notifications to database"

**Cause**: RLS policy atau permissions issue

**Solution**: Run SQL fix:
```sql
-- Grant permissions
GRANT ALL ON notifications TO anon;
GRANT ALL ON notifications TO service_role;

-- Check policy
SELECT * FROM pg_policies WHERE tablename = 'notifications';
```

---

## Manual Test via API

Test langsung via curl:

```bash
# Get your session cookie first
# Login → DevTools → Application → Cookies → Copy 'session' value

# Test notification
curl -X POST http://localhost:3000/api/test-notification \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_SESSION_COOKIE" \
  -d '{
    "type": "custom",
    "userId": "your-user-id"
  }'
```

---

## Check Logs Checklist

Saat update project, pastikan log ini muncul:

- [ ] `=== NOTIFICATION DEBUG START ===`
- [ ] `Status from request: [status]`
- [ ] `Assigned users: [array]`
- [ ] `Is status in list? true`
- [ ] `Sending status change notification to X users...`
- [ ] `📧 sendNotification called with:`
- [ ] `📧 Recipients found: X`
- [ ] `📱 Inserting notifications to database: X`
- [ ] `✅ Notifications saved to database: X`
- [ ] `✅ All broadcasts completed`
- [ ] `=== NOTIFICATION DEBUG END ===`

Jika ada yang missing, screenshot dan share!

---

## Expected Behavior

### When Status Changed to Selesai/Dibatalkan/Ditunda:

1. **Server logs**: Debug logs muncul
2. **Database**: Row baru di tabel `notifications`
3. **User UI**: 
   - Bell icon badge count +1
   - Notification muncul di dropdown
   - Toast popup (production mode)
4. **Persistence**: Refresh page, notifikasi masih ada

### When Adding New User to Project:

1. **Server logs**: "Notifications sent to X newly assigned users"
2. **Database**: Row baru untuk user baru
3. **New user UI**: Notifikasi "Project Baru Ditugaskan"

---

## Quick Debug Commands

```sql
-- Count notifications
SELECT COUNT(*) FROM notifications;

-- Check recent notifications
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5;

-- Check notifications for specific user
SELECT * FROM notifications WHERE user_id = 'user-id-here';

-- Delete all test notifications
DELETE FROM notifications WHERE title LIKE '%Test%';
```

---

## Next Steps

Setelah testing:

1. **If working**: Remove debug logs (optional)
2. **If not working**: Share console logs + database query results
3. **Deploy**: Push to production

---

**Status**: Debug mode enabled
**Time to test**: 5 minutes
