# 📦 Deployment Guide - Progresta

Panduan lengkap untuk deploy aplikasi Progresta ke production.

## 📚 Dokumentasi

Pilih panduan sesuai kebutuhan Anda:

### 🚀 Quick Start (5 menit)
**[QUICK_START_VERCEL.md](./QUICK_START_VERCEL.md)**
- Panduan singkat deploy ke Vercel
- Untuk yang sudah familiar dengan Vercel
- Langkah-langkah minimal

### 📖 Complete Guide (15 menit)
**[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)**
- Panduan lengkap deployment
- Troubleshooting detail
- Best practices
- Monitoring & analytics

### 🗄️ Database Setup (20 menit)
**[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**
- Setup Supabase database
- Run migrations
- Configure storage
- Create admin account

### ✅ Deployment Checklist
**[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)**
- Pre-deployment checklist
- Post-deployment verification
- Testing checklist
- Troubleshooting quick reference

## 🎯 Recommended Flow

Untuk deployment pertama kali, ikuti urutan ini:

```
1. SUPABASE_SETUP.md
   ↓
2. QUICK_START_VERCEL.md
   ↓
3. DEPLOYMENT_CHECKLIST.md
   ↓
4. ✅ Done!
```

Jika ada masalah, baca **VERCEL_DEPLOYMENT.md** untuk troubleshooting detail.

## 🛠️ Tools & Scripts

### Setup Scripts

**Windows PowerShell:**
```powershell
.\scripts\setup-vercel-env.ps1
```

**Linux/Mac:**
```bash
chmod +x scripts/setup-vercel-env.sh
./scripts/setup-vercel-env.sh
```

### Build Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start production server (local)
npm start

# Development server
npm run dev
```

## 📋 Requirements

### Accounts Needed
- ✅ GitHub account (untuk repository)
- ✅ Vercel account (untuk hosting)
- ✅ Supabase account (untuk database)

### Optional
- ⭕ Groq account (untuk AI features)
- ⭕ Custom domain (untuk branding)

## 🔑 Environment Variables

### Required (6 variables)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
SESSION_SECRET=generated-secret-1
CRON_SECRET=generated-secret-2
REGISTRATION_TOKEN=your-token
```

### Optional (1 variable)

```bash
GROQ_API_KEY=gsk_...
```

## 🚨 Common Issues

| Issue | Quick Fix |
|-------|-----------|
| Build failed | Check environment variables |
| Can't login | Check Supabase credentials |
| 500 error | Check database migrations |
| Images not loading | Check storage buckets |
| PWA not working | Check HTTPS enabled |

Untuk detail, lihat **VERCEL_DEPLOYMENT.md** > Troubleshooting section.

## 📊 Deployment Platforms

### Supported ✅
- **Vercel** (Recommended) - Zero config, auto-deploy
- **Netlify** - Similar to Vercel
- **Railway** - Good for full-stack apps
- **Render** - Free tier available

### Not Tested ⚠️
- AWS Amplify
- Google Cloud Run
- Azure Static Web Apps

## 🔒 Security Checklist

Before going to production:

- [ ] All environment variables set correctly
- [ ] `.env` files not committed to Git
- [ ] Supabase RLS policies enabled
- [ ] Admin endpoints protected
- [ ] Cron endpoints use CRON_SECRET
- [ ] HTTPS enabled (auto on Vercel)
- [ ] Strong passwords for admin accounts
- [ ] Regular security updates

## 📈 Performance Tips

- ✅ Images auto-optimized by Next.js
- ✅ PWA enabled for offline support
- ✅ Static pages pre-rendered
- ✅ API routes cached where appropriate
- ✅ CDN enabled (auto on Vercel)

## 🎉 After Deployment

### Immediate Tasks
1. Test login functionality
2. Create test users
3. Create test projects
4. Upload test files
5. Verify all CRUD operations

### Within 24 Hours
1. Monitor error logs
2. Check performance metrics
3. Test on mobile devices
4. Test PWA installation
5. Verify email notifications (if enabled)

### Within 1 Week
1. Setup monitoring alerts
2. Configure backup strategy
3. Document admin procedures
4. Train users
5. Collect feedback

## 📞 Support

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)

### Community
- [Next.js Discord](https://discord.gg/nextjs)
- [Vercel Discord](https://discord.gg/vercel)
- [Supabase Discord](https://discord.supabase.com)

### Issues
- Check existing issues in repository
- Create new issue with:
  - Error message
  - Steps to reproduce
  - Environment details
  - Screenshots if applicable

## 🎓 Learning Resources

### Video Tutorials
- [Vercel Deployment Basics](https://vercel.com/docs/getting-started-with-vercel)
- [Supabase Crash Course](https://supabase.com/docs/guides/getting-started)
- [Next.js 15 Tutorial](https://nextjs.org/learn)

### Articles
- [Deploying Next.js Apps](https://nextjs.org/docs/deployment)
- [Supabase Best Practices](https://supabase.com/docs/guides/platform/best-practices)
- [PWA Implementation](https://web.dev/progressive-web-apps/)

## 📝 Version History

- **v1.0.0** - Initial deployment guide
  - Vercel deployment
  - Supabase setup
  - PWA configuration

## 🤝 Contributing

Found an issue or want to improve the docs?
1. Fork the repository
2. Make your changes
3. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Ready to deploy?** Start with [QUICK_START_VERCEL.md](./QUICK_START_VERCEL.md)!

**Need help?** Check [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed guide.

**First time?** Follow the complete flow above.

---

**Last Updated:** 2024
**Maintained by:** Progresta Team
