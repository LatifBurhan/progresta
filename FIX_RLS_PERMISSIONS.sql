-- ========================================
-- FIX RLS PERMISSIONS - PROGRESTA
-- ========================================
-- Jalankan script ini di Supabase SQL Editor untuk memperbaiki permissions

-- 1. Disable RLS sementara untuk testing (HATI-HATI: hanya untuk development)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_divisions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_details DISABLE ROW LEVEL SECURITY;

-- 2. Grant permissions untuk service role
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.divisions TO service_role;
GRANT ALL ON public.projects TO service_role;
GRANT ALL ON public.project_assignments TO service_role;
GRANT ALL ON public.project_divisions TO service_role;
GRANT ALL ON public.reports TO service_role;
GRANT ALL ON public.report_details TO service_role;

-- 3. Grant permissions untuk anon role (untuk public access)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.divisions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_assignments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_divisions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.report_details TO anon;

-- 4. Grant permissions untuk authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.divisions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_assignments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_divisions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.report_details TO authenticated;

-- 5. Cek permissions yang sudah diberikan
SELECT 
    schemaname,
    tablename,
    grantor,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'divisions', 'projects', 'project_assignments', 'project_divisions', 'reports', 'report_details')
ORDER BY tablename, grantee;

-- 6. Cek status RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'divisions', 'projects', 'project_assignments', 'project_divisions', 'reports', 'report_details')
ORDER BY tablename;