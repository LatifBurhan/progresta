-- ========================================
-- CHECK AND FIX FOREIGN KEYS
-- ========================================

-- 1. Cek foreign key constraints yang ada
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'project_reports';

-- 2. Drop existing foreign keys jika ada (untuk re-create)
ALTER TABLE project_reports DROP CONSTRAINT IF EXISTS project_reports_user_id_fkey;
ALTER TABLE project_reports DROP CONSTRAINT IF EXISTS project_reports_project_id_fkey;

-- 3. Re-create foreign keys dengan nama yang benar
ALTER TABLE project_reports
ADD CONSTRAINT project_reports_user_id_fkey
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE project_reports
ADD CONSTRAINT project_reports_project_id_fkey
FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;

-- 4. Verifikasi foreign keys sudah dibuat
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'project_reports';
