import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

/**
 * Bug Condition Exploration Tests for User Not Found Fix
 * 
 * These tests verify the fix for the "User not found" error when accessing
 * /api/dashboard/users endpoint. The bug occurs when a user has a valid
 * session from Supabase Auth but is not found in the users table.
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 2.1, 2.2, 2.4**
 */

test.describe('Bug Condition Exploration: User Not Found Fallback', () => {
  let testAuthUserId: string | null = null;
  let testAuthUserEmail: string;
  let testAuthUserPassword: string;
  let supabaseAdmin: ReturnType<typeof createClient>;

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

    // Generate unique test user credentials
    const timestamp = Date.now();
    testAuthUserEmail = `test-admin-auth-only-${timestamp}@example.com`;
    testAuthUserPassword = 'TestPassword123!';
  });

  test.afterAll(async () => {
    // Cleanup: Delete test user from Supabase Auth if created
    if (testAuthUserId && supabaseAdmin) {
      try {
        await supabaseAdmin.auth.admin.deleteUser(testAuthUserId);
        console.log('Cleaned up test user from Auth:', testAuthUserId);
      } catch (error) {
        console.error('Failed to cleanup test user:', error);
      }
    }
  });

  /**
   * Property 1: Bug Condition - User Not Found Fallback to Supabase Auth
   * 
   * **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
   * **EXPECTED OUTCOME ON UNFIXED CODE**: Test FAILS with error 404 "User not found"
   * 
   * Test Case: Admin created via supabase.auth.admin.createUser() with 
   * user_metadata.role = 'ADMIN' but NOT inserted into users table
   * 
   * **Validates: Requirements 2.1, 2.2, 2.4**
   */
  test('should fallback to Supabase Auth when user exists in Auth but not in database', async ({ page, context }) => {
    // ARRANGE: Create admin user in Supabase Auth only (not in users table)
    const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: testAuthUserEmail,
      password: testAuthUserPassword,
      email_confirm: true,
      user_metadata: {
        role: 'ADMIN'
      }
    });

    if (createError || !authUser.user) {
      throw new Error(`Failed to create test user in Auth: ${createError?.message}`);
    }

    testAuthUserId = authUser.user.id;
    console.log('Created test user in Auth only:', testAuthUserId);

    // Verify user does NOT exist in users table
    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', testAuthUserId)
      .single();

    expect(dbUser).toBeNull(); // Confirm user is NOT in database

    // ACT: Login as this user and access /api/dashboard/users
    await page.goto('/login');
    await page.fill('input[type="email"]', testAuthUserEmail);
    await page.fill('input[type="password"]', testAuthUserPassword);
    await page.click('button[type="submit"]');

    // Wait for login to complete
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // Make API request to /api/dashboard/users
    const response = await page.request.get('/api/dashboard/users');
    const responseData = await response.json();

    // ASSERT: On FIXED code, should return 200 with user list (admin access granted via Auth fallback)
    // On UNFIXED code, this will FAIL with 404 "User not found"
    expect(response.status()).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.data).toBeDefined();
    expect(Array.isArray(responseData.data)).toBe(true);
  });

  /**
   * Property 1: Bug Condition - Desync Scenario
   * 
   * Test Case: User exists in Auth but deleted from users table (desync scenario)
   * 
   * **Validates: Requirements 1.3, 2.1, 2.2**
   */
  test('should handle desync scenario where user is deleted from database but exists in Auth', async ({ page }) => {
    // ARRANGE: Create user in both Auth and database, then delete from database
    const timestamp = Date.now();
    const desyncEmail = `test-desync-${timestamp}@example.com`;
    const desyncPassword = 'TestPassword123!';

    // Create in Auth
    const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: desyncEmail,
      password: desyncPassword,
      email_confirm: true,
      user_metadata: {
        role: 'ADMIN'
      }
    });

    if (createError || !authUser.user) {
      throw new Error(`Failed to create desync test user: ${createError?.message}`);
    }

    const desyncUserId = authUser.user.id;

    // Insert into database
    await supabaseAdmin
      .from('users')
      .insert({
        id: desyncUserId,
        email: desyncEmail,
        role: 'ADMIN'
      });

    // Delete from database (simulate desync)
    await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', desyncUserId);

    // Verify user is NOT in database
    const { data: dbUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', desyncUserId)
      .single();

    expect(dbUser).toBeNull();

    // ACT: Login and access endpoint
    await page.goto('/login');
    await page.fill('input[type="email"]', desyncEmail);
    await page.fill('input[type="password"]', desyncPassword);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    const response = await page.request.get('/api/dashboard/users');
    const responseData = await response.json();

    // ASSERT: Should fallback to Auth and return 200
    expect(response.status()).toBe(200);
    expect(responseData.success).toBe(true);

    // Cleanup
    await supabaseAdmin.auth.admin.deleteUser(desyncUserId);
  });

  /**
   * Property 1: Bug Condition - Non-Admin User
   * 
   * Test Case: Non-admin user (KARYAWAN) exists in Auth but not in database
   * Should return 403 Unauthorized (not 404)
   * 
   * **Validates: Requirements 2.1, 2.2, 3.2**
   */
  test('should return 403 for non-admin user in Auth but not in database', async ({ page }) => {
    const timestamp = Date.now();
    const nonAdminEmail = `test-karyawan-${timestamp}@example.com`;
    const nonAdminPassword = 'TestPassword123!';

    // Create non-admin user in Auth only
    const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: nonAdminEmail,
      password: nonAdminPassword,
      email_confirm: true,
      user_metadata: {
        role: 'KARYAWAN'
      }
    });

    if (createError || !authUser.user) {
      throw new Error(`Failed to create non-admin test user: ${createError?.message}`);
    }

    const nonAdminUserId = authUser.user.id;

    // ACT: Login and access endpoint
    await page.goto('/login');
    await page.fill('input[type="email"]', nonAdminEmail);
    await page.fill('input[type="password"]', nonAdminPassword);
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    const response = await page.request.get('/api/dashboard/users');
    const responseData = await response.json();

    // ASSERT: Should return 403 Unauthorized (not 404)
    expect(response.status()).toBe(403);
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain('Unauthorized');

    // Cleanup
    await supabaseAdmin.auth.admin.deleteUser(nonAdminUserId);
  });
});
