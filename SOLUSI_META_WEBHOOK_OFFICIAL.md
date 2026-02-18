# Solusi Webhook Meta WhatsApp - Berdasarkan Dokumentasi Resmi

## Masalah yang Terjadi

Error: "The callback URL or verify token couldn't be validated"

## Penyebab Umum (Berdasarkan Dokumentasi Meta & Community)

Berdasarkan dokumentasi resmi Meta dan berbagai kasus di community, ada beberapa kemungkinan:

### 1. **SSL/TLS Certificate Issue**
Meta memerlukan **valid TLS/SSL certificate**. Self-signed certificates TIDAK didukung.

**Vercel sudah otomatis menyediakan SSL certificate yang valid**, jadi ini seharusnya bukan masalah.

### 2. **Response Format Salah**
Endpoint harus return **plain text** `hub.challenge`, BUKAN JSON.

Mari kita cek code Anda:

```typescript
// ✅ BENAR - Return plain text
return new NextResponse(challenge, { status: 200 })

// ❌ SALAH - Return JSON
return NextResponse.json({ challenge: challenge })
```

Code Anda sudah benar!

### 3. **Environment Variable Tidak Tersedia**
`process.env.WABA_WEBHOOK_VERIFY_TOKEN` mungkin undefined di Vercel.

### 4. **Timeout atau Network Issue**
Meta timeout jika response lebih dari beberapa detik.

### 5. **Wrong Webhook Configuration Location**
Ada 2 tempat konfigurasi webhook di Meta:
- **App Webhooks** (salah)
- **WhatsApp Business Account Webhooks** (benar)

## Solusi Step-by-Step

### Step 1: Pastikan Environment Variables di Vercel

1. Buka Vercel Dashboard: https://vercel.com/dashboard
2. Pilih project `crm-wa`
3. Settings > Environment Variables
4. Pastikan ada:
   ```
   WABA_WEBHOOK_VERIFY_TOKEN=whatsapp_crm_webhook_secret_2024
   ```
5. Apply to: **Production, Preview, Development** (centang semua)
6. Klik Save
7. **PENTING**: Redeploy app setelah menambah environment variable

### Step 2: Verifikasi Endpoint Berfungsi

Test manual dengan browser atau curl:

```bash
https://crm-wa.vercel.app/api/webhook?hub.mode=subscribe&hub.verify_token=whatsapp_crm_webhook_secret_2024&hub.challenge=test123
```

Harus return: `test123` (plain text, bukan JSON)

Jika return error atau JSON, ada masalah di code atau environment variable.

### Step 3: Konfigurasi di Meta (LOKASI YANG BENAR)

**PENTING**: Jangan konfigurasi di "App Webhooks"!

Ikuti langkah ini:

1. Buka Meta Developer Console: https://developers.facebook.com/apps/
2. Pilih app WhatsApp Anda
3. **Sidebar kiri**: Klik **"WhatsApp"** (bukan "Webhooks")
4. Klik **"Configuration"**
5. Scroll ke bagian **"Webhook"**
6. Klik **"Edit"**

**Masukkan:**
```
Callback URL: https://crm-wa.vercel.app/api/webhook
Verify token: whatsapp_crm_webhook_secret_2024
```

7. Klik **"Verify and Save"**

### Step 4: Subscribe ke Messages Event

Setelah webhook terverifikasi:

1. Masih di halaman Configuration
2. Scroll ke **"Webhook fields"**
3. Klik **"Manage"** atau **"Subscribe"**
4. Centang **"messages"**
5. Klik **"Save"**

## Troubleshooting Berdasarkan Error Spesifik

### Error: "URL couldn't be validated"

**Kemungkinan**:
1. SSL certificate issue (tapi Vercel sudah handle ini)
2. Endpoint tidak response dalam waktu yang cukup cepat
3. Response format salah

**Solusi**:
1. Pastikan endpoint return plain text, bukan JSON
2. Pastikan tidak ada middleware yang block request
3. Test endpoint manual dengan browser

