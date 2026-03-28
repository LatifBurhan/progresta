/**
 * Test script for GET /api/reports/list endpoint
 * 
 * This script tests the list reports endpoint with various scenarios:
 * 1. List all reports (no filters)
 * 2. List reports with project filter
 * 3. List reports with date range filter
 * 4. List reports with pagination
 */

const SUPABASE_URL = "https://ltdsbtelfetmgrxgoudf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0ZHNidGVsZmV0bWdyeGdvdWRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNDk1NTAsImV4cCI6MjA4ODkyNTU1MH0.KTdCAKllfWI-VDtFsZ7oqUiTPU_m1XARbSOX3TEgU0Y";

// Test credentials - replace with actual test user
const TEST_EMAIL = "admin@progresta.com";
const TEST_PASSWORD = "admin123";

async function login() {
  console.log("🔐 Logging in...");
  
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY
    },
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Login failed: ${error}`);
  }

  const data = await response.json();
  console.log("✅ Login successful");
  return data.access_token;
}

async function testListAllReports(accessToken) {
  console.log("\n📋 Test 1: List all reports (no filters)");
  
  const response = await fetch('http://localhost:3001/api/reports/list', {
    method: 'GET',
    headers: {
      'Cookie': `session=${accessToken}`
    }
  });

  const data = await response.json();
  
  if (response.ok && data.success) {
    console.log(`✅ Success: Retrieved ${data.data.reports.length} reports`);
    console.log(`   Total: ${data.data.total}, Has more: ${data.data.has_more}`);
    
    if (data.data.reports.length > 0) {
      const report = data.data.reports[0];
      console.log(`   Sample report: ${report.project_name} by ${report.user_name}`);
      console.log(`   Can edit: ${report.can_edit}, Can delete: ${report.can_delete}`);
    }
  } else {
    console.log(`❌ Failed: ${data.error}`);
  }
  
  return data;
}

async function testListWithProjectFilter(accessToken, projectId) {
  console.log("\n📋 Test 2: List reports with project filter");
  
  const response = await fetch(`http://localhost:3001/api/reports/list?project_id=${projectId}`, {
    method: 'GET',
    headers: {
      'Cookie': `session=${accessToken}`
    }
  });

  const data = await response.json();
  
  if (response.ok && data.success) {
    console.log(`✅ Success: Retrieved ${data.data.reports.length} reports for project ${projectId}`);
    
    // Verify all reports are for the specified project
    const allMatch = data.data.reports.every(r => r.project_id === projectId);
    console.log(`   All reports match project filter: ${allMatch}`);
  } else {
    console.log(`❌ Failed: ${data.error}`);
  }
  
  return data;
}

async function testListWithDateFilter(accessToken) {
  console.log("\n📋 Test 3: List reports with date range filter");
  
  const today = new Date().toISOString().split('T')[0];
  const response = await fetch(`http://localhost:3001/api/reports/list?start_date=${today}`, {
    method: 'GET',
    headers: {
      'Cookie': `session=${accessToken}`
    }
  });

  const data = await response.json();
  
  if (response.ok && data.success) {
    console.log(`✅ Success: Retrieved ${data.data.reports.length} reports from today`);
    
    // Verify all reports are from today or later
    const allMatch = data.data.reports.every(r => {
      const reportDate = new Date(r.created_at).toISOString().split('T')[0];
      return reportDate >= today;
    });
    console.log(`   All reports match date filter: ${allMatch}`);
  } else {
    console.log(`❌ Failed: ${data.error}`);
  }
  
  return data;
}

async function testListWithPagination(accessToken) {
  console.log("\n📋 Test 4: List reports with pagination");
  
  // First page
  const response1 = await fetch('http://localhost:3001/api/reports/list?limit=5&offset=0', {
    method: 'GET',
    headers: {
      'Cookie': `session=${accessToken}`
    }
  });

  const data1 = await response1.json();
  
  if (response1.ok && data1.success) {
    console.log(`✅ Page 1: Retrieved ${data1.data.reports.length} reports`);
    console.log(`   Total: ${data1.data.total}, Has more: ${data1.data.has_more}`);
    
    // Second page if available
    if (data1.data.has_more) {
      const response2 = await fetch('http://localhost:3001/api/reports/list?limit=5&offset=5', {
        method: 'GET',
        headers: {
          'Cookie': `session=${accessToken}`
        }
      });

      const data2 = await response2.json();
      
      if (response2.ok && data2.success) {
        console.log(`✅ Page 2: Retrieved ${data2.data.reports.length} reports`);
        
        // Verify no duplicate IDs between pages
        const ids1 = new Set(data1.data.reports.map(r => r.id));
        const ids2 = new Set(data2.data.reports.map(r => r.id));
        const overlap = [...ids1].filter(id => ids2.has(id));
        console.log(`   No duplicate reports between pages: ${overlap.length === 0}`);
      }
    }
  } else {
    console.log(`❌ Failed: ${data1.error}`);
  }
  
  return data1;
}

async function testSortOrder(accessToken) {
  console.log("\n📋 Test 5: Verify sort order (newest first)");
  
  const response = await fetch('http://localhost:3001/api/reports/list?limit=10', {
    method: 'GET',
    headers: {
      'Cookie': `session=${accessToken}`
    }
  });

  const data = await response.json();
  
  if (response.ok && data.success && data.data.reports.length > 1) {
    // Check if reports are sorted by created_at DESC
    let isSorted = true;
    for (let i = 0; i < data.data.reports.length - 1; i++) {
      const current = new Date(data.data.reports[i].created_at);
      const next = new Date(data.data.reports[i + 1].created_at);
      if (current < next) {
        isSorted = false;
        break;
      }
    }
    
    console.log(`✅ Reports sorted by created_at DESC: ${isSorted}`);
  } else {
    console.log(`⚠️  Not enough reports to verify sort order`);
  }
  
  return data;
}

async function runTests() {
  try {
    console.log("🚀 Starting list reports endpoint tests\n");
    
    // Login
    const accessToken = await login();
    
    // Test 1: List all reports
    const allReports = await testListAllReports(accessToken);
    
    // Test 2: List with project filter (if we have reports)
    if (allReports.success && allReports.data.reports.length > 0) {
      const projectId = allReports.data.reports[0].project_id;
      await testListWithProjectFilter(accessToken, projectId);
    }
    
    // Test 3: List with date filter
    await testListWithDateFilter(accessToken);
    
    // Test 4: Pagination
    await testListWithPagination(accessToken);
    
    // Test 5: Sort order
    await testSortOrder(accessToken);
    
    console.log("\n✅ All tests completed!");
    
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    process.exit(1);
  }
}

// Run tests
runTests();
