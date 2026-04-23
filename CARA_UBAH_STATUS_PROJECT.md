# Cara Mengubah Status Project

## Akses Fitur

Fitur ini hanya tersedia untuk **Admin/Pengelola Project**.

## Langkah-langkah

### 1. Buka Halaman Project Management

- Login sebagai Admin
- Buka menu "Project Management" atau "Kelola Project"

### 2. Klik Project yang Ingin Diubah

- Klik pada card/kotak project yang ingin diubah statusnya
- Modal edit akan terbuka

### 3. Ubah Status

Di modal edit, Anda akan melihat section "Status Progres" dengan pilihan:

- **Aktif** - Project sedang berjalan
- **Ditunda** - Project ditunda sementara
- **Selesai** - Project sudah selesai
- **Non-Aktif** - Project tidak aktif
- **Dibatalkan** - Project dibatalkan

Klik salah satu status untuk memilih.

### 4. Simpan Perubahan

- Klik tombol "Simpan" atau "Update"
- Status project akan berubah

## Fitur Lain di Edit Modal

Selain status, Anda juga bisa mengubah:

- Nama project
- Tujuan
- Deskripsi
- PIC (Person In Charge)
- Prioritas (Rendah, Sedang, Tinggi, Urgent)
- Tanggal mulai
- Tanggal selesai
- Departemen & Divisi terkait
- User yang di-assign
- Lampiran file

## Catatan Penting

### Status "Selesai" vs "Non-Aktif"

- **Selesai**: Project berhasil diselesaikan
- **Non-Aktif**: Project dihentikan sementara atau permanen (bukan karena selesai)

### Dampak Perubahan Status

1. **Project dengan status "Aktif"**:
   - Muncul di dropdown "Buat Laporan" untuk user yang terlibat
   - User bisa membuat report untuk project ini

2. **Project dengan status selain "Aktif"**:
   - TIDAK muncul di dropdown "Buat Laporan"
   - User tidak bisa membuat report baru
   - Report lama masih bisa dilihat di history

### Filter Berdasarkan Status

Di halaman Project Management, Anda bisa filter project berdasarkan status:
- Pilih status di dropdown filter
- Hanya project dengan status tersebut yang ditampilkan

## Tips

1. **Ubah ke "Selesai"** ketika project benar-benar selesai
2. **Ubah ke "Ditunda"** jika project temporary hold
3. **Ubah ke "Non-Aktif"** jika project tidak akan dilanjutkan
4. **Ubah ke "Dibatalkan"** jika project dibatalkan secara resmi

## Troubleshooting

### Problem: Tidak bisa mengubah status

**Kemungkinan:**
- Anda bukan admin
- Session expired

**Solusi:**
- Pastikan login sebagai admin
- Logout dan login ulang

### Problem: Status berubah tapi project masih muncul di "Buat Laporan"

**Kemungkinan:**
- Cache browser
- Session lama

**Solusi:**
- Refresh halaman (F5)
- Logout dan login ulang
- Clear browser cache

### Problem: User masih bisa buat report untuk project "Selesai"

**Kemungkinan:**
- Status belum tersimpan
- Bug di filter

**Solusi:**
- Cek status di database
- Refresh halaman
- Lapor ke developer jika masih bermasalah
