-- Add completion tracking fields to projects table
-- This migration adds: createdBy, urgency, isCompleted

-- Add createdBy column (references users table)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS "createdBy" UUID REFERENCES users(id);

-- Add urgency column (low, medium, high)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'urgency_level') THEN
    CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high');
  END IF;
END $$;

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS urgency urgency_level DEFAULT 'low';

-- Add isCompleted column (boolean, default false)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS "isCompleted" BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON projects("createdBy");
CREATE INDEX IF NOT EXISTS idx_projects_is_completed ON projects("isCompleted");

-- Add comment for documentation
COMMENT ON COLUMN projects."createdBy" IS 'User ID of the project creator';
COMMENT ON COLUMN projects.urgency IS 'Project urgency level: low, medium, or high';
COMMENT ON COLUMN projects."isCompleted" IS 'Whether the project has been marked as completed';
