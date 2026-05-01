# 🚀 Deployment Checklist - Performance Optimization

## Pre-Deployment Checklist

### ✅ 1. Database Preparation

- [ ] **Backup database** sebelum apply migration
  ```bash
  # Via Supabase Dashboard
  # Settings → Database → Backups → Create Backup
  ```

- [ ] **Apply performance indexes**
  ```bash
  # Option 1: Via Supabase CLI
  supabase migration up
  
  # Option 2: Via Supabase Dashboard
  # SQL Editor → Copy paste isi file:
  # supabase/migrations/add_performance_indexes.sql
  # → Execute
  ```

- [ ] **Verify indexes created**
  ```sql
  SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
  FROM pg_indexes 
  WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
  ORDER BY tablename, indexname;
  
  -- Should show 10+ new indexes
  ```

- [ ] **Test query performance**
  ```sql
  EXPLAIN ANALYZE
  SELECT * FROM project_reports 
  WHERE user_id = 'some-user-id' 
  ORDER BY created_at DESC 
  LIMIT 10;
  
  -- Should use idx_project_reports_user_created
  ```

### ✅ 2. Code Verification

- [ ] **No TypeScript errors**
  ```bash
  npm run build
  # Should complete without errors
  ```

- [ ] **Test optimized endpoints locally**
  ```bash
  npm run dev
  # Open http://localhost:3000/dashboard
  # Check DevTools → Network tab
  # Verify /api/dashboard/stats-optimized is called
  ```

- [ ] **Run performance tests**
  ```bash
  npm run test:performance
  # Should show 70-80% improvement
  ```

- [ ] **Check bundle size**
  ```bash
  npm run build
  # Check output for bundle sizes
  # Initial bundle should be < 300KB
  ```

### ✅ 3. Environment Variables

- [ ] **Verify all env vars set**
  ```bash
  # Check .env file
  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
  SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
  JWT_SECRET=your-secret-key
  ```

- [ ] **Test database connection**
  ```bash
  # Should connect successfully
  npm run dev
  # Check console for connection errors
  ```

### ✅ 4. Image Optimization

- [ ] **Verify Supabase Storage CORS**
  ```
  Supabase Dashboard → Storage → Settings → CORS
  Add your domain(s):
  - http://localhost:3000 (dev)
  - https://yourdomain.com (prod)
  ```

- [ ] **Test image loading**
  ```
  Open dashboard → Check images load
  DevTools → Network → Check for WebP/AVIF format
  ```

### ✅ 5. Testing

- [ ] **Test on desktop**
  - Dashboard loads < 1s
  - Charts render correctly
  - Modals open smoothly
  - Images load fast

- [ ] **Test on mobile**
  - DevTools → Toggle device toolbar
  - Select mobile device
  - Throttle to Fast 3G
  - Dashboard loads < 3s
  - Everything works smoothly

- [ ] **Test all user roles**
  - Admin dashboard
  - Regular user dashboard
  - Project management
  - Report creation

- [ ] **Check console for errors**
  - F12 → Console tab
  - Should be no errors

---

## Deployment Steps

### Option 1: Vercel Deployment

1. **Push to Git**
   ```bash
   git add .
   git commit -m "feat: performance optimization"
   git push origin main
   ```

2. **Vercel auto-deploys**
   - Wait for deployment to complete
   - Check deployment logs for errors

3. **Verify deployment**
   - Open production URL
   - Test dashboard loading
   - Check DevTools → Network tab
   - Verify optimized endpoints used

### Option 2: Manual Deployment

1. **Build production**
   ```bash
   npm run build
   ```

2. **Test production build locally**
   ```bash
   npm run start
   # Open http://localhost:3000
   # Test everything works
   ```

3. **Deploy to server**
   ```bash
   # Copy .next folder and dependencies
   # Start with: npm run start
   ```

---

## Post-Deployment Verification

### ✅ 1. Performance Check