### Error: "Verify token couldn't be validated"

**Kemungkinan**:
1. Environment variable `WABA_WEBHOOK_VERIFY_TOKEN` tidak ada di Vercel
2. Token di Meta tidak sama dengan token di Vercel
3. Typo saat input token

**Solusi**:
1. Cek environment variables di Vercel Dashboard
2. Redeploy setelah menambah environment variable
3. Copy-paste token (jangan ketik manual)

### Error: "Response does not match challenge"

**Kemungkinan**:
Endpoint return JSON atau format lain, bukan plain text challenge

**Solusi**:
Pastikan code return:
```typescript
return new NextResponse(challenge, { status: 200 })
```

BUKAN:
```typescript
return NextResponse.json({ challenge })
```

## Debugging dengan Vercel Logs

1. Buka Vercel Dashboard
2. Pilih project > Deployments > Latest
3. Klik "Functions"
4. Klik function `/api/webhook`
5. Lihat logs real-time

Saat Meta verify webhook, Anda harus lihat log:
```
Webhook verified
```

Jika tidak ada log sama sekali, berarti request tidak sampai ke endpoint (network/SSL issue).

## Common Mistakes

### ❌ Salah: Konfigurasi di App Webhooks
```
App Dashboard > Webhooks > Settings
```

### ✅ Benar: Konfigurasi di WhatsApp Configuration
```
App Dashboard > WhatsApp > Configuration > Webhook
```

### ❌ Salah: URL dengan parameter
```
https://crm-wa.vercel.app/api/webhook?hub.mode=subscribe&hub.verify_token=...
```

### ✅ Benar: URL bersih
```
https://crm-wa.vercel.app/api/webhook
```

### ❌ Salah: Return JSON
```typescript
return NextResponse.json({ challenge: challenge })
```

### ✅ Benar: Return plain text
```typescript
return new NextResponse(challenge, { status: 200 })
```

## Verification Request dari Meta

Saat Anda klik "Verify and Save", Meta akan kirim GET request:

```
GET https://crm-wa.vercel.app/api/webhook?hub.mode=subscribe&hub.verify_token=whatsapp_crm_webhook_secret_2024&hub.challenge=1234567890
```

Endpoint Anda harus:
1. Cek `hub.mode === 'subscribe'`
2. Cek `hub.verify_token === process.env.WABA_WEBHOOK_VERIFY_TOKEN`
3. Return `hub.challenge` sebagai plain text dengan status 200

Jika salah satu tidak terpenuhi, Meta akan reject.

## Test Checklist

- [ ] Environment variable `WABA_WEBHOOK_VERIFY_TOKEN` ada di Vercel
- [ ] App sudah di-redeploy setelah tambah environment variable
- [ ] Test manual endpoint return plain text challenge
- [ ] Konfigurasi webhook di WhatsApp > Configuration (bukan App Webhooks)
- [ ] URL webhook bersih tanpa parameter
- [ ] Token di Meta sama persis dengan token di Vercel
- [ ] Vercel logs menunjukkan "Webhook verified" saat Meta verify

## Jika Masih Gagal

Coba langkah ini:

1. **Hapus webhook configuration di Meta**
2. **Tunggu 5 menit**
3. **Redeploy app di Vercel**
4. **Konfigurasi webhook lagi dari awal**

Kadang Meta cache konfigurasi lama, jadi perlu dihapus dulu.

## Referensi

- [Meta Webhooks Getting Started](https://developers.facebook.com/docs/graph-api/webhooks/getting-started)
- [WhatsApp Business Webhooks](https://developers.facebook.com/docs/whatsapp/embedded-signup/webhooks)

## Catatan Penting

1. **Self-signed certificates tidak didukung** - Vercel sudah handle ini
2. **Response harus plain text**, bukan JSON
3. **Environment variables harus di-set di Vercel** sebelum verify
4. **Konfigurasi di WhatsApp > Configuration**, bukan App Webhooks
5. **Token harus sama persis** (case-sensitive)
