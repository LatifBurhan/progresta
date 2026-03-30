-- =====================================================
-- Migration: Grant Permissions on Departments Table
-- Description: Grant necessary permissions to roles
-- Date: 2026-03-30
-- =====================================================

-- Grant permissions to authenticated role
GRANT SELECT ON departments TO authenticated;
GRANT SELECT ON departments TO anon;
GRANT ALL ON departments TO service_role;

-- Grant permissions to postgres role (just in case)
GRANT ALL ON departments TO postgres;

-- Verify RLS is disabled
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
