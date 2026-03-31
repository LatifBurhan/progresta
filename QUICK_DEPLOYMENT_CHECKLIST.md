# ⚡ Quick Deployment Checklist

## 🎯 Pre-Deployment (5 minutes)

- [ ] Backup production database
- [ ] Review migration files
- [ ] Verify staging tests passed
- [ ] Notify team of deployment

---

## 🚀 Deployment Steps (10 minutes)

### Step 1: Run Migration 1
```sql
-- In Supabase SQL Editor
-- File: supabase/migrations/20240401000001_add_new_role_values.sql
-- This adds GENERAL_AFFAIR and STAFF to Role enum
```
- [ ] Copy SQL from file
- [ ] Paste in Supabase SQL Editor
- [ ] Click "Run"
- [ ] Verify: "Success. No rows returned"

### Step 2: Run Migration 2
```sql
-- In Supabase SQL Editor  
-- File: supabase/migrations/20240401000000_revisi_profil_karyawan.sql
-- This adds new columns, tables, and migrates data
```
- [ ] Copy SQL from file
- [ ] Paste in Supabase SQL Editor
- [ ] Click "Run"
- [ ] Verify: Success messages for all operations

### Step 3: Verify Database Changes
```sql
-- Quick verification queries
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'users' AND column_name IN ('employee_status', 'address', 'notes');

SELECT COUNT(*) FROM user_departments;
SELECT COUNT(*) FROM user_divisions;

SELECT role, COUNT(*) FROM users GROUP BY role;
```
- [ ] New columns exist
- [ ] New tables exist
- [ ] Roles updated (no HRD/KARYAWAN)

### Step 4: Deploy Code
```bash
# Push to production
git push origin main
```
- [ ] Code deployed successfully
- [ ] No build errors
- [ ] Application starts

---

## ✅ Post-Deployment Verification (5 minutes)

### Quick Smoke Tests
- [ ] Login as ADMIN - works
- [ ] Navigate to Database Karyawan - loads
- [ ] Role badges show "Staff" and "General Affair" (not old names)
- [ ] Click "Tambah User" - form loads with new fields
- [ ] Create test user - succeeds
- [ ] Edit test user - succeeds
- [ ] Delete test user - succeeds

### Check for Issues
- [ ] No console errors
- [ ] No API errors in logs
- [ ] No user complaints
- [ ] Performance normal

---

## 🐛 Rollback (If Needed)

### If Code Issues:
```bash
git revert HEAD
git push origin main
```

### If Database Issues:
⚠️ **Contact team lead before database rollback**
- Database rollback causes data loss
- Only use as last resort

---

## 📞 Emergency Contacts

**Development Team:** [Contact Info]  
**Database Admin:** [Contact Info]  
**Project Manager:** [Contact Info]

---

## 📊 Success Criteria

✅ All migrations run successfully  
✅ No errors in application logs  
✅ Users can create/edit with new fields  
✅ Role names display correctly  
✅ Permissions work as expected  
✅ No data loss  

---

## 📝 Post-Deployment Tasks

- [ ] Monitor logs for 1 hour
- [ ] Send deployment notification to team
- [ ] Update status in project tracker
- [ ] Schedule follow-up check in 24 hours

---

**Deployment Date:** ___________  
**Deployed By:** ___________  
**Status:** [ ] SUCCESS [ ] ISSUES [ ] ROLLBACK  
**Notes:** ___________

---

**Total Time:** ~20 minutes  
**Risk Level:** Medium (database changes)  
**Rollback Available:** Yes (code only)
