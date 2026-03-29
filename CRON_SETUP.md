# Setup Cron Job - Auto Update Overdue Projects

Sistem ini secara otomatis mengubah status project dari "Aktif" menjadi "Ditunda" ketika melewati `tanggal_selesai`.

## 📋 Cara Kerja

1. **Cron job berjalan setiap hari** pada pukul 00:00 UTC (07:00 WIB)
2. **Mencari project** dengan kriteria:
   - Status = "Aktif"
   - `tanggal_selesai` < hari ini
   - `isActive` = true
3. **Update status** menjadi "Ditunda"
4. **Log hasil** update ke console

## 🚀 Setup di Vercel

### 1. Jalankan Migration Database

Jalankan migration untuk membuat function di Supabase:

```bash
# Jalankan migration file
# File: supabase/migrations/add_auto_update_overdue_projects.sql
```

Atau jalankan SQL berikut di Supabase SQL Editor:

```sql
-- Copy isi dari file add_auto_update_overdue_projects.sql
```

### 2. Set Environment Variable

Tambahkan `CRON_SECRET` di Vercel Dashboard:

1. Buka project di Vercel Dashboard
2. Settings → Environment Variables
3. Tambahkan variable baru:
   - **Name**: `CRON_SECRET`
   - **Value**: Generate random string (contoh: `your-secret-key-here-123`)
   - **Environment**: Production, Preview, Development

Atau generate random secret:

```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Deploy ke Vercel

File `vercel.json` sudah dikonfigurasi dengan cron schedule:

```json
{
  "crons": [
    {
      "path": "/api/cron/update-overdue-projects",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**Schedule**: `0 0 * * *` = Setiap hari pukul 00:00 UTC (07:00 WIB)

Deploy project:

```bash
vercel --prod
```

### 4. Verifikasi Cron Job

Setelah deploy, cek di Vercel Dashboard:

1. Project → Settings → Crons
2. Pastikan cron job muncul dengan schedule yang benar
3. Lihat log execution di Vercel Logs

## 🧪 Testing Manual

### Development (Local)

Untuk testing di local, panggil endpoint tanpa auth:

```bash
# GET request (hanya di development)
curl http://localhost:3000/api/cron/update-overdue-projects
```

### Production

Untuk testing di production, gunakan CRON_SECRET:

```bash
# POST request dengan authorization
curl -X POST https://your-domain.vercel.app/api/cron/update-overdue-projects \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Response:

```json
{
  "success": true,
  "updated_count": 3,
  "updated_project_ids": ["uuid-1", "uuid-2", "uuid-3"],
  "timestamp": "2024-01-15T00:00:00.000Z"
}
```

## 📊 Monitoring

### Cek Log di Vercel

1. Vercel Dashboard → Project → Logs
2. Filter by: `/api/cron/update-overdue-projects`
3. Lihat output: `[CRON] Updated X overdue projects`

### Cek di Database

Query untuk cek project yang akan di-update:

```sql
SELECT 
  id, 
  name, 
  status, 
  tanggal_selesai,
  CURRENT_DATE - tanggal_selesai as days_overdue
FROM projects
WHERE 
  status = 'Aktif'
  AND tanggal_selesai < CURRENT_DATE
  AND "isActive" = true;
```

## 🔧 Troubleshooting

### Cron tidak berjalan

1. Pastikan `vercel.json` ada di root project
2. Pastikan sudah deploy ke production
3. Cek Vercel Dashboard → Settings → Crons

### Error "Unauthorized"

1. Pastikan `CRON_SECRET` sudah di-set di Vercel
2. Pastikan header Authorization benar: `Bearer YOUR_SECRET`

### Function tidak ditemukan

1. Pastikan migration sudah dijalankan di Supabase
2. Cek di Supabase SQL Editor: `SELECT * FROM pg_proc WHERE proname = 'update_overdue_projects';`

## 📝 Customization

### Ubah Schedule

Edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/update-overdue-projects",
      "schedule": "0 */6 * * *"  // Setiap 6 jam
    }
  ]
}
```

Cron syntax:
- `0 0 * * *` = Setiap hari pukul 00:00
- `0 */6 * * *` = Setiap 6 jam
- `0 12 * * *` = Setiap hari pukul 12:00
- `0 0 * * 1` = Setiap Senin pukul 00:00

### Ubah Status Target

Edit migration SQL, ganti `'Ditunda'` dengan status lain:

```sql
UPDATE projects
SET status = 'Non-Aktif'  -- Ganti dengan status yang diinginkan
WHERE ...
```

## 🔐 Security

- Endpoint dilindungi dengan `CRON_SECRET`
- Hanya Vercel Cron atau request dengan secret yang valid yang bisa akses
- Function database menggunakan `SECURITY DEFINER` untuk bypass RLS
- GET method hanya tersedia di development mode

## 📚 Resources

- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs)
- [Cron Expression Generator](https://crontab.guru/)
- [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)
