-- Migration Part 1: Add new Role ENUM values
-- Date: 2024-04-01
-- Description: Tambah nilai GENERAL_AFFAIR dan STAFF ke enum Role
-- Note: Harus dijalankan TERPISAH karena PostgreSQL requirement

-- ============================================
-- Add new values to Role ENUM
-- ============================================

-- Add GENERAL_AFFAIR to enum (will be used to replace HRD)
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'GENERAL_AFFAIR';

-- Add STAFF to enum (will be used to replace KARYAWAN)
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'STAFF';

-- Verify
DO $$
BEGIN
  RAISE NOTICE 'New Role values added: GENERAL_AFFAIR, STAFF';
  RAISE NOTICE 'Please run the next migration to update existing data';
END $$;
