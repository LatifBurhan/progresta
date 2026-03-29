-- Migration: Remove output_diharapkan and catatan fields, update lampiran_url for file upload
-- Date: 2026-03-29

-- 1. Drop columns output_diharapkan and catatan from projects table
ALTER TABLE projects 
DROP COLUMN IF EXISTS output_diharapkan,
DROP COLUMN IF EXISTS catatan;

-- 2. Rename lampiran_url to lampiran_files and change type to TEXT[] for multiple files
ALTER TABLE projects 
RENAME COLUMN lampiran_url TO lampiran_files;

ALTER TABLE projects 
ALTER COLUMN lampiran_files TYPE TEXT[] USING CASE 
  WHEN lampiran_files IS NULL THEN NULL 
  WHEN lampiran_files = '' THEN NULL
  ELSE ARRAY[lampiran_files]
END;

-- 3. Create storage bucket for project attachments if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-attachments', 'project-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage policies for project attachments
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Authenticated users can upload project attachments" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can update project attachments" ON storage.objects;
  DROP POLICY IF EXISTS "Authenticated users can delete project attachments" ON storage.objects;
  DROP POLICY IF EXISTS "Public can view project attachments" ON storage.objects;
END $$;

-- Create new policies
CREATE POLICY "Authenticated users can upload project attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-attachments');

CREATE POLICY "Authenticated users can update project attachments"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'project-attachments');

CREATE POLICY "Authenticated users can delete project attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-attachments');

CREATE POLICY "Public can view project attachments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-attachments');

-- 5. Verify table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'projects' 
ORDER BY ordinal_position;
