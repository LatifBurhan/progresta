# 📊 Dashboard Feed - Instagram/LinkedIn Style

## Overview
Dashboard Feed adalah halaman utama Progresta yang menampilkan aktivitas laporan secara real-time dengan desain modern ala Instagram/LinkedIn. Dilengkapi Smart Attendance Header dan sistem filter yang canggih.

## 🎯 Fitur Utama

### 1. **Smart Attendance Header (Status Absensi)**
Header yang menampilkan ringkasan absensi otomatis untuk user yang sedang login:

```
📅 Absensi Hari Ini - Jumat, 13 Maret 2026                    3 laporan

[MASUK]     [PULANG]    [DURASI KERJA]   [LEMBUR]
08:30       17:45       9j 15m           YA
```

#### Logika Smart Attendance:
- **Clock-in**: Jam dari laporan pertama yang dikirim hari ini
- **Clock-out**: Jam dari laporan terbaru (update otomatis)
- **Work Duration**: Selisih waktu antara laporan pertama dan terakhir
- **Status Lembur**: Label 'Overtime' jika ada laporan setelah jam 16:00 WIB

### 2. **The Feed UI (Instagram/LinkedIn Style)**
Vertical Card Stream yang bisa di-scroll secara infinite dengan desain modern:

#### **Card Header** (Instagram Style)
```
┌─────────────────────────────────────────────────┐
│ [Avatar] John Doe [Frontend] [🏢 WFO] [Edit][Del]│
│          Jum, 13 Mar • 10:30 📅 08-10           │
└─────────────────────────────────────────────────┘
```

#### **Card Body** (Multi-Project Display)
```
┌─────────────────────────────────────────────────┐
│ ⚠️ KENDALA                                      │
│ Server development down, tidak bisa testing     │
│                                                 │
│ #1 Website E-Commerce                    [2j]   │
│ 📝 Task: Implementasi checkout payment         │
│ ✅ Progress: Berhasil integrasi Midtrans       │
│                                                 │
│ #2 Mobile App                           [1j]   │
│ 📝 Task: Fix login bug                         │
│ ✅ Progress: Bug resolved, testing done        │
└─────────────────────────────────────────────────┘
```

#### **Card Footer** (Evidence Gallery)
```
┌─────────────────────────────────────────────────┐
│ 📸 Bukti Kerja (3)                             │
│ [IMG1] [IMG2] [IMG3]                           │
│                                                 │
│ Total: 3 jam • 2 projects • 3 foto             │
└─────────────────────────────────────────────────┘
```

### 3. **Privacy & Filter Logic**

#### **Untuk Karyawan:**
```
[Divisi Saya] | [Semua Divisi]
```
- **Default**: Hanya melihat feed dari divisi sendiri
- **Toggle**: Bisa melihat gambaran besar divisi lain (read-only)

#### **Untuk PM/HRD/CEO:**
```
🔍 [Cari nama karyawan...]                    [×]

Filter Divisi: [Semua] [Frontend] [Backend] [Mobile]

Filter Project: [Semua Project] [Website] [Mobile App]
```
- **Search Bar**: Cari berdasarkan nama karyawan atau email
- **Division Filter**: Filter berdasarkan divisi dengan color coding
- **Project Filter**: Filter berdasarkan project tertentu

### 4. **Lightbox Gallery**
Foto bukti kerja bisa diklik untuk memperbesar dengan fitur:
- **Full Screen View**: Tampilan penuh dengan background gelap
- **Navigation**: Arrow kiri/kanan untuk multiple images
- **Image Counter**: "1 / 3" indicator
- **Close Button**: X button untuk menutup
- **Keyboard Support**: ESC untuk close, arrow keys untuk navigate

### 5. **Data Management (Edit & Delete)**
- **Edit Button**: Untuk laporan milik user sendiri
- **Delete Warning**: Dialog konfirmasi dengan peringatan dampak absensi
- **Real-time Update**: Perubahan langsung terlihat di feed

## 📱 Mobile-First Design

### Responsive Layout
```
Desktop (>768px):
┌─────────────────────────────────────────────────┐
│ [Header with all info visible]                 │
│ [Full filter controls]                         │
│ [Card with side-by-side layout]               │
└─────────────────────────────────────────────────┘

Mobile (<768px):
┌─────────────────────────────────────────────────┐
│ [Compact header]                               │
│ [Stacked filter controls]                     │
│ [Card with vertical layout]                   │
└─────────────────────────────────────────────────┘
```

### Touch Interactions
- **Tap to Expand**: Images expand to lightbox
- **Swipe Navigation**: In lightbox gallery
- **Pull to Refresh**: Native refresh gesture
- **Infinite Scroll**: Auto-load more reports

## 🔐 Security & Privacy

### Row Level Security (RLS)
```sql
-- Users can only edit/delete their own reports
CREATE POLICY "Users can manage own reports" ON reports
FOR ALL USING (auth.uid() = user_id);

-- Division-based read access
CREATE POLICY "Division-based read access" ON reports
FOR SELECT USING (
  user_division_id = current_user_division_id OR
  current_user_role IN ('PM', 'CEO', 'HRD', 'ADMIN')
);
```

### Permission Matrix
| Role | Own Reports | Division Reports | All Reports | Search/Filter | Delete Others |
|------|-------------|------------------|-------------|---------------|---------------|
| KARYAWAN | ✅ CRUD | ✅ Read | 🔄 Toggle | ❌ | ❌ |
| PM | ✅ CRUD | ✅ Read | ✅ Read | ✅ Advanced | ❌ |
| HRD | ✅ CRUD | ✅ Read | ✅ Read | ✅ Advanced | ✅ |
| CEO | ✅ CRUD | ✅ Read | ✅ Read | ✅ Advanced | ✅ |
| ADMIN | ✅ CRUD | ✅ Read | ✅ Read | ✅ Advanced | ✅ |

