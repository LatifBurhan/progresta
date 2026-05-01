# 🔄 Migration Guide - Performance Optimization

## Untuk Developer Team

Panduan ini menjelaskan perubahan yang dilakukan dan cara menggunakannya.

---

## 📋 Apa yang Berubah?

### 1. API Endpoints (NEW)

**Endpoint baru yang lebih cepat:**

```typescript
// OLD (masih berfungsi, tapi lambat)
/api/dashboard/stats
/api/admin/project-activity

// NEW (optimized, 70-80% lebih cepat)
/api/dashboard/stats-optimized
/api/admin/project-activity-optimized
```

**Cara menggunakan:**

```typescript
// Dashboard stats
const res = await fetch(`/api/dashboard/stats-optimized?period=day&user_id=xxx`)

// Project activity
const res = await fetch(`/api/admin/project-activity-optimized?period=30`)
```

**Response format:** Sama persis dengan endpoint lama, tidak ada breaking changes.

### 2. Component Imports (CHANGED)

**Sebelum:**

```typescript
import { RealtimeReportsTable } from '@/components/admin/RealtimeReportsTable'
import CreateProjectModal from './CreateProjectModal'
import { AreaChart, PieChart } from 'recharts'
```

**Sesudah:**

```typescript
// Lazy load heavy components
const RealtimeReportsTable = lazy(() => 
  import('@/components/admin/RealtimeReportsTable').then(mod => ({ default: mod.RealtimeReportsTable }))
)

const CreateProjectModal = lazy(() => import('./CreateProjectModal'))

const AreaChart = lazy(() => import('recharts').then(mod => ({ default: mod.AreaChart })))
```

**Cara menggunakan:**

```typescript
// Wrap dengan Suspense
<Suspense fallback={<Loader />}>
  <RealtimeReportsTable />
</Suspense>
```

### 3. Image Component (CHANGED)

**Sebelum:**

```typescript
<Image src={url} alt="photo" fill unoptimized />
```

**Sesudah:**

```typescript
<Image 
  src={url} 
  alt="photo" 
  fill 
  sizes="96px"  // Add sizes hint
  quality={75}  // Optimize quality
  // Remove unoptimized flag
/>
```

### 4. Database Indexes (NEW)

**10+ indexes ditambahkan untuk speed up queries:**

```sql
-- User + date queries
idx_project_reports_user_created

-- Project queries
idx_project_reports_project_created

-- Assignment queries
idx_project_assignments_user

-- Dan lainnya...
```

**Tidak perlu perubahan code**, indexes bekerja otomatis.

---

## 🚀 Cara Menggunakan Optimasi

### Untuk Dashboard Components

**Pattern lama (lambat):**

```typescript
'use client'

import { AreaChart } from 'recharts'

export function MyDashboard() {
  return <AreaChart data={data} />
}
```

**Pattern baru (cepat):**

```typescript
'use client'

import { lazy, Suspense } from 'react'

const AreaChart = lazy(() => 
  import('recharts').then(mod => ({ default: mod.AreaChart }))
)

export function MyDashboard() {
  return (
    <Suspense fallback={<div>Loading chart...</div>}>
      <AreaChart data={data} />
    </Suspense>
  )
}
```

### Untuk Modal Components

**Pattern lama (lambat):**

```typescript
import CreateModal from './CreateModal'
import EditModal from './EditModal'

export function MyComponent() {
  return (
    <>
      <CreateModal open={createOpen} />
      <EditModal open={editOpen} />
    </>
  )
}
```

**Pattern baru (cepat):**

```typescript
import { lazy, Suspense } from 'react'

const CreateModal = lazy(() => import('./CreateModal'))
const EditModal = lazy(() => import('./EditModal'))

export function MyComponent() {
  return (
    <Suspense fallback={null}>
      {createOpen && <CreateModal open={createOpen} />}
      {editOpen && <EditModal open={editOpen} />}
    </Suspense>
  )
}
```

### Untuk Image Components

**Pattern lama (lambat):**

```typescript
<Image 
  src={photoUrl} 
  alt="photo" 
  width={200} 
  height={200}
  unoptimized  // ❌ Remove this
/>
```

**Pattern baru (cepat):**

```typescript
<Image 
  src={photoUrl} 
  alt="photo" 
  width={200} 
  height={200}
  sizes="200px"  // ✅ Add size hint
  quality={75}   // ✅ Optimize quality
/>
```

---

## 📝 Best Practices

### 1. Lazy Load Heavy Components

**Kapan lazy load?**

✅ **DO lazy load:**
- Chart libraries (Recharts, Chart.js)
- Modal components
- Large form components
- Admin-only components
- Heavy third-party libraries

❌ **DON'T lazy load:**
- Small components (< 10KB)
- Critical UI components
- Components above the fold
- Frequently used components

**Example:**

```typescript
// ✅ Good - Heavy chart library
const AreaChart = lazy(() => import('recharts').then(m => ({ default: m.AreaChart })))

// ❌ Bad - Small button component
const Button = lazy(() => import('./Button'))  // Overkill!
```

### 2. Optimize Images

**Always:**

```typescript
<Image 
  src={url}
  alt="description"
  width={width}
  height={height}
  sizes="(max-width: 768px) 100vw, 50vw"  // ✅ Responsive
  quality={75}  // ✅ Good balance
  priority={isAboveFold}  // ✅ Prioritize important images
/>
```

