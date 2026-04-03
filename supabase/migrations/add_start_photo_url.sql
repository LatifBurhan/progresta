-- Migration: add_start_photo_url
-- Description: Adds start_photo_url column to overtime_sessions and overtime_requests tables

ALTER TABLE overtime_sessions
  ADD COLUMN start_photo_url TEXT;

ALTER TABLE overtime_requests
  ADD COLUMN start_photo_url TEXT;
