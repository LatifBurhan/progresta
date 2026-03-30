-- =====================================================
-- Script: Reset Database - Hapus Semua Data Test
-- Description: Menghapus semua data dari database tapi tetap mempertahankan struktur tabel
-- Date: 2026-03-30
-- =====================================================

-- PERINGATAN: Script ini akan menghapus SEMUA data!
-- Pastikan Anda sudah backup data penting sebelum menjalankan script ini.

-- CARA MENGGUNAKAN:
-- 1. Buka Supabase Dashboard
-- 2. Klik "SQL Editor" di sidebar
-- 3. Copy-paste script ini
-- 4. Klik "Run" atau tekan Ctrl+Enter

-- =====================================================
-- STEP 1: Hapus Data dari Tabel (urutan penting karena foreign key)
-- =====================================================

-- Hapus data reports (laporan)
DELETE FROM reports;

-- Hapus data project_department_divisions (junction table)
DELETE FROM project_department_divisions;

-- Hapus data project_divisions (junction table)
DELETE FROM project_divisions;

-- Hapus data projects
DELETE FROM projects;

-- Hapus data users (kecuali yang akan kita buat nanti)
DELETE FROM users;

-- Hapus data divisions (kecuali yang default)
DELETE FROM divisions;

-- JANGAN hapus departments karena ini data master yang diperlukan
-- DELETE FROM departments; -- JANGAN UNCOMMENT INI!

-- =====================================================
-- STEP 2: Reset Sequences (Auto-increment IDs jika ada)
-- =====================================================

-- Tidak ada sequence yang perlu direset karena semua menggunakan UUID

-- =====================================================
-- STEP 3: Hapus Users dari Supabase Auth
-- =====================================================

-- CATATAN: Ini harus dilakukan manual di Supabase Dashboard
-- Karena tidak bisa dilakukan via SQL query biasa

-- Cara manual:
-- 1. Buka Supabase Dashboard
-- 2. Klik "Authentication" → "Users"
-- 3. Pilih semua user (centang checkbox)
-- 4. Klik "Delete" atau tombol hapus
-- 5. Konfirmasi penghapusan

-- =====================================================
-- STEP 4: Buat Ulang Divisi Default (Opsional)
-- =====================================================

-- Jika Anda ingin membuat divisi default untuk setiap departemen
-- Uncomment query di bawah ini

/*
-- Ambil ID departemen
DO $$
DECLARE
  dept_alwustho UUID;
  dept_elfan UUID;
  dept_ufuk UUID;
  dept_aflaha UUID;
BEGIN
  -- Get department IDs
  SELECT id INTO dept_alwustho FROM departments WHERE name = 'Al-Wustho';
  SELECT id INTO dept_elfan FROM departments WHERE name = 'Elfan Academy';
  SELECT id INTO dept_ufuk FROM departments WHERE name = 'Ufuk Hijau';
  SELECT id INTO dept_aflaha FROM departments WHERE name = 'Aflaha';

  -- Insert default divisions
  INSERT INTO divisions (name, description, color, department_id, "isActive", "createdAt", "updatedAt") VALUES
    ('Divisi Umum Al-Wustho', 'Divisi umum untuk departemen Al-Wustho', '#3B82F6', dept_alwustho, true, NOW(), NOW()),
    ('Divisi Umum Elfan', 'Divisi umum untuk departemen Elfan Academy', '#10B981', dept_elfan, true, NOW(), NOW()),
    ('Divisi Umum Ufuk', 'Divisi umum untuk departemen Ufuk Hijau', '#F59E0B', dept_ufuk, true, NOW(), NOW()),
    ('Divisi Umum Aflaha', 'Divisi umum untuk departemen Aflaha', '#8B5CF6', dept_aflaha, true, NOW(), NOW());
END $$;
*/

-- =====================================================
-- STEP 5: Verifikasi - Cek Data yang Tersisa
-- =====================================================

-- Cek jumlah data di setiap tabel
SELECT 'departments' as table_name, COUNT(*) as count FROM departments
UNION ALL
SELECT 'divisions', COUNT(*) FROM divisions
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'reports', COUNT(*) FROM reports
UNION ALL
SELECT 'project_divisions', COUNT(*) FROM project_divisions
UNION ALL
SELECT 'project_department_divisions', COUNT(*) FROM project_department_divisions
ORDER BY table_name;

-- Cek departments yang masih ada (seharusnya 4)
SELECT id, name, color, "isActive" FROM departments ORDER BY name;

-- Cek divisions yang masih ada (seharusnya 0 atau sesuai yang dibuat di step 4)
SELECT id, name, department_id, "isActive" FROM divisions ORDER BY name;

-- =====================================================
-- HASIL YANG DIHARAPKAN:
-- =====================================================
-- departments: 4 (Al-Wustho, Elfan Academy, Ufuk Hijau, Aflaha)
-- divisions: 0 (atau 4 jika uncomment step 4)
-- users: 0
-- projects: 0
-- reports: 0
-- project_divisions: 0
-- project_department_divisions: 0
-- =====================================================

-- =====================================================
-- LANGKAH SELANJUTNYA:
-- =====================================================
-- 1. Hapus users dari Supabase Auth (manual via dashboard)
-- 2. Buat admin account baru dengan script: node scripts/create-admin.mjs
-- 3. Login sebagai admin
-- 4. Buat divisi baru sesuai kebutuhan
-- 5. Buat user baru sesuai kebutuhan
-- =====================================================
