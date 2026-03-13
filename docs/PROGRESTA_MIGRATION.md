# 🚀 Progresta Database Migration Guide

## Overview
Migrasi ini mengubah template dasar menjadi sistem **Progresta** (Progress & Auto-Attendance System) dengan menambahkan struktur database yang diperlukan untuk:

- Multi-project reporting
- Smart attendance system
- Division-based privacy
- Role-based access control yang diperluas

## 📊 Database Schema Changes

### 1. **Updated Enums**
```sql
-- Role enum diperluas
enum Role {
  ADMIN, USER,        // Existing
  HRD, PM, CEO,       // Management roles
  KARYAWAN           // Default employee role
}

-- Status enum baru
enum UserStatus {
  PENDING,    // Menunggu approval
  ACTIVE,     // Aktif bekerja
  INACTIVE    // Non-aktif
}
```

### 2. **Updated Tables**

#### **Users Table** (Enhanced)
- ✅ `status` - UserStatus untuk approval workflow
- ✅ `divisionId` - Relasi ke divisi
- ✅ `createdBy` - User yang membuat akun (untuk tracking)
- ✅ Default role changed to `KARYAWAN`

#### **Profiles Table** (Enhanced)
- ✅ `name` - Nama lengkap karyawan
- ✅ `phone` - Nomor telepon
- ✅ `position` - Jabatan

### 3. **New Tables**

#### **Divisions Table**
```sql
- id (UUID, PK)
- name (String, Unique) - "Frontend", "Backend", "Mobile", etc.
- description (String, Optional)
- color (String, Optional) - Hex color untuk UI
- isActive (Boolean, Default: true)
- timestamps
```

#### **Projects Table**
```sql
- id (UUID, PK)
- name (String) - Nama project
- description (String, Optional)
- divisionId (UUID, FK to divisions)
- isActive (Boolean, Default: true)
- startDate, endDate (DateTime, Optional)
- timestamps
```

#### **Reports Table** (Core Feature)
```sql
- id (UUID, PK)
- userId (UUID, FK to users)
- reportDate (DateTime) - Tanggal laporan (YYYY-MM-DD)
- reportTime (DateTime) - Waktu laporan lengkap
- period (String) - "08:00-10:00", "10:00-12:00", etc.
- hasIssue (Boolean) - Flag kendala
- issueDesc (String, Optional) - Deskripsi kendala
- totalHours (Float, Default: 2.0) - Total jam periode
- timestamps

UNIQUE: (userId, reportDate, period) - Prevent duplicate
```

#### **Report Details Table** (Multi-Project Support)
```sql
- id (UUID, PK)
- reportId (UUID, FK to reports, CASCADE DELETE)
- projectId (UUID, FK to projects)
- task (String) - Deskripsi task
- progress (String) - Progress yang dicapai
- evidence (String, Optional) - URL foto bukti
- hoursSpent (Float) - Jam untuk project ini
- timestamps
```

## 🔄 Migration Process

### Step 1: Run Migration
```bash
# Option 1: Using npm script (Recommended)
npm run db:migrate-progresta

# Option 2: Manual execution
node scripts/run-progresta-migration.js

# Option 3: Direct SQL (Advanced)
npx prisma db execute --file migrate-progresta.sql
```

### Step 2: Verify Migration
```bash
# Check schema
npx prisma db pull

# Generate client
npx prisma generate

# Open Prisma Studio to verify
npx prisma studio
```

## 📋 Default Data Inserted

### Divisions
- **Frontend** - Tim pengembangan antarmuka pengguna (#3B82F6)
- **Backend** - Tim pengembangan server dan API (#10B981)
- **Mobile** - Tim pengembangan aplikasi mobile (#8B5CF6)
- **UI/UX** - Tim desain antarmuka dan pengalaman pengguna (#F59E0B)
- **QA** - Tim quality assurance dan testing (#EF4444)
- **DevOps** - Tim infrastruktur dan deployment (#6B7280)

### Sample Projects
- Satu sample project untuk setiap divisi yang aktif

## 🔍 Key Relationships

```
User (1) ←→ (1) Profile
User (N) ←→ (1) Division
User (1) ←→ (N) Report

Division (1) ←→ (N) Project
Division (1) ←→ (N) User

Report (1) ←→ (N) ReportDetail
Project (1) ←→ (N) ReportDetail
```

## 🚨 Important Notes

### Data Integrity
- **CASCADE DELETE**: ReportDetail akan terhapus jika Report dihapus
- **RESTRICT DELETE**: Project dan User tidak bisa dihapus jika masih ada relasi
- **SET NULL**: User.divisionId akan null jika Division dihapus

### Unique Constraints
- `reports(userId, reportDate, period)` - Mencegah duplikasi laporan per periode
- `divisions(name)` - Nama divisi harus unik

### Performance Indexes
- Reports: userId, reportDate, hasIssue
- ReportDetails: reportId, projectId
- Users: divisionId, status

## 🔧 Troubleshooting

### Migration Fails
```bash
# Check database connection
npx prisma db pull

# Reset database (WARNING: Deletes all data)
npm run db:reset

# Manual cleanup if needed
DROP TABLE IF EXISTS report_details CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS divisions CASCADE;
DROP TYPE IF EXISTS "UserStatus" CASCADE;
```

### Enum Issues
```sql
-- If enum values already exist
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'HRD';
-- Use IF NOT EXISTS to avoid errors
```

## 📈 Next Steps After Migration

1. **Update Auth Actions** - Modify registration to use new roles
2. **Create Division Management** - Admin interface untuk manage divisi
3. **Build Report System** - Form untuk multi-project reporting
4. **Implement Smart Attendance** - Logic untuk auto-attendance
5. **Add Privacy Filters** - Division-based content filtering

## 🔐 Security Considerations

- **Role Hierarchy**: CEO > HRD/PM > KARYAWAN
- **Division Privacy**: Users only see their division by default
- **Approval Workflow**: New users start as PENDING
- **Data Ownership**: Users can only edit their own reports

---

**Migration completed successfully! 🎉**

Ready to build the Progresta features on this solid foundation.