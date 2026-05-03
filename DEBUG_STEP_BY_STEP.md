# 🔍 Debug Step by Step

## Step 1: Test Database Access Langsung

Kita akan test apakah database bisa di-insert sama sekali.

### A. Restart Server

```bash
# Stop server (Ctrl+C)
npm run dev
```

### B. Test via API

Buka browser, login, lalu buka URL ini:

```
http://localhost:3000/api/test-direct-notification
```

Atau via curl:

```bash
curl -X POST http://localhost:3000/api/test-direct-notification \
  -H "Content-Type: application/json" \
  -H "Cookie: session=YOUR_SESSION_COOKIE" \
  -d '{}'
```

### C. Check Terminal Output

Seharusnya muncul:

```
🧪 TEST: Direct notification insert
Target user ID: your-user-id
✅ Table notifications exists
🧪 Inserting test notification: {...}
✅ Insert successful: [...]
✅ Verify successful: {...}
```

### D. Check Database

```sql
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 1;
```

**Jika berhasil:** Database access OK, masalah di logic notification
**Jika gagal:** Ada masalah dengan RLS policy atau permissions

---

## Step 2: Share Info untuk Debug

### A. Terminal Logs

Saat update project, copy SEMUA log yang muncul. Cari yang ada:
- `===`
- `📧`
- `📱`
- `✅`
- `❌`

### B. Project Assignments

Jalankan di Supabase SQL Editor:

```sql
-- Check project assignments
SELECT 
  p.id,
  p.name,
  p.status,
  COUNT(pa.user_id) as assigned_users_count
FROM projects p
LEFT JOIN project_assignments pa ON pa.project_id = p.id
GROUP BY p.id, p.name, p.status
ORDER BY p.name
LIMIT 20;
```

Share hasil query ini.

### C. Check Specific Project

```sql
-- Ganti dengan ID project yang Anda edit
SELECT 
  p.name as project_name,
  p.status,
  u.id as user_id,
  u.name as user_name,
  u.email
FROM projects p
LEFT JOIN project_assignments pa ON pa.project_id = p.id
LEFT JOIN users u ON u.id = pa.user_id
WHERE p.id = 'PASTE-PROJECT-ID-DISINI';
```

### D. Check RLS Policies

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'notifications';
```

### E. Check Grants

```sql
SELECT 
  grantee,
  privilege_type
FROM information_schema.role_table_grants 
WHERE table_name = 'notifications';
```

---

## Step 3: Manual Test Insert

Test insert manual di SQL Editor:

```sql
-- Test insert notification
INSERT INTO notifications (
  id,
  user_id,
  type,
  title,
  message,
  priority,
  read,
  created_at,
  expires_at
) VALUES (
  gen_random_uuid(),
  'PASTE-YOUR-USER-ID-DISINI',
  'system_alert',
  'Manual Test',
  'Test notification manual dari SQL',
  'high',
  false,
  NOW(),
  NOW() + INTERVAL '3 days'
);

-- Check if inserted
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 1;
```

**Jika berhasil:** Database OK, masalah di code
**Jika gagal:** Ada masalah dengan RLS atau permissions

---

## Step 4: Check Environment Variables

Pastikan `.env` atau `.env.local` punya:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Check di terminal:

```bash
# Windows PowerShell
echo $env:SUPABASE_SERVICE_ROLE_KEY

# Bash
echo $SUPABASE_SERVICE_ROLE_KEY
```

**Jika kosong:** Service role key tidak ter-load!

---

## Step 5: Check Supabase Admin Client

Test di terminal Node.js:

```javascript
// Create file: test-supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('URL:', supabaseUrl ? 'OK' : 'MISSING');
console.log('Service Key:', serviceKey ? 'OK' : 'MISSING');

if (supabaseUrl && serviceKey) {
  const supabase = createClient(supabaseUrl, serviceKey);
  
  supabase
    .from('notifications')
    .select('count')
    .then(({ data, error }) => {
      if (error) {
        console.error('Error:', error);
      } else {
        console.log('Success! Can access notifications table');
      }
    });
}
```

Run:
```bash
node test-supabase.js
```

---

## Checklist untuk Share

Tolong share hasil dari:

- [ ] Test API `/api/test-direct-notification` (terminal output)
- [ ] Query project assignments (SQL result)
- [ ] Query RLS policies (SQL result)
- [ ] Query grants (SQL result)
- [ ] Manual insert test (berhasil/gagal)
- [ ] Environment variables check (OK/MISSING)
- [ ] Terminal logs saat update project (full logs)

---

## Quick Commands

```bash
# 1. Restart server
npm run dev

# 2. Test direct insert
curl -X POST http://localhost:3000/api/test-direct-notification \
  -H "Content-Type: application/json" \
  -d '{}'

# 3. Check database
# Run di Supabase SQL Editor:
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5;
```

---

**Next Steps:**

Setelah Anda share info di atas, saya bisa:
1. Identify exact problem
2. Provide specific fix
3. Test solution

**Time needed:** 10 minutes untuk collect info
