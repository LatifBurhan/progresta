-- Migration: Auto-update overdue projects to "Ditunda" status
-- This migration creates a function to automatically update project status
-- when they pass their deadline (tanggal_selesai)

-- Create function to update overdue projects
CREATE OR REPLACE FUNCTION update_overdue_projects()
RETURNS TABLE (
  updated_count INTEGER,
  updated_project_ids TEXT[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated_count INTEGER;
  v_updated_ids TEXT[];
BEGIN
  -- Update projects that are:
  -- 1. Status is currently "Aktif"
  -- 2. tanggal_selesai has passed (before today)
  -- 3. isActive is true
  WITH updated AS (
    UPDATE projects
    SET 
      status = 'Ditunda',
      updated_at = NOW()
    WHERE 
      status = 'Aktif'
      AND tanggal_selesai < CURRENT_DATE
      AND "isActive" = true
    RETURNING id
  )
  SELECT 
    COUNT(*)::INTEGER,
    ARRAY_AGG(id::TEXT)
  INTO v_updated_count, v_updated_ids
  FROM updated;

  -- Return results
  RETURN QUERY SELECT v_updated_count, v_updated_ids;
END;
$$;

-- Grant execute permission to authenticated users (for API calls)
GRANT EXECUTE ON FUNCTION update_overdue_projects() TO authenticated;

-- Add comment
COMMENT ON FUNCTION update_overdue_projects() IS 
  'Automatically updates project status from Aktif to Ditunda when tanggal_selesai has passed. Returns count and IDs of updated projects.';
