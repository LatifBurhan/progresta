-- ========================================
-- FIX: Grant permissions ke service_role
-- ========================================
-- Ini adalah solusi paling pasti untuk masalah permission denied

-- 1. Cek permissions saat ini
SELECT 
    grantee,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name = 'project_reports'
ORDER BY grantee, privilege_type;

-- 2. GRANT ALL ke service_role (INI YANG PALING PENTING!)
GRANT ALL ON TABLE public.project_reports TO service_role;

-- 3. GRANT ALL ke postgres (owner)
GRANT ALL ON TABLE public.project_reports TO postgres;

-- 4. Verifikasi lagi setelah grant
SELECT 
    grantee,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name = 'project_reports'
ORDER BY grantee, privilege_type;

-- 5. Disable RLS (sebagai backup jika masih error)
-- Uncomment baris di bawah jika setelah GRANT masih error:
-- ALTER TABLE project_reports DISABLE ROW LEVEL SECURITY;

-- 6. Cek status RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'project_reports';
