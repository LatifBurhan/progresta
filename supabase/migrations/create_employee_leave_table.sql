-- ============================================================
-- Migration: create_employee_leave_table
-- Description: Tabel untuk menyimpan data cuti karyawan per tahun
-- ============================================================

CREATE TABLE employee_leave (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,

  tahun SMALLINT NOT NULL CHECK (tahun >= 2020),

  -- Jatah cuti tahunan (default 12)
  jatah_cuti SMALLINT NOT NULL DEFAULT 12 CHECK (jatah_cuti >= 0),

  -- Input manual oleh GA
  cuti_terpakai SMALLINT NOT NULL DEFAULT 0 CHECK (cuti_terpakai >= 0),
  jumlah_sakit SMALLINT NOT NULL DEFAULT 0 CHECK (jumlah_sakit >= 0),
  jumlah_izin SMALLINT NOT NULL DEFAULT 0 CHECK (jumlah_izin >= 0),
  jumlah_alpha SMALLINT NOT NULL DEFAULT 0 CHECK (jumlah_alpha >= 0),

  -- Sisa cuti (generated)
  sisa_cuti SMALLINT GENERATED ALWAYS AS (
    GREATEST(jatah_cuti - cuti_terpakai, 0)
  ) STORED,

  catatan TEXT,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Satu record per karyawan per tahun
  CONSTRAINT uq_employee_leave_user_tahun UNIQUE (user_id, tahun)
);

CREATE INDEX idx_employee_leave_user_id ON employee_leave(user_id);
CREATE INDEX idx_employee_leave_tahun ON employee_leave(tahun);

CREATE TRIGGER trg_employee_leave_updated_at
  BEFORE UPDATE ON employee_leave
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE employee_leave ENABLE ROW LEVEL SECURITY;

-- Karyawan bisa baca data cuti sendiri
CREATE POLICY "Karyawan dapat membaca cuti sendiri"
  ON employee_leave FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Pengelola bisa semua operasi
CREATE POLICY "Pengelola dapat mengelola semua data cuti"
  ON employee_leave FOR ALL
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

GRANT SELECT ON employee_leave TO authenticated;
GRANT ALL ON employee_leave TO service_role;
