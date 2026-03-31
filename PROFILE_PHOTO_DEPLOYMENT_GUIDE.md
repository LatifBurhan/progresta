# 🚀 Profile Photo Upload - Quick Deployment Guide

## ⚡ Quick Steps (10 menit)

### 1. Run Storage Migration (2 menit)

```sql
-- Buka Supabase Dashboard → SQL Editor
-- Copy-paste dan run migration ini:
```

**File:** `supabase/migrations/20240401000002_setup_profile_photos_storage.sql`

**Apa yang dilakukan:**
- ✅ Buat storage bucket `profile-photos`
- ✅ Set bucket jadi public (bisa diakses semua orang)
- ✅ Set limit 5MB per file
- ✅ Set allowed types: JPG, JPEG, PNG
- ✅ Setup RLS policies

**Verify:**
1. Buka Supabase Dashboard → Storage
2. Cek bucket `profile-photos` ada
3. Cek bucket status: Public ✅

---

### 2. Deploy Code (3 menit)

```bash
# Commit dan push
git add .
git commit -m "feat: add profile photo upload (Phase 5)"
git push origin main
```

**Tunggu deployment selesai** (biasanya 2-3 menit di Vercel)

---

### 3. Test Feature (5 menit)

#### Test 1: Upload Foto (STAFF)
1. Login sebagai user dengan role STAFF
2. Klik menu "Profil Saya" di sidebar
3. Klik tombol "Upload Foto"
4. Pilih foto (JPG/PNG, < 5MB)
5. ✅ Foto muncul di preview
6. ✅ Foto muncul di navbar (pojok kanan atas)
7. ✅ Pesan: "Anda hanya dapat mengubah foto profil"

#### Test 2: Hapus Foto
1. Klik tombol "Hapus"
2. Konfirmasi hapus
3. ✅ Foto hilang, muncul avatar default (huruf pertama nama)

#### Test 3: Upload Foto (ADMIN/CEO/PM)
1. Login sebagai ADMIN/CEO/PM
2. Klik menu "Profil Saya"
3. Upload foto
4. ✅ Foto muncul
5. ✅ Pesan: "Kelola foto profil Anda"

#### Test 4: Validasi Error
1. Coba upload file > 5MB → ✅ Error: "Ukuran file maksimal 5MB"
2. Coba upload file PDF → ✅ Error: "Format file harus JPG, JPEG, atau PNG"

---

## 📋 Checklist Deployment

### Pre-Deployment
- [ ] Backup database (optional, tidak ada perubahan schema)
- [ ] Review migration file
- [ ] Pastikan environment variables sudah set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`

### Deployment
- [ ] Run storage migration di Supabase SQL Editor
- [ ] Verify bucket `profile-photos` created
- [ ] Deploy code ke production
- [ ] Wait for deployment complete

### Post-Deployment Testing
- [ ] Test upload foto (STAFF role)
- [ ] Test upload foto (ADMIN role)
- [ ] Test hapus foto
- [ ] Test validasi file size
- [ ] Test validasi file type
- [ ] Verify foto muncul di navbar
- [ ] Test di mobile browser

---

## 🎯 Success Criteria

✅ Storage bucket `profile-photos` exists  
✅ Users can upload profile photos  
✅ Photos appear in navbar  
✅ STAFF users see restriction message  
✅ File validation works (size, type)  
✅ Remove photo works  
✅ No errors in console  

---

## 🐛 Troubleshooting

### Problem: Migration error "bucket already exists"
**Solution:** Bucket sudah ada, skip migration atau tambah `ON CONFLICT DO NOTHING`

### Problem: Upload error "Failed to upload photo"
**Solution:**
- Check Supabase Storage bucket exists
- Check RLS policies active
- Check `SUPABASE_SERVICE_ROLE_KEY` di environment variables

### Problem: Foto tidak muncul di navbar
**Solution:**
- Hard refresh (Ctrl+Shift+R)
- Check `fotoProfil` field di database users table
- Check foto URL valid

### Problem: Error "Unauthorized"
**Solution:**
- User belum login
- Session expired, login ulang

---

## 📞 Need Help?

**Check Documentation:**
- `PROFILE_PHOTO_UPLOAD_IMPLEMENTATION.md` - Full implementation details
- `PROFILE_REVISION_COMPLETE.md` - Phase 1-4 documentation

**Check Files:**
- Component: `components/profile/ProfilePhotoUploader.tsx`
- API Upload: `app/api/profile/photo/upload/route.ts`
- API Remove: `app/api/profile/photo/remove/route.ts`
- Migration: `supabase/migrations/20240401000002_setup_profile_photos_storage.sql`
- Profile Page: `app/dashboard/profile/page.tsx`

---

## ✅ Done!

Setelah semua checklist ✅, fitur upload foto profil sudah siap digunakan!

**Total Time:** ~10 menit  
**Risk Level:** Low (hanya tambah fitur baru, tidak ubah data existing)  
**Rollback:** Easy (hapus bucket, revert code)

---

**Last Updated:** 2024-04-01  
**Version:** 1.0.0
