# Debug Payslip PDF Department Issue

## Problem
User dari departemen UFUK masih melihat logo dan nama ALWUSTHO di PDF slip gaji.

## Debugging Steps

### Step 1: Check Department Names in Database
Run query: `check_department_names.sql`

This will show:
1. Exact spelling of department names in database
2. All users and their department assignments
3. User count per department

**Look for**:
- Is the department name exactly "UFUK HIJAU ENERGY"?
- Or is it "Ufuk Hijau Energy" (different casing)?
- Or is it something else like "UFUK" or "Ufuk"?

### Step 2: Check Specific User's Department
Run query: `debug_user_department.sql`

Replace `'USER_EMAIL_HERE'` with the actual user email who reported the issue.

**Look for**:
- Does the user have a department assignment in `user_departments` table?
- What is the exact `department_name` returned?
- Is it NULL?

### Step 3: Check Server Logs
After running Step 1 and 2, download the PDF again and check server logs.

Look for lines starting with:
```
=== DEBUG PAYSLIP PDF ===
User ID: ...
User Dept Data: ...
Department Name: ...
Department Info: ...
=== END DEBUG ===
```

This will show:
- What department name was fetched from database
- What department info was selected
- Which logo file is being used

### Step 4: Verify Logo Files
Check that logo files exist in `public/` directory:
- `public/master-alwustho.png` ✅
- `public/master-ufuk.png` ✅
- `public/master-elfan.png` ✅

### Step 5: Check Department Config Matching

The code has these exact keys in `DEPARTMENT_CONFIG`:
```typescript
'ALWUSTHO'
'UFUK HIJAU ENERGY'
'ELFAN ACADEMY'
```

If database has different names, the matching will fail.

## Common Issues

### Issue 1: Department Name Mismatch
**Symptom**: User has department but still shows ALWUSTHO
**Cause**: Department name in database doesn't match config keys
**Solution**: 
- Option A: Update department name in database to match config
- Option B: Update config keys to match database

Example:
- Database has: "Ufuk Hijau Energy" (title case)
- Config expects: "UFUK HIJAU ENERGY" (uppercase)
- Result: No match, defaults to ALWUSTHO

**Fix**: The code now has partial matching for "ufuk", "hijau", "elfan", "academy" keywords.

### Issue 2: User Not Assigned to Department
**Symptom**: User has no department in `user_departments` table
**Cause**: User was created but not assigned to department
**Solution**: Assign user to correct department

```sql
-- Check if user has department
SELECT * FROM user_departments WHERE user_id = 'USER_ID_HERE';

-- If empty, insert department assignment
INSERT INTO user_departments (user_id, department_id)
VALUES ('USER_ID_HERE', 'DEPARTMENT_ID_HERE');
```

### Issue 3: Multiple Department Assignments
**Symptom**: User assigned to multiple departments
**Cause**: User in multiple departments, query returns first one
**Solution**: Ensure user has only one primary department for payslip purposes

### Issue 4: Cached Build
**Symptom**: Code updated but still shows old behavior
**Cause**: Next.js build cache
**Solution**: 
```bash
npm run build
# Or restart dev server
```

## Testing After Fix

1. Run `check_department_names.sql` to see exact department names
2. Update `DEPARTMENT_CONFIG` keys if needed to match database
3. Rebuild: `npm run build`
4. Download PDF again
5. Check server logs for debug output
6. Verify logo and company name are correct

## Expected Debug Output

For UFUK user, should see:
```
=== DEBUG PAYSLIP PDF ===
User ID: abc-123-def
User Dept Data: {
  "department_id": "xyz-789",
  "departments": {
    "name": "UFUK HIJAU ENERGY"  // or whatever exact name in DB
  }
}
Department Name: UFUK HIJAU ENERGY
Department Info: {
  "name": "Ufuk Hijau Energy",
  "address": "Jl. Puntodewo No.53...",
  "logoFile": "master-ufuk.png"
}
=== END DEBUG ===
```

If you see:
```
Department Name: null
```
Then user has no department assignment.

If you see:
```
Department Name: "Some Other Name"
```
Then department name doesn't match config and partial matching failed.

## Quick Fix Commands

### If department name is different in database:

**Option 1: Update database to match code**
```sql
-- Update department name to uppercase
UPDATE departments 
SET name = 'UFUK HIJAU ENERGY' 
WHERE name ILIKE '%ufuk%';

UPDATE departments 
SET name = 'ELFAN ACADEMY' 
WHERE name ILIKE '%elfan%';

UPDATE departments 
SET name = 'ALWUSTHO' 
WHERE name ILIKE '%alwustho%';
```

**Option 2: Update code to match database**
Edit `app/api/payslips/[id]/pdf/route.ts` and change `DEPARTMENT_CONFIG` keys to match exact database names.

## Next Steps

1. Run `check_department_names.sql` and share the output
2. Run `debug_user_department.sql` with the user's email and share output
3. Download PDF and check server logs for debug output
4. Share the debug output here so we can identify the exact issue
