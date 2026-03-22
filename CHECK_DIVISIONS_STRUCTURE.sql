-- Cek struktur tabel divisions
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'divisions' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Cek data yang sudah ada
SELECT * FROM public.divisions LIMIT 5;