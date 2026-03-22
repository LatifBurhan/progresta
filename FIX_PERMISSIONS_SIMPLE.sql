-- Fix permissions untuk tabel yang ada saja
-- Jalankan di Supabase SQL Editor

-- 1. Cek tabel yang ada
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Disable RLS untuk tabel utama yang ada
ALTER TABLE public.divisions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- 3. Coba disable untuk tabel lain (jika ada)
DO $$ 
BEGIN
    -- Projects
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'projects') THEN
        ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Reports  
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reports') THEN
        ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Report Details
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'report_details') THEN
        ALTER TABLE public.report_details DISABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Project Divisions
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_divisions') THEN
        ALTER TABLE public.project_divisions DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- 4. Grant permissions untuk tabel yang pasti ada
GRANT ALL ON public.divisions TO anon, authenticated, service_role;
GRANT ALL ON public.users TO anon, authenticated, service_role;

-- 5. Grant untuk tabel lain jika ada
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'projects') THEN
        GRANT ALL ON public.projects TO anon, authenticated, service_role;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reports') THEN
        GRANT ALL ON public.reports TO anon, authenticated, service_role;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'report_details') THEN
        GRANT ALL ON public.report_details TO anon, authenticated, service_role;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_divisions') THEN
        GRANT ALL ON public.project_divisions TO anon, authenticated, service_role;
    END IF;
END $$;

-- 6. Test query untuk divisions
SELECT id, name, color FROM public.divisions LIMIT 3;

-- 7. Test query untuk users  
SELECT id, email, role FROM public.users LIMIT 3;