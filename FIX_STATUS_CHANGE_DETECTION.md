# 🔧 Fix: Status Change Detection

## Problem Fixed

Query old status dilakukan **SETELAH** update, jadi `oldStatus` dan `newStatus` selalu sama!

### Before (Bug):
```typescript
// 1. Update project ❌
await supabaseAdmin.from("projects").update(projectData)...

// 2. Query old status (tapi sudah di-update!) ❌
const { data: oldProjectData } = await supabaseAdmin
  .from('projects')
  .select('status')
  .eq('id', projectId)

// Result: oldStatus === newStatus (always!)
```

### After (Fixed):
```typescript
// 1. Query old status DULU ✅
const { data: oldProjectData } = await supabaseAdmin
  .from('projects')
  .select('status')
  .eq('id', projectId)

const oldStatus = oldProjectData?.status

// 2. Baru update project ✅
await supabaseAdmin.from("projects").update(projectData)...

// Result: oldStatus !== newStatus (correct!)
```

---

## Testing Now

### Step 1: Restart Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

### Step 2: Assign User ke Project

**PENTING:** Project HARUS punya assigned users!

1. Login sebagai **Admin**
2. Buka **Dashboard → Projects**
3. Klik **Edit** pada project
4. Scroll ke **"Personel Terpilih"**
5. **Centang minimal 1 user** ⭐
6. Klik **Save**

**Expected log:**
```
Newly assigned users: ['user-id']
✅ Notifications sent to 1 newly assigned users
```

### Step 3: Ubah Status Project

1. **Edit project yang sama** (yang sudah punya assigned users)
2. **Ubah status** (misal: Aktif → Selesai)
3. Klik **Save**

**Expected log:**
```
📌 Old project status before update: Aktif
Status change detection:
  Old status: Aktif
  New status: Selesai
  Status changed? true ✅
Sending status change notification to 1 users...
✅ Status change notification sent to 1 users
```

### Step 4: Check Database

```sql
SELECT 
  title,
  message,
  user_id,
  created_at
FROM notifications 
ORDER BY created_at DESC 
LIMIT 5;
```

**Expected result:**
```
title: "Status Project Berubah"
message: "Project 'XXX' statusnya berubah dari Aktif menjadi Selesai"
```

### Step 5: Check UI

1. Login sebagai **user yang di-assign**
2. Buka **Dashboard**
3. Check **Bell Icon** - seharusnya ada badge
4. Click bell - seharusnya ada notifikasi

---

## Troubleshooting

### Still no notification?

**Check 1: Project punya assigned users?**
```sql
SELECT * FROM project_assignments WHERE project_id = 'your-project-id';
```

If empty → Assign user dulu!

**Check 2: Status benar-benar berubah?**

Check terminal log:
```
Old status: Aktif
New status: Selesai
Status changed? true  ← HARUS true!
```

If false → Ubah ke status yang berbeda!

**Check 3: RLS policy OK?**
```sql
SELECT * FROM pg_policies WHERE tablename = 'notifications';
```

Should have "Allow anon access" policy.

**Check 4: Database insert berhasil?**

Check terminal log:
```
✅ Notifications saved to database: 1
```

If error → Check RLS policy.

---

## Quick Test Checklist

- [ ] Restart server
- [ ] Login sebagai admin
- [ ] Edit project
- [ ] **Centang user** di "Personel Terpilih"
- [ ] Save (notif 1: "Project Assigned")
- [ ] Edit project lagi
- [ ] **Ubah status** ke yang berbeda
- [ ] Save (notif 2: "Status Changed")
- [ ] Check terminal: `📌 Old project status before update: ...`
- [ ] Check terminal: `Status changed? true`
- [ ] Check terminal: `✅ Notifications saved to database: 1`
- [ ] Check database: `SELECT * FROM notifications`
- [ ] Login sebagai assigned user
- [ ] Check bell icon

---

## Expected Terminal Output

```
📌 Old project status before update: Aktif
=== NOTIFICATION DEBUG START ===
Status from request: Selesai
Old user IDs: ['user-123']
New user IDs: ['user-123']
Assigned users: [{id: 'user-123', name: 'John'}]
Newly assigned users: []
No newly assigned users to notify
Status change detection:
  Old status: Aktif
  New status: Selesai
  Status changed? true
All assigned user IDs: ['user-123']
Sending status change notification to 1 users...
📧 sendNotification called with: {
  type: 'project_status_changed',
  title: 'Status Project Berubah',
  priority: 'medium',
  userIds: ['user-123']
}
📧 Recipients found: 1 ['user-123']
📧 Sending in-app notification...
📱 sendInAppNotification called for 1 recipients
📱 Inserting notifications to database: 1
✅ Notifications saved to database: 1
📡 Broadcasting to realtime channels...
✅ All broadcasts completed
✅ Status change notification sent to 1 users
=== NOTIFICATION DEBUG END ===
```

---

**Status**: ✅ Fixed
**Time to test**: 3 minutes
