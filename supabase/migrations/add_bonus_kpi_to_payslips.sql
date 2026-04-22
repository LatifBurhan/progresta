-- ============================================================
-- Migration: add_bonus_kpi_to_payslips
-- Description: Menambahkan kolom bonus_kpi ke tabel payslips
--              dan update generated column gaji_bersih
-- ============================================================

-- Tambah kolom bonus_kpi
ALTER TABLE payslips
ADD COLUMN bonus_kpi NUMERIC(15, 2) NOT NULL DEFAULT 0 CHECK (bonus_kpi >= 0);

-- Drop generated column gaji_bersih yang lama
ALTER TABLE payslips
DROP COLUMN gaji_bersih;

-- Buat ulang generated column gaji_bersih dengan bonus_kpi
ALTER TABLE payslips
ADD COLUMN gaji_bersih NUMERIC(15, 2) GENERATED ALWAYS AS (
  (gaji_pokok + lembur + insentif + tunjangan + bonus_kpi + dinas_luar)
  - (potongan_bpjs + potongan_pajak)
) STORED;

-- Tambah index untuk performa (opsional)
CREATE INDEX idx_payslips_bonus_kpi ON payslips(bonus_kpi) WHERE bonus_kpi > 0;
