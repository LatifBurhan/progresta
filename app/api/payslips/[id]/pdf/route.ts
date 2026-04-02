import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { payslipError } from '@/lib/payslip/errors'
import { isPayslipManager } from '@/lib/payslip/roles'
import { getPayslipById } from '@/lib/payslip/queries'
import { readFileSync } from 'fs'
import { join } from 'path'

// Baca logo dari filesystem dan encode ke base64
function getLogoBase64(): string {
  try {
    const logoPath = join(process.cwd(), 'public', 'alwustho.png')
    const logoBuffer = readFileSync(logoPath)
    return `data:image/png;base64,${logoBuffer.toString('base64')}`
  } catch {
    return ''
  }
}

const BULAN_NAMES = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(amount))
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession()
    if (!session) {
      return payslipError('UNAUTHORIZED', 'Unauthorized', 401)
    }

    const { id } = await params
    const payslip = await getPayslipById(id)

    if (!payslip) {
      return payslipError('NOT_FOUND', 'Slip gaji tidak ditemukan', 404)
    }

    // Karyawan hanya bisa akses slip milik sendiri; Pengelola bisa akses semua
    if (!isPayslipManager(session.role) && payslip.user_id !== session.userId) {
      return payslipError('FORBIDDEN', 'Akses ditolak', 403)
    }

    // Ambil data karyawan dan GA yang publish
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('name, email, role, employee_status')
      .eq('id', payslip.user_id)
      .single()

    if (userError || !userData) {
      return payslipError('NOT_FOUND', 'Data karyawan tidak ditemukan', 404)
    }

    // Ambil nama GA yang publish
    let namaGA = '-'
    if (payslip.created_by) {
      const { data: gaData } = await supabaseAdmin
        .from('users')
        .select('name, email')
        .eq('id', payslip.created_by)
        .single()
      if (gaData) namaGA = gaData.name || gaData.email.split('@')[0]
    }

    const namaKaryawan = userData.name || userData.email.split('@')[0]
    const bulanNama = BULAN_NAMES[payslip.periode_bulan] || String(payslip.periode_bulan)
    const tahun = payslip.periode_tahun
    const totalPendapatan = Number(payslip.gaji_pokok) + Number(payslip.lembur) + Number(payslip.insentif) + Number(payslip.tunjangan) + Number(payslip.dinas_luar)
    const totalPotongan = Number(payslip.potongan_bpjs) + Number(payslip.potongan_pajak)
    const logoSrc = getLogoBase64()

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <title>Salary Slip - ${namaKaryawan} - ${bulanNama} ${tahun}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #222; background: #fff; }
    .page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: 12mm; }
    /* Header */
    .header { display: flex; align-items: center; border-bottom: 2px solid #222; padding-bottom: 10px; margin-bottom: 6px; }
    .logo { width: 70px; margin-right: 16px; }
    .company-info { flex: 1; text-align: center; }
    .company-name { font-size: 20px; font-weight: bold; }
    .company-address { font-size: 10px; color: #444; margin-top: 2px; }
    /* Title */
    .title-section { background: #c8e6c9; text-align: center; padding: 6px; margin: 8px 0 4px; border: 1px solid #aaa; }
    .title-section h2 { font-size: 13px; font-weight: bold; letter-spacing: 2px; }
    .periode { text-align: center; font-size: 11px; margin-bottom: 10px; }
    /* Info karyawan */
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    .info-table td { padding: 3px 6px; font-size: 11px; }
    .info-table td:first-child { width: 130px; }
    /* Komponen gaji */
    .komponen-wrapper { display: flex; gap: 12px; margin-bottom: 12px; }
    .komponen-col { flex: 1; }
    .komponen-col table { width: 100%; border-collapse: collapse; }
    .komponen-col th { background: #f5f5f5; border: 1px solid #bbb; padding: 5px 8px; font-size: 11px; text-align: center; font-weight: bold; }
    .komponen-col td { border: 1px solid #bbb; padding: 4px 8px; font-size: 11px; }
    .komponen-col td.label { width: 55%; }
    .komponen-col td.eq { width: 8%; text-align: center; }
    .komponen-col td.amount { text-align: right; }
    .total-row td { font-weight: bold; background: #f9f9f9; border-top: 2px solid #aaa; }
    /* Gaji bersih */
    .gaji-bersih-section { border: 1px solid #bbb; margin-bottom: 12px; }
    .gaji-bersih-section table { width: 100%; border-collapse: collapse; }
    .gaji-bersih-section td { padding: 5px 8px; font-size: 11px; }
    .gaji-bersih-section td.label { width: 55%; font-weight: bold; }
    .gaji-bersih-section td.eq { width: 8%; text-align: center; font-weight: bold; }
    .gaji-bersih-section td.amount { text-align: right; font-weight: bold; font-size: 13px; }
    /* Catatan */
    .catatan-section { border: 1px solid #bbb; padding: 6px 8px; margin-bottom: 16px; min-height: 40px; font-size: 11px; }
    .catatan-label { font-weight: bold; margin-bottom: 4px; }
    /* Footer */
    .footer { display: flex; justify-content: flex-end; margin-top: 8px; }
    .signature-block { text-align: center; min-width: 160px; }
    .signature-block .sig-title { font-size: 11px; margin-bottom: 50px; }
    .signature-block .sig-name { font-size: 11px; font-weight: bold; border-top: 1px solid #222; padding-top: 4px; }
    @media print {
      body { margin: 0; }
      .page { padding: 8mm; }
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <img src="${logoSrc}" class="logo" alt="Logo Alwustho" ${!logoSrc ? 'style="display:none"' : ''} />
      <div class="company-info">
        <div class="company-name">Alwustho Technologies</div>
        <div class="company-address">Gang Melom No. 15, Waringinrejo, Cemani, Grogol, Sukoharjo</div>
      </div>
    </div>

    <!-- Title -->
    <div class="title-section">
      <h2>SALARY SLIP</h2>
    </div>
    <div class="periode">( Periode ${bulanNama} ${tahun} )</div>

    <!-- Info Karyawan -->
    <table class="info-table">
      <tr><td>Nama</td><td>: ${namaKaryawan}</td></tr>
      <tr><td>Posisi</td><td>: ${userData.role}</td></tr>
      <tr><td>Nomor Karyawan</td><td>: ${payslip.user_id}</td></tr>
      <tr><td>Status Karyawan</td><td>: ${userData.employee_status || '-'}</td></tr>
    </table>

    <!-- Komponen Gaji -->
    <div class="komponen-wrapper">
      <!-- Penghasilan -->
      <div class="komponen-col">
        <table>
          <thead><tr><th colspan="3">PENGHASILAN</th></tr></thead>
          <tbody>
            <tr><td class="label">Gaji Pokok</td><td class="eq">=</td><td class="amount">${formatRupiah(Number(payslip.gaji_pokok))}</td></tr>
            <tr><td class="label">Lembur</td><td class="eq">=</td><td class="amount">${formatRupiah(Number(payslip.lembur))}</td></tr>
            <tr><td class="label">Insentif</td><td class="eq">=</td><td class="amount">${formatRupiah(Number(payslip.insentif))}</td></tr>
            <tr><td class="label">Tunjangan</td><td class="eq">=</td><td class="amount">${formatRupiah(Number(payslip.tunjangan))}</td></tr>
            <tr><td class="label">Dinas Luar</td><td class="eq">=</td><td class="amount">${formatRupiah(Number(payslip.dinas_luar))}</td></tr>
            <tr class="total-row"><td class="label">Total Penghasilan</td><td class="eq">=</td><td class="amount">${formatRupiah(totalPendapatan)}</td></tr>
          </tbody>
        </table>
      </div>
      <!-- Potongan -->
      <div class="komponen-col">
        <table>
          <thead><tr><th colspan="3">POTONGAN</th></tr></thead>
          <tbody>
            <tr><td class="label">Potongan BPJS</td><td class="eq">=</td><td class="amount">${formatRupiah(Number(payslip.potongan_bpjs))}</td></tr>
            <tr><td class="label">Potongan Pajak</td><td class="eq">=</td><td class="amount">${formatRupiah(Number(payslip.potongan_pajak))}</td></tr>
            <tr><td colspan="3" style="border:none;padding:4px 0;"></td></tr>
            <tr><td colspan="3" style="border:none;padding:4px 0;"></td></tr>
            <tr><td colspan="3" style="border:none;padding:4px 0;"></td></tr>
            <tr class="total-row"><td class="label">Total Potongan</td><td class="eq">=</td><td class="amount">${formatRupiah(totalPotongan)}</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Penerimaan Bersih -->
    <div class="gaji-bersih-section">
      <table>
        <tr>
          <td class="label">Penerimaan Bersih</td>
          <td class="eq">=</td>
          <td class="amount">${formatRupiah(Number(payslip.gaji_bersih))}</td>
        </tr>
      </table>
    </div>

    <!-- Catatan -->
    <div class="catatan-section">
      <div class="catatan-label">Catatan:</div>
      <div>${payslip.catatan || ''}</div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="signature-block">
        <div class="sig-title">Disahkan oleh :</div>
        <div class="sig-name">${namaGA}</div>
      </div>
    </div>
  </div>

  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`

    const safeName = namaKaryawan.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('GET /api/payslips/[id]/pdf error:', error)
    return NextResponse.json(
      { success: false, message: 'Gagal menghasilkan PDF, silakan coba lagi' },
      { status: 500 }
    )
  }
}
