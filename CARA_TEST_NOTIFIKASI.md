# 📝 Cara Test Notifikasi Project

## ⚠️ PENTING: 2 Syarat Agar Notifikasi Muncul

### 1. Project HARUS Punya Assigned Users

**Cara assign user ke project:**

1. Login sebagai **Admin**
2. Buka **Dashboard → Projects**
3. Klik **Edit** pada project yang mau ditest
4. Scroll ke bagian **"Personel Terpilih"**
5. **Centang minimal 1 user**
6. Klik **Save**

### 2. Status HARUS Berubah

Notifikasi hanya dikirim jika status **benar-benar berubah**:
- Aktif → Selesai ✅
- Aktif → Ditunda ✅
- Selesai → Aktif ✅
- Aktif → Aktif ❌ (tidak berubah, tidak ada notifikasi)

---

## 🧪 Testing Step by Step

### Test 1: Assign User ke Project

```
1. Login sebagai Admin
2. Edit project
3. Centang user di "Personel Terpilih"
4. Save
5. Check terminal:
   ✅ "Notifications sent to X newly assigned users"
6. Login sebagai user yang di-assign
7. Check bell icon - ada notifikasi "Project Baru Ditugaskan"
```

### Test 2: Ubah Status Project

```
1. Login sebagai Admin
2. Edit project yang SUDAH PUNYA assigned users
3. Ubah status (misal: Aktif → Selesai)
4. Save
5. Check terminal:
   ✅ "Status changed? true"
   ✅ "Status change notification sent to X users"
6. Login sebagai assigned user
7. Check bell icon - ada notifikasi "Status Project Berubah"
```

---

## 📊 Expected Terminal Logs

### Saat Assign User Baru:

```
=== NOTIFICATION DEBUG START ===
Old user IDs: []
New user IDs: ['user-id-123']
Newly assigned users: ['user-id-123']
Sending notifications to 1 newly assigned users...
📧 sendNotification called with: {...}
📱 Inserting notifications to database: 1
✅ Notifications saved to database: 1
✅ Notifications sent to 1 newly assigned users
=== NOTIFICATION DEBUG END ===
```

### Saat Ubah Status:

```
=== NOTIFICATION DEBUG START ===
Status from request: Selesai
Assigned users: [{id: 'user-id-123', ...}]
Status change detection:
  Old status: Aktif
  New status: Selesai
  Status changed? true
All assigned user IDs: ['user-id-123']
Sending status change notification to 1 users...
📧 sendNotification called with: {...}
📱 Inserting notifications to database: 1
✅ Notifications saved to database: 1
✅ Status change notification sent to 1 users
=== NOTIFICATION DEBUG END ===
```

---

## ❌ Common Mistakes

### Mistake 1: Project Tidak Punya Assigned Users

**Log yang muncul:**
```
Assigned users: []
⚠️ No assigned users to notify about status change
💡 Tip: Tambahkan user di "Personel Terpilih" saat edit project
```

**Fix:** Assign user dulu ke project!

### Mistake 2: Status Tidak Berubah

**Log yang muncul:**
```
Old status: Aktif
New status: Aktif
Status changed? false
Status not changed, skipping status notification
```

**Fix:** Ubah status ke yang berbeda!

### Mistake 3: Lupa Save

Pastikan klik tombol **Save/Update** setelah edit!

---

## 🎯 Quick Test Checklist

- [ ] Restart server: `npm run dev`
- [ ] Login sebagai admin
- [ ] Edit project
- [ ] **Centang minimal 1 user** di "Personel Terpilih"
- [ ] Save (ini akan trigger notifikasi "Project Assigned")
- [ ] Edit project lagi
- [ ] **Ubah status** ke yang berbeda
- [ ] Save (ini akan trigger notifikasi "Status Changed")
- [ ] Check terminal logs
- [ ] Check database: `SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5;`
- [ ] Login sebagai assigned user
- [ ] Check bell icon - seharusnya ada 2 notifikasi

---

## 🔍 Debug Commands

### Check Assigned Users:

```sql
SELECT 
  p.name as project_name,
  u.name as user_name,
  u.email
FROM project_assignments pa
JOIN projects p ON p.id = pa.project_id
JOIN users u ON u.id = pa.user_id
WHERE p.id = 'your-project-id';
```

### Check Notifications:

```sql
SELECT 
  n.title,
  n.message,
  u.name as user_name,
  n.created_at
FROM notifications n
JOIN users u ON u.id = n.user_id
ORDER BY n.created_at DESC
LIMIT 10;
```

---

## 💡 Tips

1. **Test di production mode** untuk realtime notifications:
   ```bash
   npm run build
   npm start
   ```

2. **Gunakan 2 browser** untuk test:
   - Browser 1: Login sebagai Admin (edit project)
   - Browser 2: Login sebagai User (terima notifikasi)

3. **Check database** untuk memastikan notifikasi tersimpan:
   ```sql
   SELECT COUNT(*) FROM notifications;
   ```

---

**Status**: Ready to test
**Time needed**: 5 minutes
