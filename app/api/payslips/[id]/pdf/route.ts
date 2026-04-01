import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'
import { supabaseAdmin } from '@/lib/supabase'
import { payslipError } from '@/lib/payslip/errors'
import { isPayslipManager } from '@/lib/payslip/roles'
import { getPayslipById } from '@/lib/payslip/queries'

const BULAN_NAMES = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
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

    // Ambil data karyawan
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('name, email')
      .eq('id', payslip.user_id)
      .single()

    if (userError || !userData) {
      return payslipError('NOT_FOUND', 'Data karyawan tidak ditemukan', 404)
    }

    const namaKaryawan = userData.name || userData.email.split('@')[0]
    const bulanNama = BULAN_NAMES[payslip.periode_bulan] || String(payslip.periode_bulan)
    const tahun = payslip.periode_tahun

    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Slip Gaji - ${namaKaryawan} - ${bulanNama} ${tahun}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; color: #333; background: #fff; padding: 20px; }
    .container { max-width: 700px; margin: 0 auto; border: 2px solid #333; padding: 24px; }
    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 16px; margin-bottom: 16px; }
    .header h1 { font-size: 18px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }
    .header p { font-size: 12px; color: #666; margin-top: 4px; }
    .info-section { display: flex; justify-content: space-between; margin-bottom: 16px; }
    .info-block { flex: 1; }
    .info-block p { margin-bottom: 4px; }
    .info-block strong { display: inline-block; min-width: 120px; }
    .divider { border-top: 1px solid #ccc; margin: 12px 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    th { background: #f0f0f0; text-align: left; padding: 8px; border: 1px solid #ccc; font-size: 11px; text-transform: uppercase; }
    td { padding: 8px; border: 1px solid #ccc; }
    td.amount { text-align: right; }
    .total-row td { font-weight: bold; background: #f9f9f9; }
    .gaji-bersih-row td { font-weight: bold; font-size: 14px; background: #e8f5e9; }
    .footer { margin-top: 24px; display: flex; justify-content: space-between; }
    .signature-block { text-align: center; }
    .signature-block p { margin-bottom: 60px; }
    .catatan { margin-top: 12px; padding: 8px; background: #fffde7; border: 1px solid #f9a825; border-radius: 4px; font-size: 11px; }
    @media print {
      body { padding: 0; }
      .container { border: none; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Slip Gaji Karyawan</h1>
      <p>Periode: ${bulanNama} ${tahun}</p>
    </div>

    <div class="info-section">
      <div class="info-block">
        <p><strong>Nama Karyawan:</strong> ${namaKaryawan}</p>
        <p><strong>Email:</strong> ${userData.email}</p>
      </div>
      <div class="info-block" style="text-align:right;">
        <p><strong>Periode:</strong> ${bulanNama} ${tahun}</p>
        <p><strong>Status:</strong> ${payslip.status.toUpperCase()}</p>
        ${payslip.published_at ? `<p><strong>Diterbitkan:</strong> ${new Date(payslip.published_at).toLocaleDateString('id-ID')}</p>` : ''}
        ${payslip.acknowledged_at ? `<p><strong>Dikonfirmasi:</strong> ${new Date(payslip.acknowledged_at).toLocaleDateString('id-ID')}</p>` : ''}
      </div>
    </div>

    <div class="divider"></div>

    <table>
      <thead>
        <tr>
          <th>Komponen Pendapatan</th>
          <th style="text-align:right;">Jumlah</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Gaji Pokok</td><td class="amount">${formatRupiah(Number(payslip.gaji_pokok))}</td></tr>
        <tr><td>Lembur</td><td class="amount">${formatRupiah(Number(payslip.lembur))}</td></tr>
        <tr><td>Insentif</td><td class="amount">${formatRupiah(Number(payslip.insentif))}</td></tr>
        <tr><td>Tunjangan</td><td class="amount">${formatRupiah(Number(payslip.tunjangan))}</td></tr>
        <tr><td>Dinas Luar</td><td class="amount">${formatRupiah(Number(payslip.dinas_luar))}</td></tr>
        <tr class="total-row">
          <td>Total Pendapatan</td>
          <td class="amount">${formatRupiah(Number(payslip.gaji_pokok) + Number(payslip.lembur) + Number(payslip.insentif) + Number(payslip.tunjangan) + Number(payslip.dinas_luar))}</td>
        </tr>
      </tbody>
    </table>

    <table>
      <thead>
        <tr>
          <th>Komponen Potongan</th>
          <th style="text-align:right;">Jumlah</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Potongan BPJS</td><td class="amount">${formatRupiah(Number(payslip.potongan_bpjs))}</td></tr>
        <tr><td>Potongan Pajak</td><td class="amount">${formatRupiah(Number(payslip.potongan_pajak))}</td></tr>
        <tr class="total-row">
          <td>Total Potongan</td>
          <td class="amount">${formatRupiah(Number(payslip.potongan_bpjs) + Number(payslip.potongan_pajak))}</td>
        </tr>
      </tbody>
    </table>

    <table>
      <tbody>
        <tr class="gaji-bersih-row">
          <td>GAJI BERSIH</td>
          <td class="amount">${formatRupiah(Number(payslip.gaji_bersih))}</td>
        </tr>
      </tbody>
    </table>

    ${payslip.catatan ? `<div class="catatan"><strong>Catatan:</strong> ${payslip.catatan}</div>` : ''}

    <div class="footer">
      <div class="signature-block">
        <p>Karyawan</p>
        <p style="margin-top:0;">${namaKaryawan}</p>
      </div>
      <div class="signature-block">
        <p>HRD / Pengelola</p>
        <p style="margin-top:0;">___________________</p>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>`

    const safeName = namaKaryawan.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')
    const filename = `slip-gaji-${safeName}-${payslip.periode_bulan}-${tahun}.pdf`

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
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