## 🚨 Flag Kendala System

### Visual Indicators
- **Red Alert Box**: Prominent kendala notification
- **⚠️ KENDALA Label**: Clear warning icon
- **Red Card Border**: Entire card has red accent
- **Issue Description**: Full kendala text displayed

### Real-time Monitoring
- **Instant Visibility**: PM/HRD langsung melihat kendala baru
- **Filter by Issues**: Quick filter untuk laporan bermasalah
- **Notification System**: Real-time alerts (future enhancement)

## 🔄 Data Management

### Edit Functionality
- **Owner Only**: Hanya pemilik laporan yang bisa edit
- **Inline Editing**: Edit langsung di card (future)
- **Real-time Update**: Perubahan langsung terlihat

### Delete Warning System
```
⚠️ Hapus Laporan?

Menghapus laporan ini akan mempengaruhi perhitungan 
jam kerja dan status absensi Anda hari ini. 

Dampak:
• Jam masuk/pulang akan berubah
• Total durasi kerja akan berkurang  
• Status lembur mungkin berubah

Tindakan ini tidak dapat dibatalkan.

[Batal] [Ya, Hapus]
```

### Delete Impact
- **Attendance Recalculation**: Smart attendance otomatis diperbarui
- **File Cleanup**: Foto bukti kerja dihapus dari storage
- **Cache Invalidation**: Data terkait di-refresh
- **Real-time Update**: Feed langsung terupdate

## 📊 Performance Features

### Infinite Scroll
- **Lazy Loading**: Load 50 reports per batch
- **Smooth Scrolling**: Native browser optimization
- **Loading States**: Skeleton screens during fetch
- **End Detection**: Smart detection saat mencapai akhir

### Image Optimization
- **Lazy Loading**: Images loaded on demand
- **Responsive Sizes**: Different sizes untuk different screens
- **Compression**: Otomatis compress untuk performa
- **Caching**: Browser caching untuk images

### Real-time Updates
- **Auto Refresh**: Setiap 5 menit untuk attendance
- **Live Updates**: New reports appear automatically
- **Optimistic Updates**: UI update sebelum server response

## 🎨 Visual Design

### Instagram/LinkedIn Inspiration
- **Clean Cards**: White background dengan subtle shadows
- **Avatar Circles**: Rounded profile pictures
- **Badge System**: Colorful badges untuk status
- **Typography**: Clear hierarchy dengan proper spacing
- **Color Coding**: Consistent color system

### Lightbox Gallery
- **Dark Overlay**: 90% black background
- **Centered Image**: Responsive image centering
- **Navigation Controls**: Intuitive arrow buttons
- **Close Button**: Prominent X button
- **Image Counter**: Clear position indicator

### Loading States
- **Skeleton Screens**: Animated placeholders
- **Shimmer Effect**: Loading animation
- **Progressive Loading**: Content appears as loaded
- **Error States**: Clear error messages

## 🔍 Advanced Filtering (PM/HRD/CEO)

### Search Functionality
```javascript
// Search by name or email
searchQuery: "john" → matches "John Doe" or "john@company.com"

// Case insensitive
searchQuery: "JOHN" → matches "john doe"

// Partial matching
searchQuery: "doe" → matches "John Doe"
```

### Filter Combinations
```javascript
// Multiple filters work together
divisionId: "frontend" + searchQuery: "john" + projectId: "website"
→ Shows John's reports from Frontend division on Website project
```

### Real-time Filtering
- **Instant Results**: Filter applies immediately
- **URL Persistence**: Filter state saved in URL
- **Clear Filters**: Easy reset to default state

## 📱 Mobile UX Patterns

### Touch Gestures
- **Tap**: Open lightbox, select filters
- **Long Press**: Context menu (future)
- **Swipe**: Navigate lightbox images
- **Pull Down**: Refresh feed

### Responsive Breakpoints
- **Mobile**: < 640px - Stacked layout
- **Tablet**: 640px - 1024px - Hybrid layout  
- **Desktop**: > 1024px - Full layout

### Performance on Mobile
- **Optimized Images**: WebP format when supported
- **Reduced Animations**: Respect prefers-reduced-motion
- **Touch Targets**: Minimum 44px for all buttons
- **Safe Areas**: Respect device safe areas

## 🎯 Usage Scenarios

### Daily Routine - Karyawan
1. **Morning Check**: Lihat attendance header, pastikan clock-in tercatat
2. **Team Updates**: Scroll feed divisi untuk update terbaru
3. **Issue Awareness**: Lihat kendala tim untuk koordinasi
4. **Evening Verify**: Check clock-out dan total durasi kerja

### Management - PM/HRD/CEO
1. **Morning Standup**: Search specific team members
2. **Issue Monitoring**: Filter reports dengan kendala
3. **Project Tracking**: Filter by specific projects
4. **Performance Review**: Analyze work patterns dan productivity

### Real-time Monitoring
1. **New Report Alert**: Attendance header updates otomatis
2. **Issue Flagging**: Red cards untuk kendala baru
3. **Team Activity**: Live feed dari semua divisi
4. **Quick Actions**: Edit/delete dengan confirmation

---

**Dashboard Feed siap digunakan! 🚀**

Akses melalui: Dashboard (halaman utama setelah login)

**Key Features:**
- ✅ Instagram/LinkedIn style cards
- ✅ Smart Attendance Header dengan work duration
- ✅ Lightbox gallery untuk foto bukti
- ✅ Advanced search dan filtering
- ✅ Real-time updates dan monitoring
- ✅ Mobile-first responsive design
- ✅ Privacy controls berdasarkan role