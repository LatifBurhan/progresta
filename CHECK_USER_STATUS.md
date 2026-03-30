# Cara Mengecek Status User

## Masalah
User baru yang dibuat oleh HRD tidak bisa klik apa-apa di dashboard.

## Kemungkinan Penyebab

### 1. User Status Bukan ACTIVE
User mungkin dibuat dengan status INACTIVE atau PENDING.

### 2. JavaScript Error
Ada error di browser console yang memblokir interaksi.

### 3. Data Tidak Ter-load
User metadata tidak tersimpan dengan benar.

---

## Cara Troubleshoot

### Step 1: Cek Browser Console

1. Buka browser (Chrome/Edge/Firefox)
2. Tekan `F12` atau `Ctrl+Shift+I` untuk buka Developer Tools
3. Klik tab "Console"
4. Lihat apakah ada error berwarna merah
5. Screenshot error tersebut jika ada

### Step 2: Cek Status User di Database

Jalankan query ini di Supabase SQL Editor:

```sql
-- Cek status user salma@gmail.com
SELECT 
  id,
  email,
  role,
  status,
  "divisionId",
  "createdAt"
FROM users
WHERE email = 'salma@gmail.com';
```

**Expected Result:**
```
status: 'ACTIVE'
role: 'KARYAWAN'
divisionId: (should have a UUID value)
```

**Jika status bukan ACTIVE**, update dengan query ini:

```sql
-- Update status user menjadi ACTIVE
UPDATE users
SET status = 'ACTIVE'
WHERE email = 'salma@gmail.com';
```

### Step 3: Cek User Metadata di Supabase Auth

1. Buka Supabase Dashboard
2. Klik "Authentication" di sidebar
3. Klik "Users"
4. Cari user `salma@gmail.com`
5. Klik user tersebut
6. Scroll ke bawah ke section "User Metadata"
7. Pastikan ada field:
   - `name`: "Salma" (atau nama yang diinput)
   - `phone`: (nomor telepon jika diisi)
   - `position`: (jabatan jika diisi)

**Jika metadata kosong**, user perlu dibuat ulang atau update manual.

### Step 4: Cek Network Tab

1. Buka Developer Tools (F12)
2. Klik tab "Network"
3. Refresh halaman dashboard
4. Lihat apakah ada request yang gagal (status code 4xx atau 5xx)
5. Klik request yang gagal untuk lihat detail error

---

## Solusi Cepat

### Solusi 1: Update Status User via SQL

```sql
-- Pastikan user ACTIVE
UPDATE users
SET status = 'ACTIVE'
WHERE email = 'salma@gmail.com';
```

### Solusi 2: Logout dan Login Ulang

1. Klik tombol logout
2. Login kembali dengan email dan password yang sama
3. Cek apakah dashboard sudah responsif

### Solusi 3: Hapus dan Buat Ulang User

Jika masih tidak bisa, hapus user dan buat ulang:

1. Login sebagai ADMIN
2. Buka "Manajemen Personel"
3. Cari user "salma@gmail.com"
4. Klik tombol hapus (Trash icon)
5. Konfirmasi dengan ketik "HAPUS"
6. Buat user baru dengan data yang sama

---

## Debugging Lanjutan

### Cek Session Cookie

Di browser console, jalankan:

```javascript
// Cek apakah ada session cookie
document.cookie
```

Seharusnya ada cookie dengan nama `session`.

### Cek Local Storage

```javascript
// Cek local storage
console.log(localStorage)
```

### Test API Endpoint

Buka URL ini di browser (ganti dengan user ID yang sebenarnya):

```
http://localhost:3000/api/admin/users/action
```

---

## Jika Masih Tidak Bisa

Kirim informasi berikut:

1. **Screenshot browser console** (tab Console)
2. **Screenshot network tab** (request yang gagal)
3. **Result query SQL** dari Step 2
4. **Screenshot user metadata** dari Supabase Auth
5. **Role user yang login** (KARYAWAN, PM, HRD, CEO, atau ADMIN)

Dengan informasi ini, saya bisa bantu troubleshoot lebih lanjut.

---

## Catatan Penting

- User yang dibuat oleh HRD/CEO/ADMIN seharusnya langsung ACTIVE
- User yang register sendiri akan PENDING dan perlu approval
- KARYAWAN hanya bisa akses dashboard, riwayat, dan profil sendiri
- KARYAWAN tidak bisa akses menu admin (user management, divisions, dll)
