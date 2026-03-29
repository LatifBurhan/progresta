-- Simple fix for project-attachments storage RLS
-- Run this in Supabase SQL Editor

-- 1. Create bucket if not exists (ignore error if already exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-attachments', 'project-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop all existing policies for this bucket
DROP POLICY IF EXISTS "Allow authenticated users to upload project files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read project files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update project files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete project files" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;

-- 3. Create new policies
-- Allow INSERT (upload)
CREATE POLICY "Allow authenticated users to upload project files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-attachments');

-- Allow SELECT (read/download)
CREATE POLICY "Allow authenticated users to read project files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'project-attachments');

-- Allow UPDATE
CREATE POLICY "Allow authenticated users to update project files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'project-attachments')
WITH CHECK (bucket_id = 'project-attachments');

-- Allow DELETE
CREATE POLICY "Allow authenticated users to delete project files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'project-attachments');

-- 4. Verify
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
AND policyname LIKE '%project%';
