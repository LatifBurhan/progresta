-- Migration: Add period field to project_reports table
-- Date: 2026-04-10

-- Add period column
ALTER TABLE project_reports 
ADD COLUMN IF NOT EXISTS period VARCHAR(10);

-- Add check constraint for valid period values
ALTER TABLE project_reports 
ADD CONSTRAINT check_period_values 
CHECK (period IN ('08-10', '10-12', '12-14', '14-16'));

-- Create index for period filtering
CREATE INDEX IF NOT EXISTS idx_project_reports_period ON project_reports(period);

-- Update existing records with default period if null
UPDATE project_reports 
SET period = '08-10' 
WHERE period IS NULL;

-- Make period NOT NULL after setting defaults
ALTER TABLE project_reports 
ALTER COLUMN period SET NOT NULL;

-- Verify the change
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'project_reports' AND column_name = 'period';
