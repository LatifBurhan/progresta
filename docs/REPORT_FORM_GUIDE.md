# 📝 Form Pelaporan Progres - User Guide

## Overview
Form pelaporan progres adalah fitur utama Progresta yang memungkinkan karyawan melaporkan progres kerja setiap 2 jam dengan mudah dan cepat dari perangkat mobile.

## 🎯 Fitur Utama

### 1. **Mobile-First Design**
- Dioptimalkan untuk layar smartphone
- Touch-friendly interface dengan tombol besar
- Textarea yang cukup besar untuk mengetik dengan jempol
- Responsive design untuk semua ukuran layar

### 2. **Zero Friction UX**
- **Auto-Save**: Data tersimpan otomatis di localStorage
- **Auto-Context**: Lokasi terakhir otomatis terpilih
- **Quick Selection**: Tombol chips untuk periode dan lokasi
- **Multi-Project**: Tambah/hapus project dengan mudah

### 3. **Smart Features**
- **Image Compression**: Foto otomatis dikompres sebelum upload
- **WhatsApp Integration**: Copy teks laporan ke format WhatsApp
- **Timezone Aware**: Semua waktu menggunakan Asia/Jakarta (WIB)
- **Validation**: Validasi real-time untuk mencegah error

## 📱 Cara Menggunakan

### Step 1: Pilih Periode Waktu
```
Pilih salah satu periode:
🕒 08-10 (08:00-10:00)
🕒 10-12 (10:00-12:00)  
🕒 13-15 (13:00-15:00)
🕒 15-17 (15:00-17:00)
🕒 17-19 (17:00-19:00)
```

### Step 2: Pilih Lokasi Kerja
```
📍 Lokasi tersedia:
🏢 Al-Wustho    - Kantor utama
🏠 WFA          - Work From Anywhere
🏛️ Client Site  - Lokasi klien
```

### Step 3: Isi Detail Project
Untuk setiap project yang dikerjakan:

1. **Pilih Project** - Dropdown berisi project divisi Anda
2. **Yang Sudah Dikerjakan** - Deskripsi task yang dikerjakan
3. **Progress/Hasil** - Hasil yang dicapai dalam periode ini
4. **Kendala (Opsional)** - Masalah yang dihadapi (jika ada)
5. **Jam Kerja** - Berapa jam dihabiskan untuk project ini
6. **Bukti Kerja** - Upload foto screenshot/hasil kerja

### Step 4: Submit & Copy ke WhatsApp
- Klik **"Kirim Laporan"** untuk menyimpan
- Setelah berhasil, klik **"Salin Teks WhatsApp"**
- Paste ke grup WhatsApp kantor

## 🔧 Fitur Teknis

### Auto-Save Mechanism
```javascript
// Data tersimpan otomatis setiap kali ada perubahan
localStorage.setItem(`report-draft-${userId}`, formData)

// Data dipulihkan saat membuka form kembali
const savedData = localStorage.getItem(`report-draft-${userId}`)
```

### Image Compression
```javascript
// Kompresi otomatis sebelum upload
const compressedFile = await compressImage(file, {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.8
})
```

### Multi-Project Logic
- Klik **"+ Tambah"** untuk menambah project baru
- Minimal 1 project harus diisi lengkap
- Setiap project memiliki jam kerja terpisah
- Total jam kerja dihitung otomatis

## 📋 Format WhatsApp Output

```
📌 *LAPORAN PROGRES KERJA*
🕒 Jumat, 13 Maret 2026 | 10:30 WIB
⏰ Periode: 08:00-10:00
📍 Lokasi: Al-Wustho

👨‍💻 *Project 1: Website E-Commerce*
📝 Yang Dikerjakan:
Implementasi fitur checkout dan payment gateway

✅ Progress/Hasil:
Berhasil integrasi dengan Midtrans, testing pembayaran sukses

⚠️ Kendala:
Sandbox environment kadang timeout

⏱️ Waktu: 2 jam

📊 *Total Jam Kerja: 2 jam*
✅ *Status: Ada Kendala*

#ProgresKerja #AlWustho
```

## 🚨 Validasi & Error Handling

### Validasi Form
- ✅ Periode waktu wajib dipilih
- ✅ Minimal 1 project harus diisi lengkap
- ✅ Task dan Progress tidak boleh kosong
- ✅ Jam kerja antara 0.5 - 8 jam
- ✅ Tidak boleh duplikasi laporan per periode

### Error Messages
```
❌ "Pilih periode waktu terlebih dahulu"
❌ "Minimal satu project harus diisi lengkap"
❌ "Laporan untuk periode ini sudah ada"
❌ "Beberapa project tidak valid"
```

## 🔐 Security & Privacy

### Data Protection
- Form data di-encrypt sebelum dikirim
- File upload menggunakan Supabase Storage
- Session validation untuk setiap request
- Division-based project access

### File Upload Security
- Hanya file gambar yang diizinkan
- Maksimal ukuran file setelah kompresi
- Unique filename untuk mencegah collision
- Public URL dengan expiration time

## 📊 Database Impact

### Tables Affected
```sql
-- Main report record
INSERT INTO reports (userId, reportDate, reportTime, period, ...)

-- Project details (multiple records)
INSERT INTO report_details (reportId, projectId, task, progress, ...)
```

### Smart Attendance Integration
- **Jam Masuk**: Waktu laporan pertama hari itu
- **Jam Pulang**: Waktu laporan terakhir hari itu
- **Total Jam**: Akumulasi dari semua laporan
- **Status Lembur**: Otomatis jika > jam kerja normal

## 🎨 UI/UX Best Practices

### Mobile Optimization
- Minimum touch target: 44px
- Thumb-friendly button placement
- Large textarea for comfortable typing
- Sticky submit button at bottom

### Visual Feedback
- Loading states saat submit
- Success animation setelah berhasil
- Error highlighting untuk field invalid
- Progress indicator untuk upload

### Accessibility
- Semantic HTML structure
- Proper ARIA labels
- Keyboard navigation support
- High contrast colors
- Screen reader friendly

## 🔄 Workflow Integration

### Daily Routine
1. **08:00** - Laporan periode pertama (08-10)
2. **10:00** - Laporan periode kedua (10-12)
3. **13:00** - Laporan setelah istirahat (13-15)
4. **15:00** - Laporan sore (15-17)
5. **17:00** - Laporan terakhir/lembur (17-19)

### Team Coordination
- Copy laporan ke grup WhatsApp tim
- PM dapat monitor kendala real-time
- HRD dapat track produktivitas
- CEO dapat lihat overview perusahaan

---

**Form pelaporan siap digunakan! 🚀**

Akses melalui: Dashboard → 📝 Laporan Progres