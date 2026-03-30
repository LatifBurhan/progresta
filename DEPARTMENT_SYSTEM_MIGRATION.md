# Department System Migration Guide

## Overview
This migration adds a department system to organize divisions and projects across 4 main departments:
- Al-Wustho
- Elfan Academy
- Ufuk Hijau
- Aflaha

## Database Changes

### 1. New Table: `departments`
Stores department information.

**Columns:**
- `id` (UUID, PK)
- `name` (TEXT, UNIQUE)
- `description` (TEXT)
- `color` (TEXT, default: #3B82F6)
- `isActive` (BOOLEAN, default: true)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

### 2. Modified Table: `divisions`
Added foreign key to departments.

**New Column:**
- `department_id` (UUID, FK to departments)

### 3. New Table: `project_department_divisions`
Junction table for projects with multiple departments and divisions.

**Columns:**
- `id` (UUID, PK)
- `project_id` (UUID, FK to projects)
- `department_id` (UUID, FK to departments)
- `division_id` (UUID, FK to divisions)
- `created_at` (TIMESTAMP)
- UNIQUE constraint on (project_id, department_id, division_id)

## Migration Steps

### Step 1: Run Migration
Execute the migration file in Supabase SQL Editor:
```bash
# File: supabase/migrations/add_department_system.sql
```

Or use Supabase CLI:
```bash
supabase db push
```

### Step 2: Verify Data
Check that all existing divisions are assigned to Al-Wustho:
```sql
SELECT d.name, dept.name as department_name
FROM divisions d
JOIN departments dept ON d.department_id = dept.id;
```

### Step 3: Verify Project Migration
Check that project_divisions data is migrated:
```sql
SELECT COUNT(*) FROM project_department_divisions;
```

## Access Control Logic

### Role-Based Access:
- **ADMIN, HRD, CEO**: Access to ALL departments
- **PM, KARYAWAN**: Access only to their division's department

### Implementation:
```typescript
const GLOBAL_ROLES = ['ADMIN', 'HRD', 'CEO'];

function getUserAccessibleDepartments(user) {
  if (GLOBAL_ROLES.includes(user.role)) {
    return 'all'; // Access all departments
  }
  return user.division.department_id; // Access only their department
}
```

## UI Changes

### 1. Kelola Divisi (Division Management)
- **Add Field**: Departemen dropdown (required)
- **Display**: Show department name in division cards

### 2. Kelola Karyawan (User Management)
- **Add Field**: Departemen dropdown (required, filters divisions)
- **Workflow**: Select Department → Select Division
- **Display**: Show department name in user cards

### 3. Kelola Project (Project Management)
- **Add Field**: Departemen selection (multiple, required)
- **Workflow**: Select Departments → Select Divisions from those departments
- **Display**: Show departments + divisions involved

### 4. Dashboard & Reports
- **Add Filter**: Department dropdown (for ADMIN/HRD/CEO)
- **Logic**: Filter data by selected department

## Rollback Plan

If you need to rollback this migration:

```sql
-- 1. Drop new tables
DROP TABLE IF EXISTS project_department_divisions CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- 2. Remove column from divisions
ALTER TABLE divisions DROP COLUMN IF EXISTS department_id;
```

## Testing Checklist

- [ ] Migration runs successfully
- [ ] 4 departments created
- [ ] All existing divisions assigned to Al-Wustho
- [ ] Project data migrated to new junction table
- [ ] Can create new division with department
- [ ] Can create new user with department + division
- [ ] Can create new project with multiple departments
- [ ] Filters work correctly for ADMIN/HRD/CEO
- [ ] Regular users only see their department data

## Support

For issues or questions, contact the development team.
