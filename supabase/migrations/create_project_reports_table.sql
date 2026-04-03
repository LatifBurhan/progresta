-- Migration: Create project_reports table and storage bucket
-- Feature: Laporan Progres Project
-- Date: 2026-03-27

-- 1. Create project_reports table
CREATE TABLE IF NOT EXISTS project_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    lokasi_kerja VARCHAR(50) NOT NULL CHECK (lokasi_kerja IN ('Kantor', 'Lokasi Proyek', 'Remote')),
    pekerjaan_dikerjakan TEXT NOT NULL,
    kendala TEXT,
    rencana_kedepan TEXT,
    foto_urls TEXT[] NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create indexes for performance
CREATE INDEX idx_project_reports_user_id ON project_reports(user_id);
CREATE INDEX idx_project_reports_project_id ON project_reports(project_id);
CREATE INDEX idx_project_reports_created_at ON project_reports(created_at DESC);
CREATE INDEX idx_project_reports_user_project ON project_reports(user_id, project_id);

-- 3. Create trigger for auto-updating updated_at
-- Reuse existing function if available, otherwise create it
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_project_reports_updated_at 
    BEFORE UPDATE ON project_reports 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Enable RLS
ALTER TABLE project_reports ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policy: Users can view their own reports, admins can view all
CREATE POLICY "Users can view own reports or admins view all" ON project_reports
    FOR SELECT
    USING (
        user_id = auth.uid()
        OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('ADMIN', 'HRD', 'CEO')
        )
    );

-- 6. RLS Policy: Users can insert reports for projects they're involved in
CREATE POLICY "Users can create reports for their projects" ON project_reports
    FOR INSERT
    WITH CHECK (
        user_id = auth.uid()
        AND
        EXISTS (
            SELECT 1 
            FROM users u
            JOIN project_divisions pd ON pd.division_id = u."divisionId"
            WHERE u.id = auth.uid()
            AND pd.project_id = project_reports.project_id
        )
        AND
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = project_reports.project_id
            AND p.status = 'Aktif'
        )
    );

-- 7. RLS Policy: Users can update their own reports on the same day
CREATE POLICY "Users can update own reports same day" ON project_reports
    FOR UPDATE
    USING (
        user_id = auth.uid() 
        AND DATE(created_at) = CURRENT_DATE
    );

-- 8. RLS Policy: Users can delete their own reports, admins can delete any
CREATE POLICY "Users can delete own reports or admins delete any" ON project_reports
    FOR DELETE
    USING (
        user_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('ADMIN', 'HRD', 'CEO')
        )
    );

-- 9. Service role can manage all reports (for API operations)
CREATE POLICY "Service role can manage all reports" ON project_reports
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- 10. Create storage bucket for project report photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-report-photos', 'project-report-photos', true)
ON CONFLICT (id) DO NOTHING;

-- 11. Storage policies for authenticated users
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'project-report-photos');

CREATE POLICY "Authenticated users can update their photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'project-report-photos' AND owner = auth.uid());

CREATE POLICY "Authenticated users can delete their photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'project-report-photos' AND owner = auth.uid());

CREATE POLICY "Public can view photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'project-report-photos');

-- 12. Verify table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'project_reports' 
ORDER BY ordinal_position;
