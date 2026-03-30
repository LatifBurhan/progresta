# Cara Membuat Admin Account

Ada 3 cara untuk membuat admin account:

---

## 🚀 Cara 1: Menggunakan Script Node.js (PALING MUDAH)

### Langkah-langkah:

1. **Buka terminal di folder `template`**
   ```bash
   cd template
   ```

2. **Jalankan script**
   ```bash
   node scripts/create-admin.mjs
   ```

3. **Script akan membuat admin dengan credentials:**
   - Email: `admin@alwustho.com`
   - Password: `Admin123!`
   - Role: `ADMIN`

4. **Login ke aplikasi**
   - Buka: `http://localhost:3000/login`
   - Masukkan email dan password di atas
   - Klik Login

### Custom Email/Password:

Jika ingin menggunakan email dan password sendiri:

```bash
node scripts/create-admin.mjs your-email@example.com YourPassword123
```

---

## 🌐 Cara 2: Menggunakan API Endpoint

### Langkah-langkah:

1. **Pastikan server sudah running**
   ```bash
   npm run dev
   ```

2. **Buka browser atau Postman**

3. **Kirim POST request ke:**
   ```
   http://localhost:3000/api/create-admin-user
   ```

4. **Admin akan dibuat dengan credentials:**
   - Email: `admin@progresta.com`
   - Password: `123456`
   - Role: `ADMIN`

5. **Login ke aplikasi**
   - Buka: `http://localhost:3000/login`
   - Email: `admin@progresta.com`
   - Password: `123456`

### Menggunakan curl:

```bash
curl -X POST http://localhost:3000/api/create-admin-user
```

### Menggunakan browser:

Buka URL ini di browser:
```
http://localhost:3000/api/create-admin-user
```

---

## 🗄️ Cara 3: Manual via Supabase Dashboard

### Langkah-langkah:

#### Step 1: Buat User di Supabase Auth

1. Buka Supabase Dashboard
2. Klik **"Authentication"** di sidebar
3. Klik **"Users"**
4. Klik tombol **"Add User"** atau **"Invite"**
5. Isi form:
   - Email: `admin@alwustho.com`
   - Password: `Admin123!`
   - Auto Confirm User: **✅ Centang**
6. Klik **"Create User"**
7. **Copy User ID** yang muncul (format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)

#### Step 2: Insert ke Database

1. Klik **"SQL Editor"** di sidebar Supabase
2. Copy-paste query ini (ganti `USER_ID_HERE` dengan ID dari step 1):

```sql
INSERT INTO users (
  id,
  email,
  role,
  status,
  "divisionId",
  "createdAt",
  "updatedAt"
) VALUES (
  'USER_ID_HERE', -- Ganti dengan User ID dari Auth
  'admin@alwustho.com',
  'ADMIN',
  'ACTIVE',
  NULL,
  NOW(),
  NOW()
);
```

3. Klik **"Run"** atau tekan `Ctrl+Enter`

#### Step 3: Verifikasi

Jalankan query ini untuk memastikan user sudah dibuat:

```sql
SELECT 
  id,
  email,
  role,
  status,
  "createdAt"
FROM users
WHERE email = 'admin@alwustho.com';
```

Seharusnya muncul 1 row dengan:
- email: `admin@alwustho.com`
- role: `ADMIN`
- status: `ACTIVE`

#### Step 4: Login

- Buka: `http://localhost:3000/login`
- Email: `admin@alwustho.com`
- Password: `Admin123!`

---

## 🔍 Troubleshooting

### Error: "User already exists"

Jika user sudah ada, cek statusnya:

```sql
SELECT id, email, role, status 
FROM users 
WHERE email = 'admin@alwustho.com';
```

Jika status bukan `ACTIVE`, update:

```sql
UPDATE users 
SET status = 'ACTIVE' 
WHERE email = 'admin@alwustho.com';
```

### Error: "Cannot login"

1. **Cek apakah user ada di Auth:**
   - Buka Supabase Dashboard → Authentication → Users
   - Cari email admin
   - Pastikan user ada dan email confirmed

2. **Cek apakah user ada di database:**
   ```sql
   SELECT * FROM users WHERE email = 'admin@alwustho.com';
   ```

3. **Reset password:**
   - Di Supabase Dashboard → Authentication → Users
   - Klik user admin
   - Klik "Send Password Recovery"
   - Atau klik "Reset Password" dan set password baru

### Error: "NEXT_PUBLIC_SUPABASE_URL not found"

Pastikan file `.env` ada dan berisi:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SESSION_SECRET=your_session_secret
```

---

## 📋 Daftar Admin Accounts

Setelah membuat admin, catat credentials di sini:

| Email | Password | Role | Status | Dibuat |
|-------|----------|------|--------|--------|
| admin@alwustho.com | Admin123! | ADMIN | ACTIVE | Script |
| admin@progresta.com | 123456 | ADMIN | ACTIVE | API |

---

## 🔐 Keamanan

**PENTING:** Setelah login pertama kali, segera ganti password!

1. Login sebagai admin
2. Klik "Profil Saya" di sidebar
3. Scroll ke bawah ke section "Keamanan"
4. Klik "Ubah Password"
5. Masukkan password baru yang kuat

**Password yang kuat:**
- Minimal 8 karakter
- Kombinasi huruf besar dan kecil
- Mengandung angka
- Mengandung simbol (!@#$%^&*)

---

## ✅ Verifikasi Admin Access

Setelah login sebagai admin, Anda seharusnya bisa:

- ✅ Melihat menu "Manajemen Personel"
- ✅ Melihat menu "Manajemen Divisi"
- ✅ Melihat menu "Manajemen Project"
- ✅ Membuat user baru (semua role)
- ✅ Edit semua user
- ✅ Hapus user (tombol Trash icon)
- ✅ Akses semua departemen
- ✅ Lihat semua laporan

Jika ada menu yang tidak muncul, logout dan login kembali.

---

## 📞 Bantuan

Jika masih ada masalah, kirim informasi berikut:

1. Screenshot error (jika ada)
2. Browser console log (F12 → Console)
3. Result query SQL verifikasi
4. Cara mana yang Anda gunakan (1, 2, atau 3)
