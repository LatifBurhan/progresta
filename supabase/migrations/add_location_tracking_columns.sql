-- ============================================================
-- Migration: add_location_tracking_columns
-- Description: Adds GPS location tracking columns to overtime_sessions table
--              for capturing clock in and clock out coordinates.
--              Includes check constraints for valid coordinate ranges and
--              partial indexes for location-based queries.
-- Feature: Overtime Location Tracking
-- ============================================================

-- ============================================================
-- Add location columns to overtime_sessions
-- ============================================================
ALTER TABLE overtime_sessions
  ADD COLUMN clock_in_lat DECIMAL(10, 8) NULL,
  ADD COLUMN clock_in_lng DECIMAL(11, 8) NULL,
  ADD COLUMN clock_out_lat DECIMAL(10, 8) NULL,
  ADD COLUMN clock_out_lng DECIMAL(11, 8) NULL;

-- ============================================================
-- Add column comments for documentation
-- ============================================================
COMMENT ON COLUMN overtime_sessions.clock_in_lat IS 'GPS latitude captured at clock in (-90 to 90)';
COMMENT ON COLUMN overtime_sessions.clock_in_lng IS 'GPS longitude captured at clock in (-180 to 180)';
COMMENT ON COLUMN overtime_sessions.clock_out_lat IS 'GPS latitude captured at clock out (-90 to 90)';
COMMENT ON COLUMN overtime_sessions.clock_out_lng IS 'GPS longitude captured at clock out (-180 to 180)';

-- ============================================================
-- Add check constraints for valid coordinate ranges
-- ============================================================
ALTER TABLE overtime_sessions
  ADD CONSTRAINT check_clock_in_lat_range 
    CHECK (clock_in_lat IS NULL OR (clock_in_lat >= -90 AND clock_in_lat <= 90)),
  ADD CONSTRAINT check_clock_in_lng_range 
    CHECK (clock_in_lng IS NULL OR (clock_in_lng >= -180 AND clock_in_lng <= 180)),
  ADD CONSTRAINT check_clock_out_lat_range 
    CHECK (clock_out_lat IS NULL OR (clock_out_lat >= -90 AND clock_out_lat <= 90)),
  ADD CONSTRAINT check_clock_out_lng_range 
    CHECK (clock_out_lng IS NULL OR (clock_out_lng >= -180 AND clock_out_lng <= 180));

-- ============================================================
-- Add partial indexes for location-based queries
-- ============================================================
CREATE INDEX idx_overtime_sessions_clock_in_location 
  ON overtime_sessions(clock_in_lat, clock_in_lng) 
  WHERE clock_in_lat IS NOT NULL AND clock_in_lng IS NOT NULL;

CREATE INDEX idx_overtime_sessions_clock_out_location 
  ON overtime_sessions(clock_out_lat, clock_out_lng) 
  WHERE clock_out_lat IS NOT NULL AND clock_out_lng IS NOT NULL;
