# Quick Fix: Webhook Verification Error

## Yang Sudah Saya Perbaiki

1. ✅ Membuat route `/api/webhook/route.ts` (URL lama yang berhasil)
2. ✅ Menambahkan logging detail untuk debugging
3. ✅ Memastikan response plain text (bukan JSON)
4. ✅ Menambahkan Content-Type header

## Yang Perlu Anda Lakukan SEKARANG

### 1. Deploy ke Vercel

```bash
git add .
git commit -m "fix: improve webhook verification with detailed logging"
git push
```

Tunggu deployment selesai (1-2 menit).

### 2. Cek Environment Variables di Vercel

**SANGAT PENTING!**

1. Buka: https://vercel.com/dashboard
2. Pilih project `crm-wa`
3. Settings > Environment Variables
4. Pastikan ada variable ini:

```
Name: WABA_WEBHOOK_VERIFY_TOKEN
Value: whatsapp_crm_webhook_secret_2024
```

5. **Apply to**: Centang **Production, Preview, Development**
6. Klik **Save**
7. **Redeploy** (klik Deployments > Latest > ... > Redeploy)

### 3. Test Endpoint Manual

Buka di browser:

```
https://crm-wa.vercel.app/api/webhook?hub.mode=subscribe&hub.verify_token=whatsapp_crm_webhook_secret_2024&hub.challenge=test123
```

**Harus muncul**: `test123` (plain text)

**Jika muncul error atau JSON**, berarti environment variable belum di-set atau belum di-redeploy.

### 4. Konfigurasi di Meta (LOKASI YANG BENAR!)

**JANGAN** konfigurasi di "App Webhooks"!

**Ikuti ini**:

1. Buka: https://developers.facebook.com/apps/
2. Pilih app WhatsApp
3. **Sidebar kiri**: Klik **"WhatsApp"** (bukan "Webhooks")
4. Klik **"Configuration"**
5. Scroll ke **"Webhook"**
6. Klik **"Edit"**

**Masukkan**:
```
Callback URL: https://crm-wa.vercel.app/api/webhook
Verify token: whatsapp_crm_webhook_secret_2024
```

7. Klik **"Verify and Save"**

### 5. Cek Logs di Vercel

Saat Meta verify webhook:

1. Buka Vercel Dashboard
2. Deployments > Latest > Functions
3. Klik `/api/webhook`
4. Lihat logs

**Harus muncul**:
```
📞 Webhook verification request received
Mode: subscribe
Token received: yes
Challenge: [angka]
Expected token: set
✅ Webhook verified successfully
```

**Jika muncul**:
```
Expected token: NOT SET
```

Berarti environment variable belum di-set atau belum di-redeploy!

## Troubleshooting

### Masalah: Test manual return error

**Solusi**:
1. Cek environment variable di Vercel
2. Redeploy app
3. Tunggu 1-2 menit
4. Test lagi

### Masalah: Meta masih error "URL couldn't be validated"

**Kemungkinan**:
1. Environment variable belum di-set
2. App belum di-redeploy setelah set environment variable
3. Konfigurasi di tempat yang salah (App Webhooks vs WhatsApp Configuration)

**Solusi**:
1. Pastikan environment variable ada di Vercel
2. Redeploy app
3. Pastikan konfigurasi di **WhatsApp > Configuration**, bukan App Webhooks
4. Hapus webhook configuration di Meta, tunggu 5 menit, coba lagi

### Masalah: Token tidak match

**Solusi**:
1. Copy token dari sini: `whatsapp_crm_webhook_secret_2024`
2. Paste ke Meta (jangan ketik manual)
3. Pastikan tidak ada spasi di awal/akhir

## Checklist Sebelum Verify di Meta

- [ ] Code sudah di-push ke Git
- [ ] Deployment di Vercel selesai (status: Ready)
- [ ] Environment variable `WABA_WEBHOOK_VERIFY_TOKEN` ada di Vercel
- [ ] App sudah di-redeploy setelah tambah environment variable
- [ ] Test manual endpoint return `test123` (plain text)
- [ ] Konfigurasi di WhatsApp > Configuration (bukan App Webhooks)

## Jika Semua Sudah Benar Tapi Masih Error

Coba ini:

1. **Hapus webhook configuration di Meta**
2. **Tunggu 5-10 menit** (Meta perlu clear cache)
3. **Redeploy app di Vercel**
4. **Test manual endpoint lagi**
5. **Konfigurasi webhook lagi dari awal**

## Kontak Jika Masih Error

Screenshot yang perlu:
1. Environment variables di Vercel (hide sensitive values)
2. Error message di Meta
3. Vercel logs saat Meta verify webhook
4. Result dari test manual endpoint

Dengan info ini, saya bisa bantu troubleshoot lebih lanjut.
