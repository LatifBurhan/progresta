# Verifikasi Fix Sudah Berjalan

## PENTING: Restart Server Dulu!

Sebelum test, **WAJIB restart server**:

```bash
# Stop server (Ctrl+C di terminal)
# Kemudian start ulang:
npm run dev
```

## Test 1: Cek Logging Ada

1. Buka terminal tempat server running
2. Buat project baru dengan pilih user tertentu
3. **HARUS muncul log ini di terminal:**

```
Received create project request: { ..., userIds: ['xxx-xxx', 'yyy-yyy'], ... }
Checking userIds for assignments: { userIds: [...], isArray: true, length: 2 }
Creating project assignments for users: ['xxx-xxx', 'yyy-yyy']
Project assignments to insert: [...]
Project assignments created successfully: [...]
```

**Jika log ini TIDAK muncul**, berarti:
- Server belum di-restart
- Atau file API belum ter-update

## Test 2: Cek Database

Setelah buat project, jalankan query ini di Supabase:

```sql
SELECT 
    p.name,
    (SELECT COUNT(*) FROM project_assignments pa WHERE pa.project_id = p.id) as assignment_count,
    (SELECT string_agg(u.name, ', ') FROM project_assignments pa JOIN users u ON pa.user_id = u.id WHERE pa.project_id = p.id) as assigned_users
FROM projects p
ORDER BY p.created_at DESC
LIMIT 1;
```

**Expected:**
- `assignment_count` > 0
- `assigned_users` berisi nama user yang dipilih

## Test 3: Cek Browser Console

1. Buka DevTools (F12)
2. Tab Console
3. Buat project baru
4. **TIDAK boleh ada error merah**

## Test 4: Test User Visibility

### Setup:
- Project: "Test Assignment"
- Division: "IT"
- User dipilih: User A, User B
- User tidak dipilih: User C (tapi di division IT juga)

### Test:
1. Login sebagai User A → Buka "Buat Laporan" → Project "Test Assignment" **HARUS muncul**
2. Login sebagai User B → Buka "Buat Laporan" → Project "Test Assignment" **HARUS muncul**
3. Login sebagai User C → Buka "Buat Laporan" → Project "Test Assignment" **TIDAK BOLEH muncul**

## Troubleshooting

### Problem: Log tidak muncul di terminal

**Solusi:**
1. Pastikan server sudah di-restart
2. Cek file `app/api/admin/projects/create/route.ts` line 177-210
3. Harus ada `console.log("Checking userIds for assignments"...)`

### Problem: assignment_count = 0 di database

**Kemungkinan:**
1. userIds tidak dikirim dari frontend
2. userIds kosong []
3. Ada error saat insert (cek log)

**Debug:**
- Cek log di terminal, cari "Checking userIds"
- Jika log mengatakan "No userIds provided", berarti frontend tidak kirim data
- Jika ada error "Project assignments creation failed", ada masalah insert

### Problem: User tidak dipilih masih bisa lihat project

**Kemungkinan:**
1. assignment_count = 0 (project tidak punya assignments)
2. Cache browser
3. Session lama

**Solusi:**
1. Cek database dulu (Test 2)
2. Hard refresh browser (Ctrl+Shift+R)
3. Logout dan login ulang
4. Gunakan incognito mode

## Checklist Sebelum Lapor Bug

Sebelum lapor bahwa masih ada bug, pastikan sudah:

- [ ] Restart server
- [ ] Clear browser cache / gunakan incognito
- [ ] Cek log di terminal (Test 1)
- [ ] Cek database (Test 2)
- [ ] Test dengan user berbeda (Test 4)
- [ ] Logout dan login ulang

## Jika Masih Bermasalah

Kirim informasi ini:

1. **Screenshot terminal** saat create project (harus ada log)
2. **Screenshot browser console** (F12)
3. **Result query database** (Test 2)
4. **Langkah yang sudah dicoba**

Tanpa informasi ini, saya tidak bisa tahu di mana masalahnya.
