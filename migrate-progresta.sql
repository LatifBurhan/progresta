-- Migration untuk Progresta (Progress & Auto-Attendance System)
-- Tanggal: 2026-03-13
-- Deskripsi: Menambahkan struktur database untuk sistem pelaporan progres dan absensi otomatis

-- 1. Update enum Role untuk menambahkan role baru
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'HRD';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PM';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'CEO';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'KARYAWAN';

-- 2. Buat enum UserStatus
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE');

-- 3. Buat tabel divisions
CREATE TABLE "divisions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "divisions_pkey" PRIMARY KEY ("id")
);

-- 4. Buat unique constraint untuk division name
CREATE UNIQUE INDEX "divisions_name_key" ON "divisions"("name");

-- 5. Update tabel users - tambah kolom baru
ALTER TABLE "users" 
ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "divisionId" UUID,
ADD COLUMN "createdBy" UUID;

-- 6. Update default role untuk user baru
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'KARYAWAN';

-- 7. Tambah foreign key constraint untuk divisionId
ALTER TABLE "users" 
ADD CONSTRAINT "users_divisionId_fkey" 
FOREIGN KEY ("divisionId") REFERENCES "divisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 8. Update tabel profiles - tambah kolom baru
ALTER TABLE "profiles"
ADD COLUMN "name" TEXT,
ADD COLUMN "phone" TEXT,
ADD COLUMN "position" TEXT;

-- 9. Buat tabel projects
CREATE TABLE "projects" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "divisionId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- 10. Tambah foreign key constraint untuk projects
ALTER TABLE "projects" 
ADD CONSTRAINT "projects_divisionId_fkey" 
FOREIGN KEY ("divisionId") REFERENCES "divisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 11. Buat tabel reports
CREATE TABLE "reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "reportDate" TIMESTAMP(3) NOT NULL,
    "reportTime" TIMESTAMP(3) NOT NULL,
    "period" TEXT NOT NULL,
    "hasIssue" BOOLEAN NOT NULL DEFAULT false,
    "issueDesc" TEXT,
    "totalHours" DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- 12. Tambah foreign key constraint untuk reports
ALTER TABLE "reports" 
ADD CONSTRAINT "reports_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 13. Buat unique constraint untuk prevent duplicate report per period
CREATE UNIQUE INDEX "reports_userId_reportDate_period_key" ON "reports"("userId", "reportDate", "period");

-- 14. Buat tabel report_details
CREATE TABLE "report_details" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "reportId" UUID NOT NULL,
    "projectId" UUID NOT NULL,
    "task" TEXT NOT NULL,
    "progress" TEXT NOT NULL,
    "evidence" TEXT,
    "hoursSpent" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_details_pkey" PRIMARY KEY ("id")
);

-- 15. Tambah foreign key constraints untuk report_details
ALTER TABLE "report_details" 
ADD CONSTRAINT "report_details_reportId_fkey" 
FOREIGN KEY ("reportId") REFERENCES "reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "report_details" 
ADD CONSTRAINT "report_details_projectId_fkey" 
FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 16. Insert data divisions default
INSERT INTO "divisions" ("name", "description", "color") VALUES
('Frontend', 'Tim pengembangan antarmuka pengguna', '#3B82F6'),
('Backend', 'Tim pengembangan server dan API', '#10B981'),
('Mobile', 'Tim pengembangan aplikasi mobile', '#8B5CF6'),
('UI/UX', 'Tim desain antarmuka dan pengalaman pengguna', '#F59E0B'),
('QA', 'Tim quality assurance dan testing', '#EF4444'),
('DevOps', 'Tim infrastruktur dan deployment', '#6B7280');

-- 17. Update existing users status to ACTIVE (jika ada)
UPDATE "users" SET "status" = 'ACTIVE' WHERE "status" = 'PENDING';

-- 18. Buat index untuk performa query
CREATE INDEX "reports_userId_reportDate_idx" ON "reports"("userId", "reportDate");
CREATE INDEX "reports_reportDate_idx" ON "reports"("reportDate");
CREATE INDEX "reports_hasIssue_idx" ON "reports"("hasIssue");
CREATE INDEX "report_details_reportId_idx" ON "report_details"("reportId");
CREATE INDEX "report_details_projectId_idx" ON "report_details"("projectId");
CREATE INDEX "users_divisionId_idx" ON "users"("divisionId");
CREATE INDEX "users_status_idx" ON "users"("status");

-- 19. Buat trigger untuk auto-update updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger ke semua tabel
CREATE TRIGGER update_divisions_updated_at BEFORE UPDATE ON "divisions" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON "projects" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON "reports" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_report_details_updated_at BEFORE UPDATE ON "report_details" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 20. Insert sample projects untuk testing (optional)
INSERT INTO "projects" ("name", "description", "divisionId") 
SELECT 
    'Sample Project ' || d.name,
    'Project contoh untuk divisi ' || d.name,
    d.id
FROM "divisions" d
WHERE d."isActive" = true;

COMMIT;