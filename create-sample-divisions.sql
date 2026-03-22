-- Buat divisi sample untuk testing
-- Jalankan di Supabase SQL Editor

-- Insert sample divisions
INSERT INTO public.divisions (id, name, description, color, is_active, created_at, updated_at) VALUES
(gen_random_uuid(), 'IT Development', 'Tim pengembangan aplikasi dan sistem', '#3B82F6', true, now(), now()),
(gen_random_uuid(), 'Human Resources', 'Divisi sumber daya manusia', '#10B981', true, now(), now()),
(gen_random_uuid(), 'Marketing', 'Tim pemasaran dan promosi', '#F59E0B', true, now(), now()),
(gen_random_uuid(), 'Finance', 'Divisi keuangan dan akuntansi', '#EF4444', true, now(), now()),
(gen_random_uuid(), 'Operations', 'Divisi operasional perusahaan', '#8B5CF6', true, now(), now())
ON CONFLICT (name) DO NOTHING;

-- Cek hasil
SELECT id, name, description, color, is_active, created_at FROM public.divisions ORDER BY name;