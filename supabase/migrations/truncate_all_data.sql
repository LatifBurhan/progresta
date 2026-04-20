-- ============================================================
-- Script: Truncate All Data (Keep Table Structure)
-- Description: Menghapus semua data dari database, struktur tabel tetap ada
-- WARNING: Script ini akan menghapus SEMUA DATA! Pastikan sudah backup!
-- ============================================================

-- Disable triggers temporarily untuk menghindari masalah
SET session_replication_role = 'replica';

-- Truncate tables dalam urutan yang benar (child tables dulu, parent tables terakhir)
-- Urutan penting untuk menghindari foreign key constraint errors
-- KECUALI: users, user_divisions, user_departments (agar akun login tetap ada)

-- 1. Hapus data tabel yang tidak punya foreign key dependencies
TRUNCATE TABLE IF EXISTS public.profiles CASCADE;
TRUNCATE TABLE IF EXISTS public.notifications CASCADE;

-- 2. Hapus data tabel yang depend on users dan projects
TRUNCATE TABLE IF EXISTS public.project_reports CASCADE;
TRUNCATE TABLE IF EXISTS public.overtime_requests CASCADE;
TRUNCATE TABLE IF EXISTS public.overtime_sessions CASCADE;
TRUNCATE TABLE IF EXISTS public.employee_leave CASCADE;
TRUNCATE TABLE IF EXISTS public.payslips CASCADE;

-- 3. Hapus data junction tables (many-to-many relationships)
TRUNCATE TABLE IF EXISTS public.project_assignments CASCADE;
TRUNCATE TABLE IF EXISTS public.project_divisions CASCADE;
TRUNCATE TABLE IF EXISTS public.project_department_divisions CASCADE;
-- SKIP: user_divisions (agar user tetap punya divisi)
-- SKIP: user_departments (agar user tetap punya department)

-- 4. Hapus data projects (setelah semua yang depend on projects dihapus)
TRUNCATE TABLE IF EXISTS public.projects CASCADE;

-- 5. Hapus data divisions dan departments
TRUNCATE TABLE IF EXISTS public.divisions CASCADE;
TRUNCATE TABLE IF EXISTS public.departments CASCADE;

-- 6. SKIP: users (agar akun login tetap ada)
-- TRUNCATE TABLE public.users CASCADE; -- COMMENTED OUT

-- 7. Hapus data reports (jika ada tabel reports terpisah)
TRUNCATE TABLE IF EXISTS public.reports CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Verify: Check row counts
SELECT 
    'users (KEPT)' as table_name, COUNT(*) as row_count FROM public.users
UNION ALL
SELECT 'user_divisions (KEPT)', COUNT(*) FROM public.user_divisions
UNION ALL
SELECT 'user_departments (KEPT)', COUNT(*) FROM public.user_departments
UNION ALL
SELECT 'projects (DELETED)', COUNT(*) FROM public.projects
UNION ALL
SELECT 'divisions (DELETED)', COUNT(*) FROM public.divisions
UNION ALL
SELECT 'departments (DELETED)', COUNT(*) FROM public.departments
UNION ALL
SELECT 'project_reports (DELETED)', COUNT(*) FROM public.project_reports
UNION ALL
SELECT 'project_divisions (DELETED)', COUNT(*) FROM public.project_divisions
UNION ALL
SELECT 'project_department_divisions (DELETED)', COUNT(*) FROM public.project_department_divisions
UNION ALL
SELECT 'employee_leave (DELETED)', COUNT(*) FROM public.employee_leave
UNION ALL
SELECT 'payslips (DELETED)', COUNT(*) FROM public.payslips
UNION ALL
SELECT 'overtime_requests (DELETED)', COUNT(*) FROM public.overtime_requests
UNION ALL
SELECT 'overtime_sessions (DELETED)', COUNT(*) FROM public.overtime_sessions
ORDER BY table_name;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'All data has been truncated successfully!';
    RAISE NOTICE 'Table structures are preserved.';
    RAISE NOTICE 'User accounts are KEPT (not deleted).';
    RAISE NOTICE 'You can still login with existing accounts.';
    RAISE NOTICE 'Deleted tables should show 0 rows.';
END $$;
