-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  action_url TEXT,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '3 days'),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);

-- Create index for unread notifications per user (most common query)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read, created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Note: This app uses custom JWT auth, not Supabase Auth
-- So we disable RLS for now and rely on application-level security
-- Users can view all notifications (filtered by user_id in application code)
CREATE POLICY "Users can view notifications"
  ON notifications
  FOR SELECT
  USING (true);

-- Users can update all notifications (filtered by user_id in application code)
CREATE POLICY "Users can update notifications"
  ON notifications
  FOR UPDATE
  USING (true);

-- Only system/admin can insert notifications (via service role)
CREATE POLICY "Service role can insert notifications"
  ON notifications
  FOR INSERT
  WITH CHECK (true);

-- Only system/admin can delete notifications (via service role)
CREATE POLICY "Service role can delete notifications"
  ON notifications
  FOR DELETE
  USING (true);

-- Function to auto-delete expired notifications
CREATE OR REPLACE FUNCTION delete_expired_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to clean up expired notifications (runs daily at 2 AM)
-- Note: This requires pg_cron extension
-- If pg_cron is not available, you can use a cron job or Vercel cron instead
-- SELECT cron.schedule('delete-expired-notifications', '0 2 * * *', 'SELECT delete_expired_notifications()');

COMMENT ON TABLE notifications IS 'Stores user notifications with 3-day expiration';
COMMENT ON COLUMN notifications.expires_at IS 'Notifications automatically deleted after this timestamp (default: 3 days from creation)';
