-- CREATE NEW PROJECTS TABLE WITH COMPLETE FIELDS
-- Jalankan di Supabase SQL Editor

-- 1. Drop tabel lama jika ada (hati-hati dengan data!)
-- DROP TABLE IF EXISTS project_divisions CASCADE;
-- DROP TABLE IF EXISTS projects CASCADE;

-- 2. Buat tabel projects baru dengan field lengkap
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  tujuan TEXT,
  description TEXT,
  pic VARCHAR(255),
  prioritas VARCHAR(50) CHECK (prioritas IN ('Rendah', 'Sedang', 'Tinggi', 'Urgent')),
  tanggal_mulai DATE,
  tanggal_selesai DATE,
  output_diharapkan TEXT,
  catatan TEXT,
  lampiran_url TEXT,
  status VARCHAR(50) DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Selesai', 'Ditunda', 'Dibatalkan')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- 3. Buat tabel project_divisions untuk many-to-many relationship
CREATE TABLE IF NOT EXISTS project_divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  division_id UUID NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, division_id)
);

-- 4. Buat indexes untuk performa
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_prioritas ON projects(prioritas);
CREATE INDEX IF NOT EXISTS idx_projects_tanggal_mulai ON projects(tanggal_mulai);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);
CREATE INDEX IF NOT EXISTS idx_project_divisions_project_id ON project_divisions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_divisions_division_id ON project_divisions(division_id);

-- 5. Buat trigger untuk update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Setup RLS (Row Level Security)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_divisions ENABLE ROW LEVEL SECURITY;

-- 7. Buat RLS policies
-- Policy untuk projects
CREATE POLICY "Users can view active projects" ON projects
    FOR SELECT USING (status = 'Aktif');

CREATE POLICY "PM/HRD/CEO/ADMIN can manage projects" ON projects
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users u 
            JOIN users usr ON u.id = usr.id 
            WHERE u.id = auth.uid() 
            AND usr.role IN ('PM', 'HRD', 'CEO', 'ADMIN')
            AND usr.status_pending = false
        )
    );

CREATE POLICY "Service role can manage projects" ON projects
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Policy untuk project_divisions
CREATE POLICY "Users can view project divisions" ON project_divisions
    FOR SELECT USING (true);

CREATE POLICY "PM/HRD/CEO/ADMIN can manage project divisions" ON project_divisions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users u 
            JOIN users usr ON u.id = usr.id 
            WHERE u.id = auth.uid() 
            AND usr.role IN ('PM', 'HRD', 'CEO', 'ADMIN')
            AND usr.status_pending = false
        )
    );

CREATE POLICY "Service role can manage project divisions" ON project_divisions
    FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 8. Insert sample data (opsional)
/*
INSERT INTO projects (name, tujuan, description, pic, prioritas, tanggal_mulai, tanggal_selesai, output_diharapkan, catatan, status) VALUES
('Website Company Profile', 'Meningkatkan brand awareness perusahaan', 'Pembuatan website company profile yang modern dan responsif', 'John Doe', 'Tinggi', '2026-04-01', '2026-05-15', 'Website yang fully responsive dengan CMS', 'Perlu koordinasi dengan tim marketing', 'Aktif'),
('Mobile App E-Commerce', 'Ekspansi ke platform mobile', 'Pengembangan aplikasi mobile untuk platform e-commerce', 'Jane Smith', 'Urgent', '2026-03-15', '2026-06-30', 'Aplikasi Android dan iOS yang terintegrasi dengan sistem existing', 'Budget sudah disetujui', 'Aktif');
*/

-- 9. Verifikasi struktur tabel
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'projects' 
ORDER BY ordinal_position;