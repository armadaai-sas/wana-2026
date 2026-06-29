-- Phase 3: Row Level Security (RLS) Policies
-- Enable RLS on sensitive tables and define access control policies

-- Enable RLS on content_queue table
ALTER TABLE content_queue ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated administrators can SELECT from content_queue
CREATE POLICY "authenticated_admin_select_content_queue" ON content_queue
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Policy: Only authenticated administrators can UPDATE content_queue
CREATE POLICY "authenticated_admin_update_content_queue" ON content_queue
  FOR UPDATE
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Policy: Service role can bypass RLS (for server-side operations)
CREATE POLICY "service_role_bypass_content_queue" ON content_queue
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Enable RLS on audit_logs table
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated administrators can SELECT audit_logs
CREATE POLICY "authenticated_admin_select_audit_logs" ON audit_logs
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Policy: Only service role can INSERT audit logs (application-level logging)
CREATE POLICY "service_role_insert_audit_logs" ON audit_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Policy: Service role can bypass RLS for audit logs
CREATE POLICY "service_role_bypass_audit_logs" ON audit_logs
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Grant appropriate permissions to authenticated users
GRANT SELECT ON content_queue TO authenticated;
GRANT UPDATE ON content_queue TO authenticated;
GRANT SELECT ON audit_logs TO authenticated;

-- Ensure only service role can modify policies
-- (Already handled by auth layer, but documented for clarity)
