-- Fix Database Permissions untuk Progresta
-- Jalankan script ini di Supabase SQL Editor

-- 1. Disable RLS untuk tabel users (sementara)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 2. Disable RLS untuk tabel divisions
ALTER TABLE public.divisions DISABLE ROW LEVEL SECURITY;

-- 3. Disable RLS untuk tabel projects  
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;

-- 4. Grant permissions untuk service role
GRANT ALL ON public.users TO service_role;
GRANT ALL ON public.divisions TO service_role;
GRANT ALL ON public.projects TO service_role;
GRANT ALL ON public.reports TO service_role;
GRANT ALL ON public.report_details TO service_role;
GRANT ALL ON public.project_assignments TO service_role;
GRANT ALL ON public.project_divisions TO service_role;

-- 5. Grant permissions untuk authenticated users
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.divisions TO authenticated;
GRANT SELECT ON public.projects TO authenticated;

-- 6. Grant permissions untuk anon users (untuk login)
GRANT SELECT ON public.users TO anon;

-- 7. Cek apakah user prabowo ada
SELECT id, email, name, role, status_pending FROM public.users WHERE email = 'prabowo@gmail.com';

-- 8. Jika tidak ada, tampilkan semua users
SELECT id, email, name, role, status_pending, created_at FROM public.users ORDER BY created_at DESC;