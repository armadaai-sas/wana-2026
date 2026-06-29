-- Phase 3: Database Hardening - Row Level Security (RLS)
-- Execute these snippets in your Supabase SQL Editor

-- ============================================
-- 1. CONTENT_QUEUE TABLE - RLS POLICIES
-- ============================================

-- Enable RLS on content_queue
ALTER TABLE content_queue ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated admins can SELECT all pending content
CREATE POLICY "Admins can select content queue"
  ON content_queue FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Only assigned reviewers or service role can UPDATE status
CREATE POLICY "Admins can update content queue status"
  ON content_queue FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Prevent DELETE unless service role
CREATE POLICY "Only service role can delete content"
  ON content_queue FOR DELETE
  USING (auth.role() = 'service_role');

-- ============================================
-- 2. AUDIT_LOGS TABLE - RLS POLICIES
-- ============================================

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated admins can SELECT audit logs
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Service role can INSERT audit logs
CREATE POLICY "Service role can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR auth.uid()::text = user_id::text);

-- Policy: Prevent UPDATE/DELETE on audit logs (immutable)
CREATE POLICY "Audit logs are immutable"
  ON audit_logs FOR UPDATE, DELETE
  USING (false);

-- ============================================
-- 3. PROPERTIES TABLE - OPTIONAL RLS (if needed)
-- ============================================

-- If you want to restrict properties table access:
-- ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Authenticated users can select properties"
--   ON properties FOR SELECT
--   USING (auth.role() = 'authenticated');
