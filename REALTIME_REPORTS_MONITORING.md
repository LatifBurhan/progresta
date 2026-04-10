# Monitoring Laporan Real-time

Fitur monitoring laporan real-time untuk Admin, General Affair, dan CEO.

## Lokasi
- **Halaman**: `/dashboard/admin/overview` (bagian paling bawah)
- **Akses**: Admin, General Affair, CEO

## Fitur

### 1. Filter Laporan
- **Semua**: Menampilkan semua laporan
- **Hari Ini**: Hanya laporan hari ini
- **Sesi Waktu** (bisa pilih multiple):
  - 08:00 - 10:00
  - 10:00 - 12:00
  - 12:00 - 14:00
  - 14:00 - 16:00

### 2. Tabel Laporan
Kolom yang ditampilkan:
- Nama Pelapor (dengan email)
- Project
- Divisi (dari project_divisions)
- Department (dari project_departments)
- Jam (periode waktu)
- Tanggal (dengan waktu submit)

### 3. Detail Laporan
Klik row untuk melihat detail:
- Info header (pelapor, project, lokasi, periode, divisi, department)
- Pekerjaan yang dikerjakan
- Kendala (jika ada)
- Rencana kedepan (jika ada)
- Lampiran foto (jika ada)

## File yang Dibuat

### Components
- `components/admin/RealtimeReportsTable.tsx` - Komponen utama tabel monitoring
- `components/admin/ReportDetailModal.tsx` - Modal detail laporan

### API Routes
- `app/api/admin/reports/realtime/route.ts` - Endpoint untuk fetch laporan dengan filter

### Database Migration
- `supabase/migrations/add_period_to_project_reports.sql` - Menambahkan field `period` ke tabel `project_reports`

## Cara Kerja

1. User membuka halaman `/dashboard/admin/overview`
2. Scroll ke bawah untuk melihat section "Monitoring Laporan Real-time"
3. Pilih filter yang diinginkan (Semua/Hari Ini + Sesi Waktu)
4. Klik row untuk melihat detail laporan
5. Data auto-refresh ketika filter berubah

## Query Database

```sql
SELECT 
  pr.*,
  u.name, u.email,
  p.name as project_name,
  pd.divisions.name as division_name,
  pde.departments.name as department_name
FROM project_reports pr
JOIN users u ON pr.user_id = u.id
JOIN projects p ON pr.project_id = p.id
LEFT JOIN project_divisions pd ON p.id = pd.project_id
LEFT JOIN project_departments pde ON p.id = pde.project_id
WHERE 
  (filter = 'today' AND DATE(pr.created_at) = CURRENT_DATE)
  AND (periods.length = 0 OR pr.period IN periods)
ORDER BY pr.created_at DESC
```

## Notes
- Sorting: Terbaru di atas (ORDER BY created_at DESC)
- Divisi & Department diambil dari project, bukan dari user
- Field `period` wajib diisi saat membuat laporan
- Format period: "08-10", "10-12", "12-14", "14-16"
