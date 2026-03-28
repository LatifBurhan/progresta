-- ========================================
-- DEBUG: Check project_reports permissions
-- ========================================
-- Jalankan query ini satu per satu untuk debug

-- 1. Cek apakah tabel ada
SELECT 
    table_schema,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'project_reports';

-- 2. Cek RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'project_reports';

-- 3. Cek semua policies yang ada
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
WHERE tablename = 'project_reports'
ORDER BY policyname;

-- 4. Cek table grants/permissions
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name = 'project_reports'
ORDER BY grantee, privilege_type;

-- 5. Cek apakah service_role punya akses
SELECT 
    grantee,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name = 'project_reports'
AND grantee = 'service_role';

-- 6. SOLUSI: Grant ALL ke service_role (jika belum ada)
GRANT ALL ON TABLE public.project_reports TO service_role;

-- 7. Verifikasi lagi setelah grant
SELECT 
    grantee,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name = 'project_reports'
AND grantee = 'service_role';
