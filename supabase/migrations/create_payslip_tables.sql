-- ============================================================
-- Migration: create_payslip_tables
-- Description: Creates payslips table with indexes, constraints,
--              RLS policies, and updated_at trigger for the
--              Payslip Management System.
-- ============================================================

-- ============================================================
-- payslips table
-- ============================================================
CREATE TABLE payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relasi
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  -- Periode
  periode_bulan SMALLINT NOT NULL CHECK (periode_bulan BETWEEN 1 AND 12),
  periode_tahun SMALLINT NOT NULL CHECK (periode_tahun >= 2020),

  -- Komponen Pendapatan (wajib, tidak boleh negatif)
  gaji_pokok NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (gaji_pokok >= 0),
  lembur NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (lembur >= 0),
  insentif NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (insentif >= 0),
  tunjangan NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (tunjangan >= 0),
  dinas_luar NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (dinas_luar >= 0),

  -- Komponen Potongan (opsional, tidak boleh negatif)
  potongan_bpjs NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (potongan_bpjs >= 0),
  potongan_pajak NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (potongan_pajak >= 0),

  -- Gaji Bersih (generated column)
  gaji_bersih NUMERIC(15, 2) GENERATED ALWAYS AS (
    (gaji_pokok + lembur + insentif + tunjangan + dinas_luar)
    - (potongan_bpjs + potongan_pajak)
  ) STORED,

  -- Status
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'acknowledged')),

  -- Catatan opsional
  catatan TEXT,

  -- Audit timestamps
  published_at TIMESTAMP WITH TIME ZONE,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Constraint unik: satu slip per karyawan per periode
  CONSTRAINT uq_payslip_user_periode UNIQUE (user_id, periode_bulan, periode_tahun)
);

-- ============================================================
-- Task 1.2: Indexes dan trigger updated_at
-- ============================================================

-- Indexes untuk performa
CREATE INDEX idx_payslips_user_id ON payslips(user_id);
CREATE INDEX idx_payslips_periode ON payslips(periode_tahun, periode_bulan);
CREATE INDEX idx_payslips_status ON payslips(status);
CREATE INDEX idx_payslips_created_by ON payslips(created_by);

-- Constraint konsistensi status dan timestamp
ALTER TABLE payslips
  ADD CONSTRAINT check_published_at_consistency
  CHECK (
    (status IN ('published', 'acknowledged') AND published_at IS NOT NULL) OR
    (status = 'draft' AND published_at IS NULL)
  );

ALTER TABLE payslips
  ADD CONSTRAINT check_acknowledged_at_consistency
  CHECK (
    (status = 'acknowledged' AND acknowledged_at IS NOT NULL) OR
    (status != 'acknowledged' AND acknowledged_at IS NULL)
  );

-- Trigger updated_at (menggunakan fungsi yang sudah ada dari migrasi sebelumnya)
CREATE TRIGGER trg_payslips_updated_at
  BEFORE UPDATE ON payslips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Task 1.3: RLS Policies
-- ============================================================

-- Aktifkan RLS
ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;

-- Karyawan hanya bisa membaca slip gaji milik sendiri yang sudah published/acknowledged
CREATE POLICY "Karyawan dapat membaca slip gaji sendiri"
  ON payslips FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    AND status IN ('published', 'acknowledged')
  );

-- Pengelola (GENERAL_AFFAIR, CEO, ADMIN) dapat melakukan semua operasi
CREATE POLICY "Pengelola dapat mengelola semua slip gaji"
  ON payslips FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role IN ('GENERAL_AFFAIR', 'CEO', 'ADMIN')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role IN ('GENERAL_AFFAIR', 'CEO', 'ADMIN')
    )
  );

-- Karyawan dapat mengupdate status acknowledged pada slip gaji milik sendiri
CREATE POLICY "Karyawan dapat konfirmasi slip gaji sendiri"
  ON payslips FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid()
    AND status = 'published'
  )
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'acknowledged'
  );

-- Grant permissions
GRANT SELECT ON payslips TO authenticated;
GRANT ALL ON payslips TO service_role;
