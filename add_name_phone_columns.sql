-- Tambah kolom name dan phone ke tabel users
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- Tambah comment
COMMENT ON COLUMN users.name IS 'Nama lengkap user';
COMMENT ON COLUMN users.phone IS 'Nomor telepon user';

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('name', 'phone');