**Never:**

```typescript
<Image 
  src={url}
  alt="description"
  width={width}
  height={height}
  unoptimized  // ❌ Never use this
/>
```

### 3. Use Optimized Endpoints

**When creating new features:**

```typescript
// ✅ Good - Use optimized endpoint
const data = await fetch('/api/dashboard/stats-optimized')

// ❌ Bad - Use old endpoint
const data = await fetch('/api/dashboard/stats')
```

### 4. Add Suspense Boundaries

**Always wrap lazy components:**

```typescript
// ✅ Good
<Suspense fallback={<Loader />}>
  <LazyComponent />
</Suspense>

// ❌ Bad - Will error
<LazyComponent />
```

---

## 🔧 Development Workflow

### 1. Starting Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# In another terminal, test performance
npm run test:performance
```

### 2. Before Committing

```bash
# Check for TypeScript errors
npm run build

# Test performance
npm run test:performance

# Check bundle size
npm run build
# Look for large bundles in output
```

### 3. Creating New Features

**Checklist:**

- [ ] Use optimized API endpoints
- [ ] Lazy load heavy components
- [ ] Optimize images (no `unoptimized`)
- [ ] Add Suspense boundaries
- [ ] Test on mobile
- [ ] Check bundle size impact

---

## 📊 Monitoring Performance

### During Development

**Check bundle size:**

```bash
npm run build

# Look for warnings like:
# ⚠ Compiled with warnings
# ./node_modules/some-package is too large (500KB)
```

**Test API performance:**

```bash
npm run test:performance

# Should show:
# ✓ Dashboard Stats (Optimized): 400ms
# ✓ Project Activity (Optimized): 300ms
```

**Check DevTools:**

```
F12 → Network tab
- Check API response times
- Check bundle sizes
- Check image formats (should be WebP/AVIF)
```

### In Production

**Vercel Analytics:**

```
Vercel Dashboard → Your Project → Analytics
- Check Core Web Vitals
- Monitor API response times
- Track error rates
```

**Supabase Dashboard:**

```
Supabase Dashboard → Database → Query Performance
- Check slow queries
- Verify indexes being used
- Monitor query counts
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot find module" error

**Error:**

```
Error: Cannot find module 'recharts'
```

**Solution:**

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue 2: Lazy component not loading

**Error:**

```
Suspense boundary not found
```

**Solution:**

```typescript
// Add Suspense wrapper
<Suspense fallback={<div>Loading...</div>}>
  <LazyComponent />
</Suspense>
```

### Issue 3: Images not optimizing

**Problem:** Images still loading slow

**Solution:**

```typescript
// 1. Remove unoptimized flag
<Image src={url} unoptimized />  // ❌ Remove this

// 2. Add sizes attribute
<Image src={url} sizes="200px" />  // ✅ Add this

// 3. Check Next.js config
// next.config.mjs should have:
images: {
  formats: ['image/avif', 'image/webp'],
}
```

### Issue 4: API still slow

**Problem:** Optimized endpoint still slow

**Solution:**

```sql
-- 1. Check indexes applied
SELECT * FROM pg_stat_user_indexes 
WHERE schemaname = 'public';

-- 2. Analyze query plan
EXPLAIN ANALYZE
SELECT * FROM project_reports 
WHERE user_id = 'xxx';

-- 3. Check if index is used
-- Should show "Index Scan using idx_..."
```

---

## 📚 Additional Resources

### Documentation Files

- `PERFORMANCE_OPTIMIZATION.md` - Detailed technical report
- `OPTIMIZATION_QUICKSTART.md` - Quick start guide
- `OPTIMIZATION_SUMMARY.md` - Executive summary
- `DEPLOYMENT_CHECKLIST.md` - Deployment guide
- `.github/PERFORMANCE_COMPARISON.md` - Before/after comparison

### Code Examples

- `app/api/dashboard/stats-optimized/route.ts` - Optimized API example
- `app/dashboard/DashboardClient.tsx` - Lazy loading example
- `components/reports/ReportCard.tsx` - Image optimization example

### Testing

- `scripts/test-performance.js` - Performance test script
- `npm run test:performance` - Run performance tests

---

## 🤝 Team Guidelines

### Code Review Checklist

When reviewing PRs, check:

- [ ] No `unoptimized` flag on images
- [ ] Heavy components are lazy loaded
- [ ] Suspense boundaries added
- [ ] Optimized endpoints used
- [ ] Bundle size impact acceptable
- [ ] No console errors
- [ ] Mobile tested

### Performance Budget

**Limits:**

- Initial bundle: < 300KB
- API response: < 500ms
- Image load: < 1s
- Lighthouse score: > 85

**If exceeded:**

1. Identify large dependencies
2. Consider lazy loading
3. Optimize images
4. Review database queries

---

## 📞 Getting Help

**If you need help:**

1. Check documentation files
2. Run `npm run test:performance`
3. Check browser console
4. Ask team lead

**Common questions:**

Q: Do I need to change existing code?
A: No, old endpoints still work. But new code should use optimized endpoints.

Q: Will this break existing features?
A: No, all changes are backward compatible.

Q: How do I test performance locally?
A: Run `npm run test:performance`

Q: What if I need to rollback?
A: See `DEPLOYMENT_CHECKLIST.md` → Rollback Plan

---

**Happy coding! 🚀**
