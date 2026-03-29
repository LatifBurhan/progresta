# Auto Update Overdue Projects

Project yang melewati deadline (`tanggal_selesai`) akan otomatis berubah status dari **"Aktif"** menjadi **"Ditunda"**.

## Quick Setup

### 1. Jalankan Migration

```bash
# Jalankan di Supabase SQL Editor
# File: supabase/migrations/add_auto_update_overdue_projects.sql
```

### 2. Set Environment Variable di Vercel

```bash
CRON_SECRET=your-random-secret-key-here
```

### 3. Deploy

```bash
vercel --prod
```

## Testing

### Local (Development)

```bash
curl http://localhost:3000/api/cron/update-overdue-projects
```

### Production

```bash
curl -X POST https://your-domain.vercel.app/api/cron/update-overdue-projects \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Schedule

- **Waktu**: Setiap hari pukul 00:00 UTC (07:00 WIB)
- **Config**: `vercel.json`

## Kriteria Update

Project akan di-update jika:
- ✅ Status = "Aktif"
- ✅ `tanggal_selesai` < hari ini
- ✅ `isActive` = true

Status akan berubah: **Aktif** → **Ditunda**

## Dokumentasi Lengkap

Lihat [CRON_SETUP.md](./CRON_SETUP.md) untuk dokumentasi lengkap.
