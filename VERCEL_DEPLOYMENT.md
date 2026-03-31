# Panduan Deployment ke Vercel

## 🚀 Quick Start

### Cara Tercepat (Recommended)

1. **Fork/Clone repository ini**
2. **Push ke GitHub Anda**
3. **Import ke Vercel:**
   - Kunjungi [vercel.com/new](https://vercel.com/new)
   - Pilih repository Anda
   - Set Root Directory ke `template`
   - Tambahkan environment variables (lihat di bawah)
   - Klik Deploy

## 📋 Environment Variables yang Diperlukan

### Wajib (REQUIRED)

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]

# Session & Security
SESSION_SECRET=[RANDOM-SECRET-STRING]
REGISTRATION_TOKEN=[YOUR-REGISTRATION-TOKEN]
CRON_SECRET=[YOUR-CRON-SECRET]
```

### Optional

```bash
# AI Features (Optional)
GROQ_API_KEY=[YOUR-GROQ-API-KEY]
```

## 🔑 Cara Mendapatkan Credentials

### 1. Supabase Credentials

1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda (atau buat baru)
3. Pergi ke **Settings** > **API**
4. Copy nilai berikut:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ (Keep this secret!)

### 2. Generate Secret Keys

Untuk `SESSION_SECRET` dan `CRON_SECRET`, generate random string:

**Linux/Mac:**
```bash
openssl rand -base64 32
```

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

**Node.js (semua platform):**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Registration Token

Buat token sederhana untuk registrasi user (contoh: `mycompany2024` atau `123`). Token ini akan digunakan untuk membuat link registrasi.

## 🎯 Langkah-langkah Deployment Detail

### Opsi A: Deploy via Vercel Dashboard (Recommended)

1. **Login ke Vercel**
   - Kunjungi [vercel.com](https://vercel.com)
   - Login dengan GitHub account

2. **Import Project**
   - Klik "Add New..." > "Project"
   - Pilih repository GitHub Anda
   - Klik "Import"

3. **Configure Project**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `template` ⚠️ (PENTING!)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

4. **Add Environment Variables**
   - Scroll ke bagian "Environment Variables"
   - Tambahkan semua variables dari section di atas
   - Pilih environment: Production, Preview, Development (atau sesuai kebutuhan)

5. **Deploy**
   - Klik "Deploy"
   - Tunggu proses build selesai (±2-3 menit)
   - Aplikasi Anda akan live di `https://your-project.vercel.app`

### Opsi B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy dari folder template**
   ```bash
   cd template
   vercel
   ```

4. **Atau deploy langsung ke production**
   ```bash
   cd template
   vercel --prod
   ```

### Opsi C: Automated Setup (Advanced)

Gunakan script yang sudah disediakan:

**Linux/Mac:**
```bash
cd template
chmod +x scripts/setup-vercel-env.sh
./scripts/setup-vercel-env.sh
```

**Windows PowerShell:**
```powershell
cd template
.\scripts\setup-vercel-env.ps1
```

## ✅ Verifikasi Deployment

Setelah deployment selesai:

1. **Buka URL Vercel Anda**
   ```
   https://your-project.vercel.app
   ```

2. **Test Login Page**
   ```
   https://your-project.vercel.app/login
   ```

3. **Check Console**
   - Buka Browser DevTools (F12)
   - Pastikan tidak ada error di Console
   - Check Network tab untuk API calls

4. **Test PWA**
   - Buka di mobile browser
   - Klik "Add to Home Screen"
   - Test offline functionality

## 🔧 Troubleshooting

### ❌ Error: "supabaseUrl is required"

**Penyebab:** Environment variables tidak tersedia saat build

**Solusi:**
1. Pastikan semua env vars sudah ditambahkan di Vercel Dashboard
2. Pergi ke **Project Settings** > **Environment Variables**
3. Pastikan variables ada untuk environment "Production"
4. Redeploy: **Deployments** > **...** > **Redeploy**

### ❌ Error: Build Failed

**Solusi:**
1. Check build logs di Vercel dashboard
2. Test build locally:
   ```bash
   cd template
   npm install
   npm run build
   ```
