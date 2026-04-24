# Fix Payslip PDF Department - Final Solution

## Root Cause Identified

From debug logs:
```
User Dept Data: null
Department Name: null
```

**Problem 1**: User `fc7e786c-300b-4c6b-9c80-352c42f5caf9` has NO department assignment in `user_departments` table.

**Problem 2**: Department names in database don't match code expectations:
- Database has: "Al-Wustho", "Ufuk Hijau", "Elfan Academy", "Aflaha"
- Code expected: "ALWUSTHO", "UFUK HIJAU ENERGY", "ELFAN ACADEMY"

## Solution Applied

### 1. Updated Department Config
Changed `DEPARTMENT_CONFIG` keys to match actual database names:
- ✅ "Al-Wustho" → Alwustho Technologies logo
- ✅ "Ufuk Hijau" → Ufuk Hijau Energy logo
- ✅ "Elfan Academy" → Elfan Academy logo
- ✅ "Aflaha" → Aflaha (using alwustho logo as default)

### 2. Updated Partial Matching
Added flexible matching for variations:
- "ufuk", "hijau" → Ufuk Hijau
- "elfan", "academy" → Elfan Academy
- "alwustho", "al-wustho", "wustho" → Al-Wustho
- "aflaha" → Aflaha

### 3. Need to Assign User to Department

**CRITICAL**: You must run this SQL to assign the user to Ufuk Hijau department:

```sql
-- Assign user to Ufuk Hijau department
INSERT INTO user_departments (user_id, department_id)
VALUES (
  'fc7e786c-300b-4c6b-9c80-352c42f5caf9',  -- User ID from debug log
  '973309a3-7308-485d-a289-e804ae0b4f01'   -- Ufuk Hijau dept ID from screenshot
)
ON CONFLICT (user_id, department_id) DO NOTHING;
```

**Verify the assignment**:
```sql
SELECT 
  u.email,
  u.name,
  d.name as department_name
FROM users u
JOIN user_departments ud ON u.id = ud.user_id
JOIN departments d ON ud.department_id = d.id
WHERE u.id = 'fc7e786c-300b-4c6b-9c80-352c42f5caf9';
```

Should return the user with "Ufuk Hijau" department.

## Testing Steps

### Step 1: Assign User to Department
Run the SQL above in Supabase SQL Editor.

### Step 2: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
# Then restart
npm run dev
```

### Step 3: Download PDF Again
1. Login as the Ufuk Hijau user
2. Go to Slip Gaji
3. Download PDF
4. Check server logs for:
```
=== DEBUG PAYSLIP PDF ===
User Dept Data: { "departments": { "name": "Ufuk Hijau" } }
Department Name: Ufuk Hijau
Department Info: { "name": "Ufuk Hijau Energy", "logoFile": "master-ufuk.png" }
```

### Step 4: Verify PDF
PDF should now show:
- ✅ Logo: Ufuk Hijau logo (top right)
- ✅ Company Name: "Ufuk Hijau Energy"
- ✅ Address: Jl. Puntodewo No.53, Cemani...

## Assign All Users to Departments

To prevent this issue for other users, assign everyone to their correct departments:

```sql
-- Check users without department assignment
SELECT 
  u.id,
  u.email,
  u.name,
  u.role
FROM users u
LEFT JOIN user_departments ud ON u.id = ud.user_id
WHERE ud.department_id IS NULL
  AND u.status = 'ACTIVE';
```

Then assign each user:
```sql
-- Example: Assign user to Al-Wustho
INSERT INTO user_departments (user_id, department_id)
VALUES ('USER_ID_HERE', '63f5ff91-3bb0-49af-a51f-527d777482e6');

-- Example: Assign user to Ufuk Hijau
INSERT INTO user_departments (user_id, department_id)
VALUES ('USER_ID_HERE', '973309a3-7308-485d-a289-e804ae0b4f01');

-- Example: Assign user to Elfan Academy
INSERT INTO user_departments (user_id, department_id)
VALUES ('USER_ID_HERE', 'd036e068-6800-4150-9805-c0592f635b94');

-- Example: Assign user to Aflaha
INSERT INTO user_departments (user_id, department_id)
VALUES ('USER_ID_HERE', '2611d55d-d865-4258-b2c6-41b77ce144a4');
```

## Department IDs Reference

From your database:
- **Aflaha**: `2611d55d-d865-4258-b2c6-41b77ce144a4`
- **Al-Wustho**: `63f5ff91-3bb0-49af-a51f-527d777482e6`
- **Elfan Academy**: `d036e068-6800-4150-9805-c0592f635b94`
- **Ufuk Hijau**: `973309a3-7308-485d-a289-e804ae0b4f01`

## Files Modified
- `app/api/payslips/[id]/pdf/route.ts` - Updated department config and matching logic

## Status
✅ Code Updated
⏳ Need to assign user to department (SQL above)
⏳ Need to restart server
⏳ Ready for testing after SQL + restart

## Expected Result After Fix

When Ufuk Hijau user downloads PDF:
1. System queries `user_departments` → finds "Ufuk Hijau"
2. System matches "Ufuk Hijau" → selects Ufuk config
3. PDF shows Ufuk logo, name, and address
4. Debug log shows correct department info

## Troubleshooting

If still shows wrong department after fix:
1. Verify SQL assignment was successful (run verify query)
2. Restart dev server (important!)
3. Clear browser cache
4. Check server logs for debug output
5. Verify logo file exists: `public/master-ufuk.png`
