# 📱 PWA Configuration Guide

## What's Included

PWA (Progressive Web App) sudah dikonfigurasi dan akan otomatis aktif setelah deployment.

## Features

✅ **Offline Support** - App tetap bisa diakses tanpa internet
✅ **Install to Home Screen** - Seperti native app
✅ **Service Worker** - Caching otomatis
✅ **Fast Loading** - Pre-cached assets
✅ **Responsive** - Works on all devices

## Configuration Files

- `next.config.mjs` - PWA plugin configuration
- `public/sw.js` - Service worker (auto-generated)
- `public/manifest.json` - App manifest (auto-generated)
- `app/offline/page.tsx` - Offline fallback page

## Testing PWA

### Desktop (Chrome)
1. Open app in Chrome
2. Look for install icon in address bar
3. Click to install
4. App opens in standalone window

### Mobile (Chrome/Safari)
1. Open app in mobile browser
2. Tap menu (⋮ or share icon)
3. Select "Add to Home Screen"
4. App icon appears on home screen

### Test Offline Mode
1. Open app
2. Enable airplane mode
3. Navigate to pages
4. Should show offline page when needed

## Customization

### App Name & Icons
Edit `public/manifest.json`:
```json
{
  "name": "Your App Name",
  "short_name": "App",
  "icons": [...]
}
```

### Offline Page
Edit `app/offline/page.tsx` to customize offline experience.

### Service Worker
Configuration in `next.config.mjs`:
```javascript
const withPWA = withPWAInit({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false, // Set true to disable PWA
})
```

## Troubleshooting

**PWA not installing?**
- Check HTTPS enabled (required)
- Check manifest.json exists
- Check service worker registered

**Offline mode not working?**
- Check service worker active
- Check offline page exists
- Clear cache and retry

**Icons not showing?**
- Check icon files in public/
- Check manifest.json paths
- Regenerate icons if needed

## Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Next PWA Plugin](https://github.com/DuCanhGH/next-pwa)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

**Status:** ✅ Configured & Ready
**Auto-enabled:** Yes
**Requires Setup:** No
