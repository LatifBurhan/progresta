-- Migration: Create project_divisions junction table for many-to-many relationship
-- This allows projects to have multiple divisions collaborating

-- Create project_divisions junction table
CREATE TABLE IF NOT EXISTS project_divisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    division_id UUID NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique combination of project and division
    UNIQUE(project_id, division_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_divisions_project_id ON project_divisions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_divisions_division_id ON project_divisions(division_id);

-- Enable RLS (Row Level Security)
ALTER TABLE project_divisions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for authenticated users" ON project_divisions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON project_divisions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users" ON project_divisions
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users" ON project_divisions
    FOR DELETE USING (auth.role() = 'authenticated');

-- Migrate existing projects to use the new structure
-- This will create entries in project_divisions for existing projects
INSERT INTO project_divisions (project_id, division_id, created_at, updated_at)
SELECT 
    id as project_id,
    "divisionId" as division_id,
    "createdAt" as created_at,
    "updatedAt" as updated_at
FROM projects 
WHERE "divisionId" IS NOT NULL
ON CONFLICT (project_id, division_id) DO NOTHING;

-- Note: We keep the divisionId column in projects table for backward compatibility
-- but new projects will primarily use the project_divisions table