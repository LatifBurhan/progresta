import type { Payslip, PayslipKomponen, RecapTotals } from './types'

/**
 * Hitung gaji bersih dari komponen gaji.
 * Formula: (gaji_pokok + lembur + insentif + tunjangan + dinas_luar) - (potongan_bpjs + potongan_pajak)
 */
export function hitungGajiBersih(komponen: PayslipKomponen): number {
  const pendapatan =
    komponen.gaji_pokok +
    komponen.lembur +
    komponen.insentif +
    komponen.tunjangan +
    komponen.dinas_luar

  const potongan = komponen.potongan_bpjs + komponen.potongan_pajak

  return pendapatan - potongan
}

/**
 * Hitung total rekap dari daftar payslips.
 */
export function hitungTotalRekap(payslips: Payslip[]): RecapTotals {
  return payslips.reduce<RecapTotals>(
    (acc, p) => ({
      total_gaji_pokok: acc.total_gaji_pokok + Number(p.gaji_pokok),
      total_lembur: acc.total_lembur + Number(p.lembur),
      total_insentif: acc.total_insentif + Number(p.insentif),
      total_tunjangan: acc.total_tunjangan + Number(p.tunjangan),
      total_dinas_luar: acc.total_dinas_luar + Number(p.dinas_luar),
      total_potongan_bpjs: acc.total_potongan_bpjs + Number(p.potongan_bpjs),
      total_potongan_pajak: acc.total_potongan_pajak + Number(p.potongan_pajak),
      total_gaji_bersih: acc.total_gaji_bersih + Number(p.gaji_bersih),
    }),
    {
      total_gaji_pokok: 0,
      total_lembur: 0,
      total_insentif: 0,
      total_tunjangan: 0,
      total_dinas_luar: 0,
      total_potongan_bpjs: 0,
      total_potongan_pajak: 0,
      total_gaji_bersih: 0,
    }
  )
}
