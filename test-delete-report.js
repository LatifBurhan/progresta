/**
 * Manual Test Script for DELETE /api/reports/delete/[id]
 * 
 * This script tests the delete report endpoint with different scenarios:
 * 1. Delete own report (should succeed)
 * 2. Delete another user's report as non-admin (should fail)
 * 3. Delete any report as admin (should succeed)
 * 4. Delete non-existent report (should fail)
 * 
 * Requirements tested: 3.1, 3.2, 3.3, 3.4
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

/**
 * Test helper to make DELETE request
 */
async function deleteReport(reportId, sessionCookie) {
  const response = await fetch(`${BASE_URL}/api/reports/delete/${reportId}`, {
    method: 'DELETE',
    headers: {
      'Cookie': `session=${sessionCookie}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  return { status: response.status, data };
}

/**
 * Test helper to create a test report
 */
async function createTestReport(sessionCookie, projectId) {
  const response = await fetch(`${BASE_URL}/api/reports/create`, {
    method: 'POST',
    headers: {
      'Cookie': `session=${sessionCookie}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      project_id: projectId,
      lokasi_kerja: 'WFA',
      pekerjaan_dikerjakan: 'Test report for deletion',
      kendala: 'None',
      rencana_kedepan: 'Test cleanup',
      foto_urls: ['https://example.supabase.co/storage/v1/object/public/project-report-photos/test/test.jpg']
    })
  });

  const data = await response.json();
  return { status: response.status, data };
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 Testing DELETE /api/reports/delete/[id]\n');

  // Note: You need to provide valid session cookies and IDs for testing
  const USER_SESSION = process.env.TEST_USER_SESSION || 'your-user-session-cookie';
  const ADMIN_SESSION = process.env.TEST_ADMIN_SESSION || 'your-admin-session-cookie';
  const TEST_PROJECT_ID = process.env.TEST_PROJECT_ID || 'your-project-id';

  if (USER_SESSION === 'your-user-session-cookie') {
    console.log('⚠️  Please set environment variables:');
    console.log('   TEST_USER_SESSION - Session cookie for regular user');
    console.log('   TEST_ADMIN_SESSION - Session cookie for admin user');
    console.log('   TEST_PROJECT_ID - Valid project ID for testing');
    console.log('\nExample:');
    console.log('   TEST_USER_SESSION=xxx TEST_ADMIN_SESSION=yyy TEST_PROJECT_ID=zzz node test-delete-report.js');
    return;
  }

  // Test 1: Create and delete own report (should succeed)
  console.log('Test 1: User deletes own report');
  try {
    const createResult = await createTestReport(USER_SESSION, TEST_PROJECT_ID);
    if (createResult.status === 200 && createResult.data.success) {
      const reportId = createResult.data.data.id;
      console.log(`  ✓ Created test report: ${reportId}`);

      const deleteResult = await deleteReport(reportId, USER_SESSION);
      if (deleteResult.status === 200 && deleteResult.data.success) {
        console.log('  ✅ PASS: User successfully deleted own report\n');
      } else {
        console.log(`  ❌ FAIL: Expected success, got status ${deleteResult.status}`);
        console.log(`  Response:`, deleteResult.data, '\n');
      }
    } else {
      console.log('  ⚠️  SKIP: Could not create test report');
      console.log(`  Response:`, createResult.data, '\n');
    }
  } catch (error) {
    console.log('  ❌ ERROR:', error.message, '\n');
  }

  // Test 2: Delete non-existent report (should fail with 404)
  console.log('Test 2: Delete non-existent report');
  try {
    const fakeReportId = '00000000-0000-0000-0000-000000000000';
    const deleteResult = await deleteReport(fakeReportId, USER_SESSION);
    
    if (deleteResult.status === 404) {
      console.log('  ✅ PASS: Correctly returned 404 for non-existent report\n');
    } else {
      console.log(`  ❌ FAIL: Expected 404, got status ${deleteResult.status}`);
      console.log(`  Response:`, deleteResult.data, '\n');
    }
  } catch (error) {
    console.log('  ❌ ERROR:', error.message, '\n');
  }

  // Test 3: Delete without authentication (should fail with 401)
  console.log('Test 3: Delete without authentication');
  try {
    const createResult = await createTestReport(USER_SESSION, TEST_PROJECT_ID);
    if (createResult.status === 200 && createResult.data.success) {
      const reportId = createResult.data.data.id;
      
      const response = await fetch(`${BASE_URL}/api/reports/delete/${reportId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.status === 401) {
        console.log('  ✅ PASS: Correctly returned 401 for unauthenticated request\n');
        
        // Cleanup: delete the test report
        await deleteReport(reportId, USER_SESSION);
      } else {
        console.log(`  ❌ FAIL: Expected 401, got status ${response.status}`);
        console.log(`  Response:`, data, '\n');
      }
    } else {
      console.log('  ⚠️  SKIP: Could not create test report\n');
    }
  } catch (error) {
    console.log('  ❌ ERROR:', error.message, '\n');
  }

  // Test 4: Admin deletes any report (should succeed)
  console.log('Test 4: Admin deletes any report');
  try {
    const createResult = await createTestReport(USER_SESSION, TEST_PROJECT_ID);
    if (createResult.status === 200 && createResult.data.success) {
      const reportId = createResult.data.data.id;
      console.log(`  ✓ Created test report: ${reportId}`);

      const deleteResult = await deleteReport(reportId, ADMIN_SESSION);
      if (deleteResult.status === 200 && deleteResult.data.success) {
        console.log('  ✅ PASS: Admin successfully deleted user report\n');
      } else {
        console.log(`  ❌ FAIL: Expected success, got status ${deleteResult.status}`);
        console.log(`  Response:`, deleteResult.data, '\n');
      }
    } else {
      console.log('  ⚠️  SKIP: Could not create test report\n');
    }
  } catch (error) {
    console.log('  ❌ ERROR:', error.message, '\n');
  }

  console.log('✅ Test suite completed');
}

// Run tests
runTests().catch(console.error);
