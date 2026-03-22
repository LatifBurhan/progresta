-- ========================================
-- SCRIPT MENAMBAH DIVISI - PROGRESTA (FIXED)
-- ========================================
-- Jalankan script ini di Supabase SQL Editor

-- 1. Cek struktur tabel divisions dulu
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'divisions' AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Insert divisi baru (tanpa is_active karena kolom tidak ada)
INSERT INTO public.divisions (id, name, description, color, created_at, updated_at) VALUES
-- IT & Technology
(gen_random_uuid(), 'IT Development', 'Tim pengembangan aplikasi, website, dan sistem informasi', '#3B82F6', now(), now()),
(gen_random_uuid(), 'IT Support', 'Tim dukungan teknis dan maintenance sistem', '#1E40AF', now(), now()),

-- Business & Management  
(gen_random_uuid(), 'Human Resources', 'Divisi sumber daya manusia dan rekrutmen', '#10B981', now(), now()),
(gen_random_uuid(), 'Finance', 'Divisi keuangan, akuntansi, dan budget', '#EF4444', now(), now()),
(gen_random_uuid(), 'Operations', 'Divisi operasional dan manajemen harian', '#8B5CF6', now(), now()),

-- Marketing & Sales
(gen_random_uuid(), 'Marketing', 'Tim pemasaran, promosi, dan branding', '#F59E0B', now(), now()),
(gen_random_uuid(), 'Sales', 'Tim penjualan dan customer relationship', '#F97316', now(), now()),

-- Creative & Design
(gen_random_uuid(), 'Design', 'Tim desain grafis, UI/UX, dan kreatif', '#EC4899', now(), now()),
(gen_random_uuid(), 'Content', 'Tim konten, copywriting, dan media sosial', '#06B6D4', now(), now()),

-- Support & Services
(gen_random_uuid(), 'Customer Service', 'Tim layanan pelanggan dan support', '#84CC16', now(), now())

-- Ignore jika nama sudah ada
ON CONFLICT (name) DO NOTHING;

-- 3. Cek hasil insert
SELECT 
    id,
    name,
    description,
    color,
    created_at,
    updated_at
FROM public.divisions 
ORDER BY name;

-- 4. Hitung total divisi
SELECT COUNT(*) as total_divisi FROM public.divisions;