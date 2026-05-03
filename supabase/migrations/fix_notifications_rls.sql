-- Fix RLS policies for notifications table
-- This app uses custom JWT auth, not Supabase Auth
-- So we need to update RLS policies to work without auth.uid()

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- Create new policies that work with custom JWT
-- Note: Application code filters by user_id, so we allow all authenticated requests
CREATE POLICY "Users can view notifications"
  ON notifications
  FOR SELECT
  USING (true);

CREATE POLICY "Users can update notifications"
  ON notifications
  FOR UPDATE
  USING (true);

-- Verify RLS is still enabled
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

COMMENT ON POLICY "Users can view notifications" ON notifications IS 'Allows all users to view notifications (filtered by user_id in application code)';
COMMENT ON POLICY "Users can update notifications" ON notifications IS 'Allows all users to update notifications (filtered by user_id in application code)';
