import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * Preservation Property Tests for User Not Found Fix
 * 
 * These tests verify that existing behavior is preserved after the fix.
 * They should PASS on both unfixed and fixed code, confirming no regressions.
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 */

test.describe('Preservation: Existing User Behavior Unchanged', () => {
  let supabaseAdmin: ReturnType<typeof createClient>;
  let existingAdminEmail: string;
  let existingAdminPassword: string;
  let existingAdminId: string | null = null;
  let existingKaryawanEmail: string;
  let existingKaryawanPassword: string;
  let existingKaryawanId: string | null = null;

  test.beforeAll(async () => {
    // Initialize Supabase admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }

    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Create test users that exist in BOTH Auth and database
    const timestamp = Date.now();
    existingAdminEmail = `test-existing-admin-${timestamp}@example.com`;
    existingAdminPassword = 'TestPassword123!';
    existingKaryawanEmail = `test-existing-karyawan-${timestamp}@example.com`;
    existingKaryawanPassword = 'TestPassword123!';

    // Create admin in Auth
    const { data: adminAuth, error: adminAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: existingAdminEmail,
      password: existingAdminPassword,
      email_confirm: true,
      user_metadata: {
        role: 'ADMIN'
      }
    });

    if (adminAuthError || !adminAuth.user) {
      throw new Error(`Failed to create admin in Auth: ${adminAuthError?.message}`);
    }

    existingAdminId = adminAuth.user.id;

    // Insert admin into database
    const { error: adminDbError } = await supabaseAdmin
      .from('users')
      .insert({
        id: existingAdminId,
        email: existingAdminEmail,
        role: 'ADMIN'
      });

    if (adminDbError) {
      throw new Error(`Failed to insert admin into database: ${adminDbError.message}`);
    }

    // Create karyawan in Auth
    const { data: karyawanAuth, error: karyawanAuthError } = await supabaseAdmin.auth.admin.createUser({
      email: existingKaryawanEmail,
      password: existingKaryawanPassword,
      email_confirm: true,
      user_metadata: {
        role: 'KARYAWAN'
      }
    });

    if (karyawanAuthError || !karyawanAuth.user) {
      throw new Error(`Failed to create karyawan in Auth: ${karyawanAuthError?.message}`);
    }

    existingKaryawanId = karyawanAuth.user.id;

    // Insert karyawan into database
    const { error: karyawanDbError } = await supabaseAdmin
      .from('users')
      .insert({
        id: existingKaryawanId,
        email: existingKaryawanEmail,
        role: 'KARYAWAN'
      });

    if (karyawanDbError) {
      throw new Error(`Failed to insert karyawan into database: ${karyawanDbError.message}`);
    }

    console.log('Created test users in both Auth and database');
  });

  test.afterAll(async () => {
    // Cleanup: Delete test users from both database and Auth
    if (existingAdminId) {
      await supabaseAdmin.from('users').delete().eq('id', existingAdminId);
      await supabaseAdmin.auth.admin.deleteUser(existingAdminId);
    }
    if (existingKaryawanId) {
      await supabaseAdmin.from('users').delete().eq('id', existingKaryawanId);
      await supabaseAdmin.auth.admin.deleteUser(existingKaryawanId);
    }
    console.log('Cleaned up test users');
  });

  /**
   * Property 2: Preservation - Admin in Database
   * 
   * **EXPECTED OUTCOME**: Test PASSES on both unfixed and fixed code
   * 
   * Test Case: Admin found in users table with role ADMIN → should return 200 with list of users
   * 
   * **Validates: Requirements 3.1, 3.4**
   */
  test('should return 200 for admin user found in database', async ({ page }) => {
    // ACT: Login as existing admin
    await page.goto('/login');
    await page.fill('input[type="email"]', existingAdminEmail);
    await page.fill('input[type="password"]', existingAdminPassword);
    await page.click('button[type="submit"]');

    // Wait for login to complete
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Make API request to /api/dashboard/users
    const response = await page.request.get('/api/dashboard/users');
    const responseData = await response.json();

    // ASSERT: Should return 200 with user list
    expect(response.status()).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.data).toBeDefined();
    expect(Array.isArray(responseData.data)).toBe(true);
    
    // Verify response format is preserved
    if (responseData.data.length > 0) {
      const user = responseData.data[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('role');
      expect(user).toHaveProperty('totalReports');
      expect(user).toHaveProperty('todayReports');
      expect(user).toHaveProperty('todayProgress');
    }
  });

  /**
   * Property 2: Preservation - Non-Admin in Database
   * 
   * **EXPECTED OUTCOME**: Test PASSES on both unfixed and fixed code
   * 
   * Test Case: Non-admin found in users table with role KARYAWAN → should return 403 Unauthorized
   * 
   * **Validates: Requirements 3.2**
   */
  test('should return 403 for non-admin user found in database', async ({ page }) => {
    // ACT: Login as existing karyawan
    await page.goto('/login');
    await page.fill('input[type="email"]', existingKaryawanEmail);
    await page.fill('input[type="password"]', existingKaryawanPassword);
    await page.click('button[type="submit"]');

    // Wait for login to complete
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Make API request to /api/dashboard/users
    const response = await page.request.get('/api/dashboard/users');
    const responseData = await response.json();

    // ASSERT: Should return 403 Unauthorized
    expect(response.status()).toBe(403);
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain('Unauthorized');
  });

  /**
   * Property 2: Preservation - Invalid Session
   * 
   * **EXPECTED OUTCOME**: Test PASSES on both unfixed and fixed code
   * 
   * Test Case: Invalid session or no session → should return 401 Authentication required
   * 
   * **Validates: Requirements 3.3**
   */
  test('should return 401 for request without valid session', async ({ page, context }) => {
    // Clear all cookies to simulate no session
    await context.clearCookies();

    // Make API request without logging in
    const response = await page.request.get('/api/dashboard/users');
    const responseData = await response.json();

    // ASSERT: Should return 401 Authentication required
    expect(response.status()).toBe(401);
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain('Authentication required');
  });

  /**
   * Property 2: Preservation - Response Format
   * 
   * **EXPECTED OUTCOME**: Test PASSES on both unfixed and fixed code
   * 
   * Test Case: Response format (structure, field names, data types) should remain the same
   * 
   * **Validates: Requirements 3.4**
   */
  test('should preserve response format for existing users', async ({ page }) => {
    // ACT: Login as existing admin
    await page.goto('/login');
    await page.fill('input[type="email"]', existingAdminEmail);
    await page.fill('input[type="password"]', existingAdminPassword);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    const response = await page.request.get('/api/dashboard/users');
    const responseData = await response.json();

    // ASSERT: Response structure is preserved
    expect(responseData).toHaveProperty('success');
    expect(responseData).toHaveProperty('data');
    expect(typeof responseData.success).toBe('boolean');
    expect(Array.isArray(responseData.data)).toBe(true);

    // Verify each user object has expected fields
    if (responseData.data.length > 0) {
      const user = responseData.data[0];
      
      // Required fields
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('role');
      expect(user).toHaveProperty('totalReports');
      expect(user).toHaveProperty('todayReports');
      expect(user).toHaveProperty('todayProgress');
      
      // Type checks
      expect(typeof user.id).toBe('string');
      expect(typeof user.email).toBe('string');
      expect(typeof user.role).toBe('string');
      expect(typeof user.totalReports).toBe('number');
      expect(typeof user.todayReports).toBe('number');
      expect(typeof user.todayProgress).toBe('number');
    }
  });
});
