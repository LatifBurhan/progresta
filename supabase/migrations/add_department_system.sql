-- =====================================================
-- Migration: Add Department System
-- Description: Add departments table and update divisions/projects structure
-- Date: 2026-03-30
-- =====================================================

-- 1. Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add department_id to divisions table
ALTER TABLE divisions 
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;

-- 3. Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_divisions_department_id ON divisions(department_id);

-- 4. Create project_department_divisions junction table
CREATE TABLE IF NOT EXISTS project_department_divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  division_id UUID NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, department_id, division_id)
);

-- 5. Create indexes for project_department_divisions
CREATE INDEX IF NOT EXISTS idx_pdd_project_id ON project_department_divisions(project_id);
CREATE INDEX IF NOT EXISTS idx_pdd_department_id ON project_department_divisions(department_id);
CREATE INDEX IF NOT EXISTS idx_pdd_division_id ON project_department_divisions(division_id);

-- 6. Insert 4 default departments
INSERT INTO departments (name, description, color, "isActive") VALUES
  ('Al-Wustho', 'Departemen Al-Wustho', '#3B82F6', true),
  ('Elfan Academy', 'Departemen Elfan Academy', '#10B981', true),
  ('Ufuk Hijau', 'Departemen Ufuk Hijau', '#F59E0B', true),
  ('Aflaha', 'Departemen Aflaha', '#8B5CF6', true)
ON CONFLICT (name) DO NOTHING;

-- 7. Migrate existing divisions to Al-Wustho department
UPDATE divisions 
SET department_id = (SELECT id FROM departments WHERE name = 'Al-Wustho' LIMIT 1)
WHERE department_id IS NULL;

-- 8. Migrate existing project_divisions to project_department_divisions
INSERT INTO project_department_divisions (project_id, department_id, division_id)
SELECT 
  pd.project_id,
  d.department_id,
  pd.division_id
FROM project_divisions pd
JOIN divisions d ON pd.division_id = d.id
WHERE d.department_id IS NOT NULL
ON CONFLICT (project_id, department_id, division_id) DO NOTHING;

-- 9. Add comment for documentation
COMMENT ON TABLE departments IS 'Stores department information (Al-Wustho, Elfan Academy, Ufuk Hijau, Aflaha)';
COMMENT ON TABLE project_department_divisions IS 'Junction table for projects with multiple departments and divisions';
COMMENT ON COLUMN divisions.department_id IS 'Foreign key to departments table';
