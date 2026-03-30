-- =====================================================
-- Script: Create Admin Account
-- Description: Membuat akun ADMIN baru untuk login
-- Date: 2026-03-30
-- =====================================================

-- CARA MENGGUNAKAN:
-- 1. Buka Supabase Dashboard
-- 2. Klik "SQL Editor" di sidebar
-- 3. Copy-paste script ini
-- 4. Klik "Run" atau tekan Ctrl+Enter
-- 5. Login dengan email dan password yang tertera di bawah

-- =====================================================
-- ADMIN ACCOUNT CREDENTIALS
-- =====================================================
-- Email: admin@alwustho.com
-- Password: Admin123!
-- Role: ADMIN
-- =====================================================

-- Step 1: Create user in Supabase Auth
-- NOTE: Ini harus dijalankan via Supabase Dashboard → Authentication → Add User
-- Atau gunakan API endpoint yang sudah ada

-- Step 2: Insert user ke database
-- Ganti 'USER_ID_FROM_AUTH' dengan ID user yang dibuat di step 1
-- Atau jalankan query ini setelah user dibuat via Auth

-- Untuk kemudahan, kita akan membuat user dengan ID yang sudah ditentukan
-- Pastikan ID ini belum digunakan

DO $$
DECLARE
  admin_user_id UUID := gen_random_uuid();
  admin_email TEXT := 'admin@alwustho.com';
  admin_password TEXT := 'Admin123!';
  hashed_password TEXT;
BEGIN
  -- Check if user already exists
  IF EXISTS (SELECT 1 FROM users WHERE email = admin_email) THEN
    RAISE NOTICE 'User % already exists!', admin_email;
  ELSE
    -- Note: Password hashing harus dilakukan di aplikasi
    -- Untuk sementara, kita akan insert user dengan placeholder
    -- User harus dibuat via Supabase Auth Dashboard atau API
    
    RAISE NOTICE 'Please create user in Supabase Auth first:';
    RAISE NOTICE 'Email: %', admin_email;
    RAISE NOTICE 'Password: %', admin_password;
    RAISE NOTICE 'Then run the INSERT query below with the user ID';
  END IF;
END $$;

-- =====================================================
-- ALTERNATIVE: Manual Insert (Setelah user dibuat di Auth)
-- =====================================================

-- Uncomment dan ganti USER_ID_FROM_AUTH dengan ID user yang sebenarnya
/*
INSERT INTO users (
  id,
  email,
  role,
  status,
  "divisionId",
  "createdAt",
  "updatedAt"
) VALUES (
  'USER_ID_FROM_AUTH', -- Ganti dengan ID dari Supabase Auth
  'admin@alwustho.com',
  'ADMIN',
  'ACTIVE',
  NULL, -- ADMIN tidak perlu divisi
  NOW(),
  NOW()
);
*/

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Jalankan query ini untuk memastikan user sudah dibuat

SELECT 
  id,
  email,
  role,
  status,
  "createdAt"
FROM users
WHERE email = 'admin@alwustho.com';

-- =====================================================
-- CLEANUP (Jika perlu hapus user)
-- =====================================================
-- Uncomment jika ingin hapus user ini

/*
DELETE FROM users WHERE email = 'admin@alwustho.com';
*/
