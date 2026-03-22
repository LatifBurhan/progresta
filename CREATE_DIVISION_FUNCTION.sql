-- ========================================
-- CREATE DIVISION FUNCTION - PROGRESTA
-- ========================================
-- Jalankan script ini di Supabase SQL Editor

-- 1. Create function untuk membuat division dengan UUID auto-generate
CREATE OR REPLACE FUNCTION create_division(
  division_name TEXT,
  division_description TEXT DEFAULT NULL,
  division_color TEXT DEFAULT '#3B82F6'
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  description TEXT,
  color TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
DECLARE
  new_division_id UUID;
BEGIN
  -- Generate new UUID
  new_division_id := gen_random_uuid();
  
  -- Insert new division
  INSERT INTO public.divisions (id, name, description, color, created_at, updated_at)
  VALUES (new_division_id, division_name, division_description, division_color, NOW(), NOW());
  
  -- Return the created division
  RETURN QUERY
  SELECT 
    d.id,
    d.name,
    d.description,
    d.color,
    d.created_at,
    d.updated_at
  FROM public.divisions d
  WHERE d.id = new_division_id;
END;
$$;

-- 2. Test function
SELECT * FROM create_division('Test Function Division', 'Created via SQL function', '#00FF00');

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION create_division TO service_role;
GRANT EXECUTE ON FUNCTION create_division TO anon;
GRANT EXECUTE ON FUNCTION create_division TO authenticated;