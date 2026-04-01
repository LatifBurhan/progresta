-- ============================================================
-- Migration: create_overtime_tables
-- Description: Creates overtime_sessions and overtime_requests tables
--              with indexes, constraints, RLS policies, storage bucket,
--              and updated_at triggers for the Overtime Management System.
-- ============================================================

-- ============================================================
-- overtime_sessions table
-- ============================================================
CREATE TABLE overtime_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  location TEXT NOT NULL,
  project_leader TEXT NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for overtime_sessions
CREATE INDEX idx_overtime_sessions_user_id ON overtime_sessions(user_id);
CREATE INDEX idx_overtime_sessions_status ON overtime_sessions(status);
CREATE INDEX idx_overtime_sessions_start_time ON overtime_sessions(start_time);

-- Unique constraint: only one active session per user
CREATE UNIQUE INDEX idx_overtime_sessions_user_active
  ON overtime_sessions(user_id)
  WHERE status = 'active';

-- Data integrity constraint
ALTER TABLE overtime_sessions
  ADD CONSTRAINT check_end_time_after_start
  CHECK (end_time IS NULL OR end_time > start_time);

-- ============================================================
-- overtime_requests table
-- ============================================================
CREATE TABLE overtime_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES overtime_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  project_leader TEXT NOT NULL,
  purpose TEXT NOT NULL,
  duration INTERVAL NOT NULL,
  proof_photo_url TEXT NOT NULL,
  approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved')),
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for overtime_requests
CREATE INDEX idx_overtime_requests_user_id ON overtime_requests(user_id);
CREATE INDEX idx_overtime_requests_approval_status ON overtime_requests(approval_status);
CREATE INDEX idx_overtime_requests_created_at ON overtime_requests(created_at);
CREATE INDEX idx_overtime_requests_approved_by ON overtime_requests(approved_by);

-- One request per session
CREATE UNIQUE INDEX idx_overtime_requests_session_id ON overtime_requests(session_id);

-- Data integrity constraints
ALTER TABLE overtime_requests
  ADD CONSTRAINT check_positive_duration
  CHECK (duration > INTERVAL '0 minutes');

ALTER TABLE overtime_requests
  ADD CONSTRAINT check_approved_at_consistency
  CHECK (
    (approval_status = 'approved' AND approved_at IS NOT NULL AND approved_by IS NOT NULL) OR
    (approval_status = 'pending' AND approved_at IS NULL)
  );

-- ============================================================
-- RLS for overtime_sessions
-- ============================================================
ALTER TABLE overtime_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own overtime sessions"
  ON overtime_sessions FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "GENERAL_AFFAIR can view all overtime sessions"
  ON overtime_sessions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'GENERAL_AFFAIR'
    )
  );

-- ============================================================
-- RLS for overtime_requests
-- ============================================================
ALTER TABLE overtime_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own overtime requests"
  ON overtime_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "GENERAL_AFFAIR can manage all overtime requests"
  ON overtime_requests FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'GENERAL_AFFAIR'
    )
  );

CREATE POLICY "System can create overtime requests"
  ON overtime_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- Storage bucket: overtime-proofs
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('overtime-proofs', 'overtime-proofs', true);

CREATE POLICY "Authenticated users can upload overtime proofs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'overtime-proofs');

CREATE POLICY "Users can view overtime proofs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'overtime-proofs');

CREATE POLICY "GENERAL_AFFAIR can delete overtime proofs"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'overtime-proofs' AND
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
        AND users.role = 'GENERAL_AFFAIR'
    )
  );

-- ============================================================
-- updated_at trigger function and triggers
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_overtime_sessions_updated_at
  BEFORE UPDATE ON overtime_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_overtime_requests_updated_at
  BEFORE UPDATE ON overtime_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
