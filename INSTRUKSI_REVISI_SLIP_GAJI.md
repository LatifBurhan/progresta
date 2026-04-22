# Instruksi Revisi Slip Gaji - Bonus KPI

## ✅ Yang Sudah Dikerjakan

Saya sudah mengupdate semua file yang diperlukan untuk menambahkan field "Bonus KPI" dan mengubah label:

### 1. Database Migration
- ✅ File: `supabase/migrations/add_bonus_kpi_to_payslips.sql`
- Menambah kolom `bonus_kpi` ke tabel `payslips`
- Update rumus `gaji_bersih` untuk include bonus_kpi

### 2. Frontend Components
- ✅ `app/dashboard/admin/payslips/PayslipFormModal.tsx` - Form create/edit slip gaji
- ✅ `app/dashboard/admin/payslips/BulkGenerateModal.tsx` - Form bulk generate
- ✅ `app/dashboard/payslips/PayslipEmployeeClient.tsx` - Tampilan slip gaji karyawan
- ✅ `app/dashboard/admin/payslips/recap/PayslipRecapClient.tsx` - Rekap penggajian

### 3. Backend (Types & Logic)
- ✅ `lib/payslip/types.ts` - Update interface dengan bonus_kpi
- ✅ `lib/payslip/calculator.ts` - Update rumus gaji bersih

### 4. API Routes
- ✅ `app/api/admin/payslips/route.ts` - Create payslip
- ✅ `app/api/admin/payslips/[id]/route.ts` - Update payslip
- ✅ `app/api/admin/payslips/bulk/route.ts` - Bulk generate

### 5. Perubahan Label
- ✅ "Tunjangan" → "Tunjangan Pokok"
- ✅ "Potongan Pajak" → "Potongan Pajak PPH21"
- ✅ Tambah field "Bonus KPI" (setelah Tunjangan Pokok)

---

## 🚀 Yang Perlu Anda Lakukan

### Langkah 1: Jalankan Migration SQL di Supabase

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project Anda
3. Klik menu "SQL Editor" di sidebar kiri
4. Klik "New Query"
5. Copy-paste isi file `supabase/migrations/add_bonus_kpi_to_payslips.sql`
6. Klik tombol "Run" atau tekan Ctrl+Enter

**Isi SQL yang perlu dijalankan:**

```sql
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
```

### Langkah 2: Restart Development Server (Jika Sedang Running)

Jika aplikasi Next.js Anda sedang berjalan, restart dengan:

```bash
# Stop server (Ctrl+C)
# Lalu jalankan lagi
npm run dev
```

### Langkah 3: Test Fitur Baru

1. **Test Create Slip Gaji:**
   - Login sebagai admin/HRD
   - Buka halaman Payslips Management
   - Klik "Buat Slip Gaji"
   - Pastikan field "Bonus KPI" muncul (setelah "Tunjangan Pokok")
   - Isi semua field dan simpan

2. **Test Bulk Generate:**
   - Pilih beberapa karyawan
   - Klik "Bulk Generate"
   - Pastikan field "Bonus KPI" ada
   - Generate dan cek hasilnya

3. **Test Tampilan Karyawan:**
   - Login sebagai karyawan
   - Buka halaman Payslips
   - Expand slip gaji
   - Pastikan "Bonus KPI" muncul di bagian Pendapatan
   - Pastikan label "Tunjangan Pokok" dan "Potongan Pajak PPH21" sudah benar

4. **Test Rekap:**
   - Login sebagai admin
   - Buka Rekap Penggajian
   - Pastikan "Bonus KPI" muncul di breakdown
   - Test export CSV

---

## 📋 Checklist Verifikasi

- [ ] Migration SQL berhasil dijalankan tanpa error
- [ ] Field "Bonus KPI" muncul di form create slip gaji
- [ ] Field "Bonus KPI" muncul di form bulk generate
- [ ] Label "Tunjangan Pokok" sudah benar (bukan "Tunjangan")
- [ ] Label "Potongan Pajak PPH21" sudah benar (bukan "Potongan Pajak")
- [ ] Bonus KPI muncul di tampilan slip gaji karyawan
- [ ] Perhitungan gaji bersih sudah include bonus_kpi
- [ ] Rekap penggajian menampilkan total bonus_kpi
- [ ] Export CSV include kolom Bonus KPI

---

## ⚠️ Troubleshooting

### Error: "column bonus_kpi does not exist"
**Solusi:** Migration SQL belum dijalankan. Jalankan SQL di Supabase Dashboard.

### Error: "cannot drop column gaji_bersih"
**Solusi:** Ada constraint yang menghalangi. Coba jalankan:
```sql
ALTER TABLE payslips DROP COLUMN gaji_bersih CASCADE;
```

### Bonus KPI tidak muncul di form
**Solusi:** Clear browser cache atau hard refresh (Ctrl+Shift+R)

### Gaji bersih tidak update otomatis
**Solusi:** Kolom `gaji_bersih` adalah generated column, akan auto-update saat data disimpan.

---

## 📞 Bantuan

Jika ada masalah atau pertanyaan, tanyakan saja! Saya siap membantu.
