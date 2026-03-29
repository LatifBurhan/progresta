-- Fix RLS policies for project-attachments storage bucket

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow authenticated users to upload project files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read project files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete project files" ON storage.objects;

-- Enable RLS on storage.objects (should already be enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow authenticated users to upload files to project-attachments bucket
CREATE POLICY "Allow authenticated users to upload project files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-attachments'
);

-- Policy 2: Allow authenticated users to read files from project-attachments bucket
CREATE POLICY "Allow authenticated users to read project files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-attachments'
);

-- Policy 3: Allow authenticated users to update files in project-attachments bucket
CREATE POLICY "Allow authenticated users to update project files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'project-attachments'
)
WITH CHECK (
  bucket_id = 'project-attachments'
);

-- Policy 4: Allow authenticated users to delete files from project-attachments bucket
CREATE POLICY "Allow authenticated users to delete project files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-attachments'
);

-- Verify bucket exists and is public
UPDATE storage.buckets
SET public = true
WHERE id = 'project-attachments';

-- If bucket doesn't exist, create it
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-attachments',
  'project-attachments',
  true,
  10485760, -- 10MB in bytes
  ARRAY[
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed'
  ]
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed'
  ];
