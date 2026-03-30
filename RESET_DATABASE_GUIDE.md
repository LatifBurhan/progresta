# Panduan Reset Database

Panduan ini akan membantu Anda menghapus semua data test dari database dan memulai dari awal dengan data bersih.

---

## ⚠️ PERINGATAN

**PENTING:** Script ini akan menghapus **SEMUA DATA** dari database!

Data yang akan dihapus:
- ✅ Semua users (kecuali yang akan dibuat ulang)
- ✅ Semua projects
- ✅ Semua reports/laporan
- ✅ Semua divisions
- ✅ Semua relasi project-division

Data yang **TIDAK** dihapus:
- ❌ Departments (Al-Wustho, Elfan Academy, Ufuk Hijau, Aflaha) - ini data master
- ❌ Struktur tabel (schema tetap ada)
- ❌ Migrations history

---

## 🚀 Cara Reset Database

### Step 1: Backup Data (Opsional tapi Disarankan)

Jika ada data penting yang ingin disimpan:

1. Buka Supabase Dashboard
2. Klik "Table Editor"
3. Pilih tabel yang ingin di-backup
4. Klik "Export" atau copy data manual

### Step 2: Jalankan SQL Script

1. **Buka Supabase Dashboard**
2. **Klik "SQL Editor"** di sidebar kiri
3. **Copy-paste script** dari file `RESET_DATABASE.sql`
4. **Klik "Run"** atau tekan `Ctrl+Enter`

Script akan menghapus data dari tabel dalam urutan yang benar (menghindari foreign key constraint errors).

### Step 3: Hapus Users dari Supabase Auth

**PENTING:** Users di Supabase Auth harus dihapus manual!

1. **Buka Supabase Dashboard**
2. **Klik "Authentication"** di sidebar
3. **Klik "Users"**
4. **Pilih semua users:**
   - Centang checkbox di header tabel (untuk select all)
   - Atau pilih satu per satu
5. **Klik tombol "Delete"** atau ikon trash
6. **Konfirmasi penghapusan**

**Catatan:** Jika ada banyak users, Anda mungkin perlu menghapus beberapa kali karena ada limit per batch.

### Step 4: Verifikasi Database Sudah Bersih

Jalankan query ini di SQL Editor:

```sql
-- Cek jumlah data di setiap tabel
SELECT 'departments' as table_name, COUNT(*) as count FROM departments
UNION ALL
SELECT 'divisions', COUNT(*) FROM divisions
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'reports', COUNT(*) FROM reports
ORDER BY table_name;
```

**Hasil yang diharapkan:**
```
departments: 4
divisions: 0
users: 0
projects: 0
reports: 0
```

### Step 5: Buat Admin Account Baru

Setelah database bersih, buat admin account:

```bash
node scripts/create-admin.mjs
```

Atau gunakan API endpoint:
```
http://localhost:3000/api/create-admin-user
```

### Step 6: Login dan Setup Ulang

1. **Login sebagai admin** dengan credentials yang baru dibuat
2. **Buat divisi baru** sesuai kebutuhan
3. **Buat user baru** sesuai kebutuhan
4. **Mulai fresh!** 🎉

---

## 🔄 Reset Partial (Hanya Data Tertentu)

Jika Anda hanya ingin menghapus data tertentu, gunakan query berikut:

### Hapus Hanya Reports

```sql
DELETE FROM reports;
```

### Hapus Hanya Projects

```sql
-- Hapus relasi dulu
DELETE FROM project_department_divisions;
DELETE FROM project_divisions;

-- Baru hapus projects
DELETE FROM projects;
```

### Hapus Hanya Users (Kecuali Admin)

```sql
-- Hapus semua user kecuali admin
DELETE FROM users WHERE role != 'ADMIN';
```

Jangan lupa hapus juga dari Supabase Auth!

### Hapus Hanya Divisions

```sql
DELETE FROM divisions;
```

---

## 🛠️ Troubleshooting

### Error: "Foreign key constraint violation"

Jika muncul error ini, pastikan Anda menghapus data dalam urutan yang benar:

1. Reports (paling akhir/child)
2. Project_department_divisions
3. Project_divisions
4. Projects
5. Users
6. Divisions
7. Departments (JANGAN dihapus!)

### Error: "Cannot delete users"

Pastikan Anda sudah menghapus semua data yang berelasi dengan users:
- Reports yang dibuat user
- Projects yang dibuat user

### Users Masih Bisa Login Setelah Dihapus dari Database

Ini karena user masih ada di Supabase Auth. Hapus manual dari:
- Supabase Dashboard → Authentication → Users

---

## 📋 Checklist Reset Database

Gunakan checklist ini untuk memastikan semua langkah sudah dilakukan:

- [ ] Backup data penting (jika ada)
- [ ] Jalankan SQL script `RESET_DATABASE.sql`
- [ ] Verifikasi data sudah terhapus dari database
- [ ] Hapus users dari Supabase Auth (manual)
- [ ] Verifikasi tidak ada users di Auth
- [ ] Buat admin account baru
- [ ] Test login dengan admin baru
- [ ] Buat divisi baru (jika perlu)
- [ ] Buat user baru (jika perlu)
- [ ] Verifikasi semua fitur berjalan normal

---

## 🎯 Quick Reset (Semua Langkah)

Untuk reset cepat, ikuti urutan ini:

```bash
# 1. Jalankan SQL script di Supabase SQL Editor
# (Copy-paste dari RESET_DATABASE.sql)

# 2. Hapus users dari Supabase Auth Dashboard
# (Manual via UI)

# 3. Buat admin baru
node scripts/create-admin.mjs

# 4. Login dan mulai fresh!
```

---

## 💡 Tips

1. **Lakukan reset di development environment dulu** sebelum production
2. **Backup data penting** sebelum reset
3. **Catat credentials admin baru** agar tidak lupa
4. **Test semua fitur** setelah reset untuk memastikan tidak ada masalah
5. **Buat divisi default** untuk memudahkan testing

---

## 🔐 Keamanan

Setelah reset dan membuat admin baru:

1. **Ganti password default** segera setelah login pertama
2. **Jangan share credentials** admin ke orang lain
3. **Buat user dengan role sesuai kebutuhan** (jangan semua admin)
4. **Enable 2FA** jika tersedia (untuk production)

---

## 📞 Bantuan

Jika ada masalah saat reset database:

1. Screenshot error yang muncul
2. Catat langkah mana yang gagal
3. Cek Supabase logs untuk detail error
4. Hubungi developer untuk bantuan

---

## ✅ Setelah Reset Berhasil

Database Anda sekarang bersih dan siap digunakan dengan:

- ✅ 4 Departments (Al-Wustho, Elfan Academy, Ufuk Hijau, Aflaha)
- ✅ 0 Divisions (siap dibuat sesuai kebutuhan)
- ✅ 1 Admin user (yang baru dibuat)
- ✅ 0 Projects
- ✅ 0 Reports
- ✅ Database structure tetap utuh

Selamat! Database Anda sudah bersih dan siap digunakan! 🎉
