-- =====================================================
-- Migration: Fix Departments Table RLS Policies
-- Description: Disable RLS for departments table (reference data)
-- Date: 2026-03-30
-- =====================================================

-- Disable RLS on departments table (it's a reference table, safe to read by all)
ALTER TABLE departments DISABLE ROW LEVEL SECURITY;
