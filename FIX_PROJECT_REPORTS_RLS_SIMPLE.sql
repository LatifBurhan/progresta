-- ========================================
-- FIX RLS UNTUK project_reports - SOLUSI SEDERHANA
-- ========================================
-- Jalankan script ini di Supabase SQL Editor

-- OPSI 1: Disable RLS untuk project_reports (PALING MUDAH - untuk development)
-- Uncomment baris di bawah jika ingin disable RLS:
-- ALTER TABLE project_reports DISABLE ROW LEVEL SECURITY;

-- OPSI 2: Tambahkan policy untuk service_role (RECOMMENDED)
-- Jalankan semua baris di bawah ini:

-- 1. Drop semua policy yang ada
DROP POLICY IF EXISTS "Users can view own reports or admins view all" ON project_reports;
DROP POLICY IF EXISTS "Users can create reports for their projects" ON project_reports;
DROP POLICY IF EXISTS "Users can update own reports same day" ON project_reports;
DROP POLICY IF EXISTS "Users can delete own reports or admins delete any" ON project_reports;
DROP POLICY IF EXISTS "Service role can manage all reports" ON project_reports;

-- 2. Pastikan RLS enabled
ALTER TABLE project_reports ENABLE ROW LEVEL SECURITY;

-- 3. Buat policy untuk service_role (PALING PENTING!)
CREATE POLICY "Service role full access" 
ON project_reports
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- 4. Buat policy untuk authenticated users (untuk SELECT)
CREATE POLICY "Users can view own reports" 
ON project_reports
FOR SELECT
TO authenticated
USING (
    user_id = auth.uid()
    OR 
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role IN ('ADMIN', 'HRD', 'CEO')
    )
);

-- 5. Verifikasi policy sudah dibuat
SELECT 
    schemaname,
    tablename, 
    policyname,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'project_reports'
ORDER BY policyname;

-- 6. Cek apakah RLS enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'project_reports';
