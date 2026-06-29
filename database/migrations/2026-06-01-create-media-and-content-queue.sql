-- Migration: Create tables for media tracking and moderation queue
-- Run this in Supabase SQL editor

-- Table: properties_media (metadata for objects stored in Supabase Storage)
CREATE TABLE IF NOT EXISTS properties_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE SET NULL,
  file_path text NOT NULL,
  file_url text,
  content_type text,
  size_bytes integer,
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text DEFAULT 'pending', -- pending | approved | rejected
  created_at timestamptz DEFAULT now()
);

-- Table: content_queue (legacy name for moderation queue)
CREATE TABLE IF NOT EXISTS content_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_path text,
  caption text,
  status text DEFAULT 'pending', -- pending | approved | rejected
  reviewer_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz
);

-- Table: error_logs (simple observability table referenced by webhook)
CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL,
  error_message text,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_properties_media_property ON properties_media(property_id);
CREATE INDEX IF NOT EXISTS idx_content_queue_status ON content_queue(status);
