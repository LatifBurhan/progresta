const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  console.log('🚀 Running database migration...')
  
  const migrationSql = `
    -- Add missing columns to projects table
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS tujuan TEXT;
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS pic VARCHAR(255);
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS prioritas VARCHAR(50);
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS tanggal_mulai DATE;
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS tanggal_selesai DATE;
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS output_diharapkan TEXT;
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS catatan TEXT;
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS lampiran_url TEXT;
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Aktif';
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_by UUID;
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

    -- Create project_divisions table
    CREATE TABLE IF NOT EXISTS project_divisions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      division_id UUID NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(project_id, division_id)
    );

    -- Migrate existing data from divisionId to project_divisions
    INSERT INTO project_divisions (project_id, division_id)
    SELECT id, "divisionId" FROM projects WHERE "divisionId" IS NOT NULL
    ON CONFLICT (project_id, division_id) DO NOTHING;
  `;

  console.log('🔍 Testing execute_query RPC...')
  const { data, error } = await supabase.rpc('execute_query', { query_text: migrationSql })

  if (error) {
    console.error('❌ Migration failed:', error.message)
    console.log('Trying alternative approach...')
    
    // If execute_query RPC doesn't exist, we might need to create it first or use another way
  } else {
    console.log('✅ Migration successful!')
    console.log('📊 Result:', data)
  }
}

runMigration()
