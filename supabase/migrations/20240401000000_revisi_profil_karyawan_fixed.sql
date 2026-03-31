-- Migration Part 2: Revisi Profil Karyawan (FIXED VERSION)
-- Date: 2024-04-01
-- Description: 
--   1. Tambah field: employee_status, address, notes
--   2. Ubah role: HRD -> GENERAL_AFFAIR, KARYAWAN -> STAFF
--   3. Tambah tabel relasi: user_departments, user_divisions
-- 
-- IMPORTANT: Run migration 20240401000001_add_new_role_values.sql FIRST!

-- ============================================
-- STEP 1: Tambah kolom baru di tabel users
-- ============================================

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS employee_status TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- ============================================
-- STEP 2: Buat tabel relasi user_departments
-- ============================================

CREATE TABLE IF NOT EXISTS user_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, department_id)
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_user_departments_user_id ON user_departments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_departments_department_id ON user_departments(department_id);

-- ============================================
-- STEP 3: Buat tabel relasi user_divisions
-- ============================================

CREATE TABLE IF NOT EXISTS user_divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  division_id UUID NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, division_id)
);

-- Index untuk performa
CREATE INDEX IF NOT EXISTS idx_user_divisions_user_id ON user_divisions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_divisions_division_id ON user_divisions(division_id);

-- ============================================
-- STEP 4: Migrate data lama (divisionId) ke user_divisions
-- ============================================

-- Insert existing user-division relationships
INSERT INTO user_divisions (user_id, division_id)
SELECT id, "divisionId"
FROM users
WHERE "divisionId" IS NOT NULL
ON CONFLICT (user_id, division_id) DO NOTHING;

-- ============================================
-- STEP 5: Update role names in users table
-- ============================================

-- Update HRD -> GENERAL_AFFAIR
UPDATE users SET role = 'GENERAL_AFFAIR' WHERE role = 'HRD';

-- Update KARYAWAN -> STAFF  
UPDATE users SET role = 'STAFF' WHERE role = 'KARYAWAN';

-- ============================================
-- STEP 6: Update default role
-- ============================================

-- Update default role dari KARYAWAN ke STAFF
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'STAFF';

-- ============================================
-- STEP 7: RLS Policies untuk tabel baru (skip if exists)
-- ============================================

-- Enable RLS
ALTER TABLE user_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_divisions ENABLE ROW LEVEL SECURITY;

-- Policy: Semua authenticated users bisa read (skip if exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_departments' 
    AND policyname = 'Allow authenticated users to read user_departments'
  ) THEN
    CREATE POLICY "Allow authenticated users to read user_departments"
      ON user_departments FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_divisions' 
    AND policyname = 'Allow authenticated users to read user_divisions'
  ) THEN
    CREATE POLICY "Allow authenticated users to read user_divisions"
      ON user_divisions FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Policy: Hanya ADMIN dan GENERAL_AFFAIR bisa insert/update/delete (skip if exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_departments' 
    AND policyname = 'Allow admin and general_affair to manage user_departments'
  ) THEN
    CREATE POLICY "Allow admin and general_affair to manage user_departments"
      ON user_departments FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND users.role IN ('ADMIN', 'GENERAL_AFFAIR')
        )
      );
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_divisions' 
    AND policyname = 'Allow admin and general_affair to manage user_divisions'
  ) THEN
    CREATE POLICY "Allow admin and general_affair to manage user_divisions"
      ON user_divisions FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND users.role IN ('ADMIN', 'GENERAL_AFFAIR')
        )
      );
  END IF;
END $$;

-- ============================================
-- STEP 8: Grant permissions
-- ============================================

GRANT SELECT ON user_departments TO authenticated;
GRANT SELECT ON user_divisions TO authenticated;
GRANT ALL ON user_departments TO service_role;
GRANT ALL ON user_divisions TO service_role;

-- ============================================
-- STEP 9: Komentar untuk dokumentasi
-- ============================================

COMMENT ON COLUMN users.employee_status IS 'Status karyawan (Tetap, Kontrak, Magang, dll) - text bebas';
COMMENT ON COLUMN users.address IS 'Alamat lengkap karyawan';
COMMENT ON COLUMN users.notes IS 'Catatan tentang karyawan - hanya bisa diedit oleh ADMIN dan GENERAL_AFFAIR';

COMMENT ON TABLE user_departments IS 'Relasi many-to-many antara users dan departments';
COMMENT ON TABLE user_divisions IS 'Relasi many-to-many antara users dan divisions';

-- ============================================
-- SELESAI
-- ============================================

-- Verify migration
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'New columns added: employee_status, address, notes';
  RAISE NOTICE 'New tables created: user_departments, user_divisions';
  RAISE NOTICE 'Roles updated: HRD->GENERAL_AFFAIR, KARYAWAN->STAFF';
END $$;
