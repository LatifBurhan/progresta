-- Fix RLS Policies for project_reports table
-- Run this SQL in Supabase SQL Editor

-- 1. Drop existing policies (if any conflicts)
DROP POLICY IF EXISTS "Users can view own reports or admins view all" ON project_reports;
DROP POLICY IF EXISTS "Users can create reports for their projects" ON project_reports;
DROP POLICY IF EXISTS "Users can update own reports same day" ON project_reports;
DROP POLICY IF EXISTS "Users can delete own reports or admins delete any" ON project_reports;
DROP POLICY IF EXISTS "Service role can manage all reports" ON project_reports;

-- 2. Recreate policies with correct logic

-- Policy: Users can view their own reports, admins can view all
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

-- Policy: Users can insert reports for projects they're involved in
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

-- Policy: Users can update their own reports on the same day
CREATE POLICY "Users can update own reports same day" ON project_reports
    FOR UPDATE
    USING (
        user_id = auth.uid() 
        AND DATE(created_at) = CURRENT_DATE
    );

-- Policy: Users can delete their own reports, admins can delete any
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

-- Policy: Service role can manage all reports (CRITICAL for API operations)
CREATE POLICY "Service role can manage all reports" ON project_reports
    FOR ALL 
    TO service_role 
    USING (true) 
    WITH CHECK (true);

-- 3. Verify RLS is enabled
ALTER TABLE project_reports ENABLE ROW LEVEL SECURITY;

-- 4. Verify policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'project_reports'
ORDER BY policyname;
