-- Fix RLS policies for custom JWT auth (not using Supabase Auth)
-- Since this project uses custom JWT sessions, we can't use auth.uid()
-- Instead, we'll make the table accessible with anon key and rely on application-level security

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Service role can delete notifications" ON notifications;
DROP POLICY IF EXISTS "Authenticated can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON notifications;

-- Disable RLS temporarily to allow anon access
-- We'll rely on application-level security (checking userId in queries)
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Alternative: Keep RLS enabled but allow all operations for anon role
-- This is more secure as it still has RLS, but allows anon key to access
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Allow anon role to do everything (application will filter by user_id)
CREATE POLICY "Allow anon access for notifications"
  ON notifications
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Service role can do everything
CREATE POLICY "Service role full access"
  ON notifications
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON notifications TO anon;
GRANT ALL ON notifications TO service_role;

-- Add comment explaining the security model
COMMENT ON TABLE notifications IS 'RLS allows anon access - security enforced at application level by filtering user_id in queries';
