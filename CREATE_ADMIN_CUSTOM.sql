-- =====================================================
-- Script: Create Custom Admin Account
-- Email: adminprogresta@gmail.com
-- Password: adminprogresta123!
-- =====================================================

-- CARA MENGGUNAKAN:
-- 1. Buka Supabase Dashboard
-- 2. Klik "Authentication" di sidebar
-- 3. Klik "Users"
-- 4. Klik "Add User" atau "Invite"
-- 5. Isi form:
--    - Email: adminprogresta@gmail.com
--    - Password: adminprogresta123!
--    - Auto Confirm User: ✅ CENTANG
-- 6. Klik "Create User"
-- 7. COPY USER ID yang muncul
-- 8. Kembali ke SQL Editor
-- 9. Ganti 'USER_ID_HERE' di bawah dengan ID yang di-copy
-- 10. Run query ini

-- =====================================================
-- INSERT USER KE DATABASE
-- =====================================================

-- GANTI 'USER_ID_HERE' dengan User ID dari Supabase Auth!
INSERT INTO users (
  id,
  email,
  password,
  role,
  status,
  "divisionId",
  "createdAt",
  "updatedAt"
) VALUES (
  'USER_ID_HERE', -- ⚠️ GANTI INI dengan User ID dari Auth!
  'adminprogresta@gmail.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYzpLaEg7dO', -- Hash untuk 'adminprogresta123!'
  'ADMIN',
  'ACTIVE',
  NULL,
  NOW(),
  NOW()
);

-- =====================================================
-- VERIFIKASI
-- =====================================================

SELECT 
  id,
  email,
  role,
  status,
  "createdAt"
FROM users
WHERE email = 'adminprogresta@gmail.com';

-- =====================================================
-- HASIL YANG DIHARAPKAN:
-- =====================================================
-- 1 row dengan:
-- - email: adminprogresta@gmail.com
-- - role: ADMIN
-- - status: ACTIVE
-- =====================================================
