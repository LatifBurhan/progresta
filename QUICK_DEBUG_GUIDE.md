# Quick Debug Guide - Project Assignments

## Langkah 1: Cek Console Browser

1. Buka browser DevTools (F12)
2. Buka tab "Console"
3. Buat project baru dengan pilih user tertentu
4. Lihat console log, cari pesan:
   - "Checking userIds for assignments"
   - "Creating project assignments for users"
   - "Project assignments created successfully"

**Jika muncul error**, screenshot dan kirim ke saya.

## Langkah 2: Cek Console Server (Terminal)

1. Lihat terminal tempat Next.js running
2. Saat create project, akan muncul log:
   - "Received create project request"
   - "Checking userIds for assignments"
   
**Cek apakah `userIds` ada dan berisi array user IDs**

## Langkah 3: Cek Database Langsung

Jalankan query ini di Supabase SQL Editor:

```sql
-- Cek project terbaru
SELECT 
    p.id,
    p.name,
    p.created_at,
    
    -- Berapa user yang di-assign
    (SELECT COUNT(*) 
     FROM project_assignments pa 
     WHERE pa.project_id = p.id) as assignment_count,
    
    -- List user yang di-assign
    (SELECT string_agg(u.name, ', ')
     FROM project_assignments pa
     JOIN users u ON pa.user_id = u.id
     WHERE pa.project_id = p.id) as assigned_users,
     
    -- List divisions
    (SELECT string_agg(d.name, ', ')
     FROM project_divisions pd
     JOIN divisions d ON pd.division_id = d.id
     WHERE pd.project_id = p.id) as divisions

FROM projects p
ORDER BY p.created_at DESC
LIMIT 1;
```

**Expected Result:**
- `assignment_count` > 0 jika Anda pilih user tertentu
- `assigned_users` berisi nama-nama user yang dipilih

**Jika `assignment_count` = 0**, berarti data tidak tersimpan.

## Langkah 4: Test Manual Insert

Coba insert manual di Supabase SQL Editor:

```sql
-- Ganti dengan ID yang sebenarnya
INSERT INTO project_assignments (user_id, project_id)
VALUES 
    ('USER_ID_1', 'PROJECT_ID'),
    ('USER_ID_2', 'PROJECT_ID');
```

**Jika error**, berarti ada masalah dengan:
- RLS policies
- Foreign key constraints
- Permissions

## Langkah 5: Cek RLS Policies

```sql
-- Cek RLS policies untuk project_assignments
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'project_assignments';
```

**Expected:** Harus ada policy untuk service_role atau authenticated role.

## Langkah 6: Test dengan User Berbeda

1. Buat project baru dengan pilih 2 user: User A dan User B
2. Login sebagai User A → project harus muncul
3. Login sebagai User C (tidak dipilih, tapi di divisi sama) → project TIDAK boleh muncul

## Troubleshooting

### Problem: userIds tidak muncul di console log

**Kemungkinan:**
- Frontend tidak mengirim userIds
- Cek di Network tab browser, lihat request body

**Solusi:**
- Pastikan user sudah dipilih di modal (ada checkmark)
- Cek apakah `selectedUsers.length > 0` di UI

### Problem: userIds ada tapi assignment_count = 0

**Kemungkinan:**
- Error saat insert ke database
- RLS policy menolak insert
- Foreign key constraint error

**Solusi:**
- Cek console server untuk error message
- Cek Supabase logs di dashboard
- Test manual insert (Langkah 4)

### Problem: Assignment berhasil tapi user lain masih bisa lihat

**Kemungkinan:**
- Cache browser
- Session lama

**Solusi:**
- Hard refresh (Ctrl+Shift+R)
- Clear browser cache
- Logout dan login ulang
- Gunakan incognito mode

## Laporan ke Developer

Jika masih bermasalah, kirim informasi berikut:

1. **Screenshot console browser** saat create project
2. **Screenshot console server** (terminal)
3. **Result query** dari Langkah 3
4. **Error message** (jika ada)
5. **Langkah yang sudah dicoba**

Format laporan:
```
PROBLEM: [Jelaskan masalahnya]

STEPS TAKEN:
1. [Langkah 1]
2. [Langkah 2]

CONSOLE LOG:
[Paste console log]

DATABASE QUERY RESULT:
[Paste query result]

ERROR MESSAGE:
[Paste error jika ada]
```
