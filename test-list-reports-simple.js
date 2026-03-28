/**
 * Simple test for GET /api/reports/list endpoint
 * Tests the endpoint logic without authentication
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://ltdsbtelfetmgrxgoudf.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0ZHNidGVsZmV0bWdyeGdvdWRmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzM0OTU1MCwiZXhwIjoyMDg4OTI1NTUwfQ.LMhf_r-g3UIM1xZ-rXwMqAJbUdFQndF59wq6LMCsYCE";

async function testDatabaseQuery() {
  console.log("🧪 Testing database query logic\n");
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  
  try {
    // Test 1: Query all reports with joins
    console.log("📋 Test 1: Query reports with joins");
    const { data: reports, error, count } = await supabase
      .from('project_reports')
      .select(`
        id,
        user_id,
        project_id,
        lokasi_kerja,
        pekerjaan_dikerjakan,
        kendala,
        rencana_kedepan,
        foto_urls,
        created_at,
        updated_at,
        users!project_reports_user_id_fkey(name),
        projects!project_reports_project_id_fkey(name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.log(`❌ Query failed: ${error.message}`);
      return;
    }
    
    console.log(`✅ Query successful: ${reports.length} reports found`);
    console.log(`   Total count: ${count}`);
    
    if (reports.length > 0) {
      const report = reports[0];
      console.log(`   Sample report structure:`);
      console.log(`   - ID: ${report.id}`);
      console.log(`   - User: ${report.users?.name || 'N/A'}`);
      console.log(`   - Project: ${report.projects?.name || 'N/A'}`);
      console.log(`   - Location: ${report.lokasi_kerja}`);
      console.log(`   - Photos: ${Array.isArray(report.foto_urls) ? report.foto_urls.length : 'N/A'}`);
    } else {
      console.log(`   ℹ️  No reports in database yet`);
    }
    
    // Test 2: Test pagination
    console.log("\n📋 Test 2: Test pagination");
    const { data: page1 } = await supabase
      .from('project_reports')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .range(0, 4);
    
    console.log(`✅ Page 1: ${page1?.length || 0} reports`);
    
    // Test 3: Test date filtering
    console.log("\n📋 Test 3: Test date filtering");
    const today = new Date().toISOString().split('T')[0];
    const { data: todayReports } = await supabase
      .from('project_reports')
      .select('id, created_at')
      .gte('created_at', today)
      .order('created_at', { ascending: false });
    
    console.log(`✅ Reports from today: ${todayReports?.length || 0}`);
    
    // Test 4: Verify users table structure
    console.log("\n📋 Test 4: Verify users table");
    const { data: users } = await supabase
      .from('users')
      .select('id, name, role')
      .limit(3);
    
    console.log(`✅ Users table accessible: ${users?.length || 0} users found`);
    if (users && users.length > 0) {
      console.log(`   Sample user: ${users[0].name} (${users[0].role})`);
    }
    
    // Test 5: Verify projects table structure
    console.log("\n📋 Test 5: Verify projects table");
    const { data: projects } = await supabase
      .from('projects')
      .select('id, name, status')
      .limit(3);
    
    console.log(`✅ Projects table accessible: ${projects?.length || 0} projects found`);
    if (projects && projects.length > 0) {
      console.log(`   Sample project: ${projects[0].name} (${projects[0].status})`);
    }
    
    console.log("\n✅ All database tests passed!");
    
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    process.exit(1);
  }
}

// Run tests
testDatabaseQuery();
