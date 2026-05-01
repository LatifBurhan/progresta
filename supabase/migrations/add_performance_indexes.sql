-- Performance Optimization Indexes
-- Created: 2024
-- Purpose: Speed up dashboard and report queries

-- Index for project_reports queries by user_id and created_at
CREATE INDEX IF NOT EXISTS idx_project_reports_user_created 
ON project_reports(user_id, created_at DESC);

-- Index for project_reports queries by project_id and created_at
CREATE INDEX IF NOT EXISTS idx_project_reports_project_created 
ON project_reports(project_id, created_at DESC);

-- Index for project_reports queries by user_id and project_id
CREATE INDEX IF NOT EXISTS idx_project_reports_user_project 
ON project_reports(user_id, project_id);

-- Index for project_divisions queries
CREATE INDEX IF NOT EXISTS idx_project_divisions_division 
ON project_divisions(division_id, project_id);

-- Index for project_assignments queries
CREATE INDEX IF NOT EXISTS idx_project_assignments_user 
ON project_assignments(user_id, project_id);

-- Index for project_assignments queries by project
CREATE INDEX IF NOT EXISTS idx_project_assignments_project 
ON project_assignments(project_id, user_id);

-- Index for projects active status
CREATE INDEX IF NOT EXISTS idx_projects_active_status 
ON projects("isActive", status) WHERE "isActive" = true;

-- Index for users division lookup
CREATE INDEX IF NOT EXISTS idx_users_division 
ON users("divisionId") WHERE "divisionId" IS NOT NULL;

-- Composite index for report filtering with location
CREATE INDEX IF NOT EXISTS idx_project_reports_user_location_created 
ON project_reports(user_id, lokasi_kerja, created_at DESC);

-- Index for kendala filtering
CREATE INDEX IF NOT EXISTS idx_project_reports_kendala 
ON project_reports(user_id, created_at DESC) 
WHERE kendala IS NOT NULL AND kendala != '';

-- Analyze tables to update statistics
ANALYZE project_reports;
ANALYZE projects;
ANALYZE project_divisions;
ANALYZE project_assignments;
ANALYZE users;

-- Add comments for documentation
COMMENT ON INDEX idx_project_reports_user_created IS 'Optimizes dashboard stats queries by user and date';
COMMENT ON INDEX idx_project_reports_project_created IS 'Optimizes project activity queries';
COMMENT ON INDEX idx_project_reports_user_project IS 'Optimizes report filtering by user and project';
COMMENT ON INDEX idx_project_divisions_division IS 'Optimizes division-based project queries';
COMMENT ON INDEX idx_project_assignments_user IS 'Optimizes user assignment lookups';
COMMENT ON INDEX idx_projects_active_status IS 'Optimizes active project queries';