3. Fix errors yang muncul
4. Push changes ke GitHub (auto-redeploy)

### ❌ Error: 500 Internal Server Error

**Penyebab:** Database connection atau RLS policies

**Solusi:**
1. Check Supabase credentials benar
2. Pastikan database migrations sudah dijalankan
3. Check RLS policies di Supabase
4. Check logs: Vercel Dashboard > Deployments > [Your Deployment] > Functions

### ❌ PWA Tidak Berfungsi

**Solusi:**
1. Pastikan HTTPS enabled (Vercel otomatis provide)
2. Check service worker: DevTools > Application > Service Workers
3. Clear cache dan reload
4. Check `public/sw.js` exists

### ❌ Images Tidak Load

**Solusi:**
1. Check Supabase Storage bucket permissions
2. Pastikan bucket `avatars` dan `project-attachments` sudah dibuat
3. Set bucket policies ke public read

## 🔄 Update Deployment

### Auto Deploy (Recommended)

Setiap push ke branch `main` akan otomatis trigger rebuild dan redeploy.

```bash
git add .
git commit -m "Update feature"
git push origin main
```

### Manual Redeploy

Via Dashboard:
1. Pergi ke **Deployments**
2. Klik **...** pada deployment terakhir
3. Klik **Redeploy**

Via CLI:
```bash
cd template
vercel --prod
```

## 🌐 Custom Domain (Optional)

1. **Beli domain** (dari Namecheap, GoDaddy, dll)

2. **Add domain di Vercel:**
   - Project Settings > Domains
   - Klik "Add"
   - Masukkan domain Anda

3. **Update DNS Records:**
   - Vercel akan memberikan DNS records
   - Login ke domain provider Anda
   - Tambahkan records yang diberikan
   - Tunggu DNS propagation (24-48 jam)

4. **SSL Certificate:**
   - Vercel otomatis provide SSL certificate
   - HTTPS akan aktif setelah DNS propagation selesai

## 📊 Monitoring & Analytics

### Vercel Analytics

1. Enable di Project Settings > Analytics
2. Monitor:
   - Page views
   - User sessions
   - Performance metrics
   - Error rates

### Logs

Check logs untuk debugging:
```
Vercel Dashboard > Deployments > [Your Deployment] > Logs
```

Filter by:
- Build logs
- Function logs
- Static logs

### Performance

Monitor performance:
```
Vercel Dashboard > Speed Insights
```

Metrics:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Cumulative Layout Shift (CLS)

## 🔒 Security Best Practices

1. **Never commit `.env` files**
   ```bash
   # Already in .gitignore
   .env
   .env.local
   .env.production
   ```

2. **Rotate secrets regularly**
   - Generate new SESSION_SECRET setiap 3-6 bulan
   - Update di Vercel Dashboard

3. **Use environment-specific variables**
   - Development: `.env.local`
   - Production: Vercel Dashboard

4. **Protect sensitive endpoints**
   - Cron endpoints: Check `CRON_SECRET`
   - Admin endpoints: Check user role

5. **Enable Vercel Authentication** (Optional)
   - Project Settings > Authentication
   - Add password protection untuk preview deployments

## 📱 PWA Configuration

PWA sudah dikonfigurasi dan akan otomatis aktif setelah deployment:

- ✅ Service Worker: `/sw.js`
- ✅ Offline fallback: `/offline`
- ✅ Manifest: Auto-generated
- ✅ Icons: Di folder `public/`

Test PWA:
1. Buka di Chrome mobile
2. Klik menu > "Add to Home Screen"
3. Test offline mode (airplane mode)

## 🎉 Selesai!

Aplikasi Anda sekarang sudah live di Vercel dengan:
- ✅ Auto-deploy dari GitHub
- ✅ HTTPS enabled
- ✅ PWA support
- ✅ Global CDN
- ✅ Automatic scaling
- ✅ Zero configuration

## 📚 Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

## 💬 Support

Jika mengalami masalah:
1. Check troubleshooting section di atas
2. Check Vercel logs
3. Check Supabase logs
4. Open issue di GitHub repository

---

**Happy Deploying! 🚀**