- [ ] **Run Lighthouse audit**
  ```
  DevTools → Lighthouse → Analyze page load
  Target scores:
  - Performance: 85+
  - Accessibility: 90+
  - Best Practices: 90+
  - SEO: 90+
  ```

- [ ] **Check Core Web Vitals**
  ```
  DevTools → Performance → Record page load
  Verify:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
  ```

- [ ] **Test API response times**
  ```
  DevTools → Network tab
  Check:
  - /api/dashboard/stats-optimized < 500ms
  - /api/admin/project-activity-optimized < 400ms
  ```

### ✅ 2. Functionality Check

- [ ] **Dashboard**
  - Stats load correctly
  - Charts render properly
  - Filters work
  - Period switching works

- [ ] **Projects**
  - List loads fast
  - Modals open quickly
  - Create/Edit/Delete works
  - File uploads work

- [ ] **Reports**
  - List loads fast
  - Create report works
  - Image upload works
  - Edit/Delete works

- [ ] **Mobile**
  - Everything works on mobile
  - Touch interactions smooth
  - Images load properly

### ✅ 3. Monitoring Setup

- [ ] **Enable Vercel Analytics** (if using Vercel)
  ```
  Vercel Dashboard → Your Project → Analytics
  Enable Web Analytics
  ```

- [ ] **Monitor Supabase**
  ```
  Supabase Dashboard → Database → Query Performance
  Check for slow queries
  Verify indexes being used
  ```

- [ ] **Set up alerts**
  ```
  Configure alerts for:
  - High API response times
  - Database query errors
  - High error rates
  ```

---

## Rollback Plan

### If something goes wrong:

1. **Revert code changes**
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Switch back to old endpoints**
   ```typescript
   // In app/dashboard/DashboardClient.tsx
   // Change:
   const res = await fetch(`/api/dashboard/stats-optimized?...`)
   // Back to:
   const res = await fetch(`/api/dashboard/stats?...`)
   ```

3. **Remove indexes** (if causing issues)
   ```sql
   DROP INDEX IF EXISTS idx_project_reports_user_created;
   DROP INDEX IF EXISTS idx_project_reports_project_created;
   -- etc...
   ```

4. **Restore database backup**
   ```
   Supabase Dashboard → Settings → Database → Backups
   → Restore from backup
   ```

---

## Success Criteria

Deployment is successful if:

- ✅ Dashboard loads in < 1 second
- ✅ No console errors
- ✅ All features working
- ✅ Lighthouse score > 85
- ✅ API response times < 500ms
- ✅ Images loading properly
- ✅ Mobile performance good
- ✅ No increase in error rates

---

## Monitoring (First 24 Hours)

### Check every 2-4 hours:

1. **Error rates**
   - Vercel Dashboard → Logs
   - Check for new errors

2. **Performance metrics**
   - Vercel Analytics → Web Vitals
   - Check LCP, FID, CLS

3. **Database performance**
   - Supabase Dashboard → Query Performance
   - Check for slow queries

4. **User feedback**
   - Monitor support channels
   - Check for complaints

---

## Troubleshooting

### Dashboard slow after deployment?

1. Check indexes applied:
   ```sql
   SELECT * FROM pg_stat_user_indexes 
   WHERE schemaname = 'public';
   ```

2. Check optimized endpoints used:
   ```
   DevTools → Network → Check API calls
   Should see /stats-optimized not /stats
   ```

3. Clear CDN cache (if using):
   ```bash
   # Vercel
   vercel --prod --force
   ```

### Images not loading?

1. Check CORS settings in Supabase Storage
2. Verify image URLs accessible
3. Check Next.js image config in next.config.mjs

### High error rates?

1. Check Vercel logs for errors
2. Check Supabase logs for database errors
3. Rollback if critical

---

## Contact

If issues persist:
1. Check documentation files
2. Run diagnostics: `npm run test:performance`
3. Check browser console for errors
4. Review deployment logs

---

**Good luck with deployment! 🚀**
