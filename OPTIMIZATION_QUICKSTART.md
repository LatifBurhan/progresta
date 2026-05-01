# 🚀 Performance Optimization - Quick Start Guide

## Langkah-langkah Implementasi

### 1️⃣ Apply Database Indexes (PENTING!)

Jalankan migration untuk menambahkan indexes:

```bash
# Jika menggunakan Supabase CLI
supabase migration up

# Atau apply manual via Supabase Dashboard
# Copy isi file: supabase/migrations/add_performance_indexes.sql
# Paste di SQL Editor dan Execute
```

**Verifikasi indexes berhasil:**
```sql
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;
```

### 2️⃣ Test Performance

```bash
# Install dependencies (jika belum)
npm install

# Start development server
npm run dev

# Di terminal lain, test performance
npm run test:performance
```

**Expected Output:**
```
✓ Dashboard Stats (Old): 2500ms
✓ Dashboard Stats (Optimized): 400ms
✓ Project Activity (Old): 1800ms
✓ Project Activity (Optimized): 300ms

Dashboard Stats Improvement: 84% faster
Project Activity Improvement: 83% faster
```

### 3️⃣ Verify in Browser

1. **Open DevTools** (F12)
2. **Go to Network tab**
3. **Navigate to Dashboard** (`/dashboard`)
4. **Check:**
   - ✅ `/api/dashboard/stats-optimized` dipanggil (bukan `/stats`)
   - ✅ Response time < 500ms
   - ✅ Bundle size < 300KB initial load
   - ✅ Images loading dengan format WebP/AVIF

### 4️⃣ Test on Mobile

1. **Open DevTools** → **Toggle device toolbar** (Ctrl+Shift+M)
2. **Select mobile device** (e.g., iPhone 12)
3. **Throttle network** → **Fast 3G**
4. **Reload page** (Ctrl+R)
5. **Check:**
   - ✅ Page loads < 3 seconds
   - ✅ Charts render smoothly
   - ✅ Modals open quickly

## 📊 Performance Checklist

### Before Deployment:

- [ ] Database indexes applied
- [ ] Performance test passed
- [ ] Browser DevTools shows optimized endpoints
- [ ] Mobile performance acceptable
- [ ] No console errors
- [ ] Images loading correctly
- [ ] Modals opening smoothly
- [ ] Charts rendering properly

### After Deployment:

- [ ] Monitor API response times
- [ ] Check error rates
- [ ] Verify cache hit rates
- [ ] Monitor database query times
- [ ] Check Lighthouse scores

## 🎯 Expected Results

### Lighthouse Scores (Target):

- **Performance**: 85+ (was 50-60)
- **Accessibility**: 90+
- **Best Practices**: 90+
- **SEO**: 90+

### Core Web Vitals:

- **LCP** (Largest Contentful Paint): < 2.5s (was 4-6s)
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### API Response Times:

- **Dashboard Stats**: < 500ms (was 2-3s)
- **Project Activity**: < 400ms (was 1-2s)
- **Report List**: < 300ms

## 🔧 Troubleshooting

### Dashboard masih lambat?

1. **Check indexes:**
   ```sql
   SELECT * FROM pg_stat_user_indexes 
   WHERE schemaname = 'public';
   ```

2. **Check endpoint:**
   - Pastikan menggunakan `/api/dashboard/stats-optimized`
   - Bukan `/api/dashboard/stats`

3. **Clear cache:**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

### Images tidak load?

1. **Check Supabase Storage CORS:**
   ```sql
   -- Di Supabase Dashboard → Storage → Settings
   -- Add CORS policy untuk domain Anda
   ```

2. **Check image URLs:**
   - Pastikan URL accessible
   - Test di browser langsung

3. **Check Next.js config:**
   - Verify `remotePatterns` di `next.config.mjs`

### Modals tidak buka?

1. **Check console errors:**
   - F12 → Console tab
   - Look for lazy load errors

2. **Check Suspense:**
   - Verify Suspense boundaries ada
   - Check fallback components

3. **Clear browser cache:**
   - Ctrl+Shift+Delete
   - Clear cached images and files

## 📈 Monitoring

### Development:

```bash
# Watch bundle size
npm run build

# Check for large dependencies
npx next-bundle-analyzer
```

### Production:

1. **Supabase Dashboard:**
   - Monitor query performance
   - Check slow queries
   - Verify index usage

2. **Vercel Analytics** (jika deploy di Vercel):
   - Monitor Core Web Vitals
   - Check API response times
   - Track error rates

3. **Browser DevTools:**
   - Network tab untuk API calls
   - Performance tab untuk profiling
   - Lighthouse untuk scores

## 🎉 Success Indicators

Anda berhasil jika:

- ✅ Dashboard load < 1 detik
- ✅ Modal open < 200ms
- ✅ Images load < 500ms
- ✅ No console errors
- ✅ Smooth scrolling
- ✅ Fast on mobile
- ✅ Lighthouse score > 85

## 📞 Need Help?

Jika masih ada masalah:

1. Check `PERFORMANCE_OPTIMIZATION.md` untuk detail lengkap
2. Run `npm run test:performance` untuk diagnostics
3. Check browser console untuk errors
4. Verify database migrations applied

---

**Happy Optimizing! 🚀**
