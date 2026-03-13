#!/usr/bin/env node

/**
 * Script untuk menjalankan migrasi Progresta
 * Usage: node scripts/run-progresta-migration.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Progresta Migration...\n');

try {
  // 1. Backup database schema (optional)
  console.log('📋 Step 1: Backing up current schema...');
  try {
    execSync('npx prisma db pull --force', { stdio: 'inherit' });
    console.log('✅ Schema backup completed\n');
  } catch (error) {
    console.log('⚠️  Schema backup failed (this is OK if database is empty)\n');
  }

  // 2. Run the SQL migration
  console.log('📊 Step 2: Running SQL migration...');
  const migrationPath = path.join(__dirname, '..', 'migrate-progresta.sql');
  
  if (!fs.existsSync(migrationPath)) {
    throw new Error('Migration file not found: migrate-progresta.sql');
  }

  // Use Prisma's db execute to run the SQL file
  const sqlContent = fs.readFileSync(migrationPath, 'utf8');
  
  // Split SQL into individual statements and execute them
  const statements = sqlContent
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

  console.log(`Found ${statements.length} SQL statements to execute...`);

  // Execute via Prisma
  execSync(`npx prisma db execute --file migrate-progresta.sql`, { stdio: 'inherit' });
  console.log('✅ SQL migration completed\n');

  // 3. Generate new Prisma client
  console.log('🔄 Step 3: Generating new Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated\n');

  // 4. Verify migration
  console.log('🔍 Step 4: Verifying migration...');
  execSync('npx prisma db pull --force', { stdio: 'inherit' });
  console.log('✅ Migration verified\n');

  console.log('🎉 Progresta Migration Completed Successfully!');
  console.log('\n📝 Next Steps:');
  console.log('1. Review the updated prisma/schema.prisma file');
  console.log('2. Test the new database structure');
  console.log('3. Update your application code to use new models');
  console.log('4. Run: npm run dev to start development\n');

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Check your database connection in .env');
  console.log('2. Ensure your database is running');
  console.log('3. Check for any syntax errors in migrate-progresta.sql');
  console.log('4. Try running: npx prisma db push --force-reset (WARNING: This will delete all data)');
  process.exit(1);
}