-- ============================================================
-- Script untuk mengecek apakah kolom location tracking sudah ada
-- di tabel overtime_sessions
-- ============================================================

-- Cek kolom-kolom yang ada di tabel overtime_sessions
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'overtime_sessions'
    AND column_name IN (
        'clock_in_lat',
        'clock_in_lng', 
        'clock_out_lat',
        'clock_out_lng'
    )
ORDER BY 
    column_name;

-- Jika query di atas mengembalikan 4 baris, berarti kolom sudah ada
-- Jika mengembalikan 0 baris, berarti kolom belum ada dan perlu dijalankan migration
