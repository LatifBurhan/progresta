# ✅ Deployment Checklist

Gunakan checklist ini untuk memastikan deployment Anda berjalan lancar.

## Pre-Deployment

- [ ] **Database Setup**
  - [ ] Supabase project sudah dibuat
  - [ ] Semua migrations sudah dijalankan
  - [ ] RLS policies sudah dikonfigurasi
  - [ ] Storage buckets sudah dibuat (`avatars`, `project-attachments`)
  - [ ] Storage policies sudah dikonfigurasi

- [ ] **Environment Variables**
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` sudah didapat
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` sudah didapat
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` sudah didapat
  - [ ] `SESSION_SECRET` sudah digenerate
  - [ ] `REGISTRATION_TOKEN` sudah ditentukan
  - [ ] `CRON_SECRET` sudah digenerate
  - [ ] `GROQ_API_KEY` sudah didapat (optional)

- [ ] **Local Testing**
  - [ ] `npm install` berhasil
  - [ ] `npm run build` berhasil tanpa error
  - [ ] `npm run dev` berjalan dengan baik
  - [ ] Login/logout berfungsi
  - [ ] CRUD operations berfungsi
  - [ ] File upload berfungsi

## Deployment

- [ ] **Vercel Setup**
  - [ ] Repository sudah di-push ke GitHub
  - [ ] Project sudah di-import ke Vercel
  - [ ] Root directory set ke `template`
  - [ ] Semua environment variables sudah ditambahkan
  - [ ] Build berhasil tanpa error

- [ ] **Post-Deployment Verification**
  - [ ] Website bisa diakses
  - [ ] Login page berfungsi
  - [ ] Tidak ada error di browser console
  - [ ] API endpoints berfungsi
  - [ ] Database connection berfungsi

## Post-Deployment

- [ ] **Functional Testing**
  - [ ] Login dengan admin account
  - [ ] Create user baru
  - [ ] Create project baru
  - [ ] Create report baru
  - [ ] Upload file/foto
  - [ ] Edit data
  - [ ] Delete data

- [ ] **PWA Testing**
  - [ ] Service worker terdaftar
  - [ ] "Add to Home Screen" muncul
  - [ ] Offline page berfungsi
  - [ ] Icons tampil dengan benar

- [ ] **Performance Check**
  - [ ] Page load time < 3 detik
  - [ ] Images ter-optimize
  - [ ] No console errors
  - [ ] No console warnings (yang critical)

- [ ] **Security Check**
  - [ ] HTTPS enabled
  - [ ] Environment variables tidak ter-expose
  - [ ] RLS policies aktif
  - [ ] Admin endpoints protected
  - [ ] Cron endpoints protected dengan CRON_SECRET

## Optional

- [ ] **Custom Domain**
  - [ ] Domain sudah dibeli
  - [ ] Domain sudah ditambahkan di Vercel
  - [ ] DNS records sudah dikonfigurasi
  - [ ] SSL certificate aktif

- [ ] **Monitoring**
  - [ ] Vercel Analytics enabled
  - [ ] Error tracking setup
  - [ ] Performance monitoring setup

- [ ] **Documentation**
  - [ ] User guide dibuat
  - [ ] Admin guide dibuat
  - [ ] API documentation dibuat

## Troubleshooting Quick Reference

| Error | Solution |
|-------|----------|
| "supabaseUrl is required" | Check environment variables di Vercel |
| Build failed | Check build logs, test `npm run build` locally |
| 500 Internal Server Error | Check Supabase credentials & RLS policies |
| Images not loading | Check Storage bucket permissions |
| PWA not working | Check HTTPS & service worker registration |

## Emergency Rollback

Jika deployment bermasalah:

1. **Via Vercel Dashboard:**
   - Deployments > Previous Deployment > Promote to Production

2. **Via CLI:**
   ```bash
   vercel rollback
   ```

## Support Contacts

- Vercel Support: https://vercel.com/support
- Supabase Support: https://supabase.com/support
- Next.js Docs: https://nextjs.org/docs

---

**Last Updated:** 2024
**Version:** 1.0.0
