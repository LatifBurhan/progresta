/**
 * Client-side Supabase utilities
 * For use in React components with user authentication
 * 
 * Note: This project uses custom JWT sessions, not Supabase Auth.
 * We need to manually set the user context for RLS policies.
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Create Supabase client for client-side use
 * This uses anon key since we're using custom JWT auth, not Supabase Auth
 */
export function createBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

/**
 * Get or create singleton Supabase client
 */
let browserClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabaseBrowserClient() {
  if (typeof window === 'undefined') {
    // Server-side: create new client each time
    return createBrowserClient()
  }

  // Client-side: reuse singleton
  if (!browserClient) {
    browserClient = createBrowserClient()
  }

  return browserClient
}
