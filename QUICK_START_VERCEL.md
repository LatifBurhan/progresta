# 🚀 Quick Start - Deploy ke Vercel

Panduan singkat untuk deploy aplikasi ini ke Vercel dalam 5 menit.

## Step 1: Persiapan (2 menit)

### 1.1 Dapatkan Supabase Credentials

1. Login ke [supabase.com/dashboard](https://supabase.com/dashboard)
2. Pilih/buat project
3. Pergi ke **Settings** > **API**
4. Copy 3 nilai ini:
   ```
   Project URL          → NEXT_PUBLIC_SUPABASE_URL
   anon/public key      → NEXT_PUBLIC_SUPABASE_ANON_KEY
   service_role key     → SUPABASE_SERVICE_ROLE_KEY
   ```

### 1.2 Generate Secret Keys

Jalankan command ini 2x untuk generate 2 secret keys:

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**Linux/Mac:**
```bash
openssl rand -base64 32
```

Simpan hasil:
- Hasil pertama → `SESSION_SECRET`
- Hasil kedua → `CRON_SECRET`

### 1.3 Tentukan Registration Token

Buat token sederhana (contoh: `mycompany2024` atau `123`)
- Simpan sebagai → `REGISTRATION_TOKEN`

## Step 2: Deploy ke Vercel (3 menit)

### 2.1 Import Project

1. Kunjungi [vercel.com/new](https://vercel.com/new)
2. Login dengan GitHub
3. Pilih repository ini
4. Klik **Import**

### 2.2 Configure

1. **Root Directory:** Ketik `template` ⚠️ (PENTING!)
2. **Framework:** Next.js (auto-detected)
3. Klik **Continue**

### 2.3 Add Environment Variables

Tambahkan 6 variables ini (copy dari Step 1):

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://xxx.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJhbGc... |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJhbGc... |
| `SESSION_SECRET` | Generated secret 1 |
| `CRON_SECRET` | Generated secret 2 |
| `REGISTRATION_TOKEN` | Your token |

### 2.4 Deploy

1. Klik **Deploy**
2. Tunggu 2-3 menit
3. ✅ Done! Aplikasi Anda live!

## Step 3: Verifikasi

1. Klik **Visit** untuk buka aplikasi
2. Tambahkan `/login` di URL
3. Test login dengan admin account

## 🎉 Selesai!

Aplikasi Anda sekarang sudah live di:
```
https://your-project.vercel.app
```

## Next Steps

- [ ] Setup database migrations di Supabase
- [ ] Create admin account
- [ ] Test semua fitur
- [ ] (Optional) Add custom domain

## Troubleshooting

**Build failed?**
- Check semua environment variables sudah benar
- Pastikan Root Directory = `template`

**Can't login?**
- Check Supabase credentials
- Pastikan database migrations sudah dijalankan

**Need help?**
- Baca [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) untuk panduan lengkap
- Check [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

---

**Total Time:** ~5 menit
**Difficulty:** Easy 🟢
