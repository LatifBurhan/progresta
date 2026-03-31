# Deployment Guide - Progresta

## Prerequisites

1. **Supabase Project** - Make sure you have a Supabase project set up
2. **Vercel Account** - Sign up at https://vercel.com
3. **GitHub Repository** - Code should be pushed to GitHub

## Environment Variables

Add these environment variables in Vercel:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Session Configuration
SESSION_SECRET=your_random_secret_key_min_32_characters
```

## Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `template` (if your Next.js app is in template folder)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

4. Add Environment Variables (from Prerequisites section above)

5. Click **Deploy**

### 3. Configure Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to **Domains**
3. Add your custom domain
4. Update DNS records as instructed

## PWA Features

The app is configured as a Progressive Web App (PWA) with:

- ✅ Offline support
- ✅ Install to home screen
- ✅ Service worker for caching
- ✅ Automatic updates

### Testing PWA

1. Open your deployed app in Chrome/Edge
2. Click the install icon in the address bar
3. App will be installed as a standalone application
4. Test offline functionality by turning off network

## Post-Deployment Checklist

- [ ] Test login functionality
- [ ] Verify Supabase connection
- [ ] Test PWA install
- [ ] Check offline mode
- [ ] Verify all API routes work
- [ ] Test file uploads
- [ ] Check responsive design on mobile

## Troubleshooting

### Build Fails

- Check environment variables are set correctly
- Verify Supabase credentials
- Check build logs in Vercel dashboard

### PWA Not Working

- Ensure HTTPS is enabled (required for PWA)
- Check service worker registration in browser DevTools
- Clear browser cache and try again

### Database Connection Issues

- Verify Supabase URL and keys
- Check RLS policies in Supabase
- Ensure service role key has proper permissions

## Support

For issues, check:
- Vercel deployment logs
- Browser console for errors
- Supabase dashboard for database issues
