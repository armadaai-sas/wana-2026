# Phase 3 Production Deployment Guide

**Date:** 2026-06-04  
**Version:** 1.0  
**Status:** Ready for Production Deployment  

---

## Pre-Deployment Verification (5 minutes)

### Step 1: Verify Database Backup

**Action:** Create a backup in Supabase Dashboard

```
1. Log in to Supabase Dashboard
2. Select your project
3. Navigate to: Settings → Backups
4. Click: "Create backup"
5. Wait for backup to complete (status: "Backup created")
6. Note the backup timestamp for rollback reference
```

**Expected Result:**
```
✅ Backup created: 2026-06-04 at [TIME]
✅ Backup size: [SIZE] MB
```

---

### Step 2: Verify admin_users Table

**Action:** Check that the `admin_users` table exists with correct schema

```sql
-- Run in Supabase SQL Editor
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'admin_users'
ORDER BY ordinal_position;
```

**Expected Result:**
```
table_name   | column_name | data_type | is_nullable
-------------|-------------|-----------|------------
admin_users  | id          | uuid      | NO
admin_users  | user_id     | uuid      | NO
admin_users  | is_active   | boolean   | NO
admin_users  | created_at  | timestamp | YES
admin_users  | updated_at  | timestamp | YES
```

**If table doesn't exist, create it:**
```sql
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable audit for admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
```

### Step 3: Populate admin_users Table

**Action:** Add authorized administrators to the `admin_users` table

**Get your admin user IDs:**
```sql
-- Run in Supabase SQL Editor to find user IDs
SELECT id, email, created_at
FROM auth.users
WHERE email IN (
  'your-admin-email@example.com',
  'another-admin@example.com'
);
```

**Add admins to admin_users table:**
```sql
-- Replace with actual user IDs from above
INSERT INTO admin_users (user_id, is_active)
VALUES
  ('00000000-0000-0000-0000-000000000001'::uuid, true),
  ('00000000-0000-0000-0000-000000000002'::uuid, true)
ON CONFLICT (user_id) DO UPDATE
SET is_active = true;

-- Verify insertion
SELECT user_id, is_active, created_at FROM admin_users;
```

**Expected Result:**
```
user_id                              | is_active | created_at
-------------------------------------|-----------|------------------------
00000000-0000-0000-0000-000000000001 | true      | 2026-06-04 12:00:00+00
00000000-0000-0000-0000-000000000002 | true      | 2026-06-04 12:00:00+00
```

---

## RLS Policy Deployment (10 minutes)

### Step 4: Execute RLS Policies

**Action:** Apply all RLS policies from `sql/rls-policies.sql`

**In Supabase SQL Editor:**

#### 4.1 Enable RLS on content_queue
```sql
ALTER TABLE content_queue ENABLE ROW LEVEL SECURITY;
```

✅ **Confirmation:** No error message appears

#### 4.2 Create SELECT policy for content_queue
```sql
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
```

✅ **Confirmation:** "Policy created successfully"

#### 4.3 Create UPDATE policy for content_queue
```sql
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
```

✅ **Confirmation:** "Policy created successfully"

#### 4.4 Create service role bypass for content_queue
```sql
CREATE POLICY "service_role_bypass_content_queue" ON content_queue
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
```

✅ **Confirmation:** "Policy created successfully"

#### 4.5 Enable RLS on audit_logs
```sql
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

✅ **Confirmation:** No error message appears

#### 4.6 Create SELECT policy for audit_logs
```sql
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
```

✅ **Confirmation:** "Policy created successfully"

#### 4.7 Create INSERT policy for audit_logs (service role only)
```sql
CREATE POLICY "service_role_insert_audit_logs" ON audit_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
```

✅ **Confirmation:** "Policy created successfully"

#### 4.8 Create immutability policy for audit_logs
```sql
CREATE POLICY "audit_logs_immutable" ON audit_logs
  FOR UPDATE, DELETE
  USING (false);
```

✅ **Confirmation:** "Policy created successfully"

#### 4.9 Create service role bypass for audit_logs
```sql
CREATE POLICY "service_role_bypass_audit_logs" ON audit_logs
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
```

✅ **Confirmation:** "Policy created successfully"

### Step 5: Verify RLS Policies Applied

**Action:** Confirm all policies are active

```sql
-- List all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('content_queue', 'audit_logs')
ORDER BY tablename, policyname;
```

**Expected Result:**
```
schemaname | tablename      | policyname                                    | permissive
-----------|----------------|-----------------------------------------------|----------
public     | content_queue  | authenticated_admin_select_content_queue       | PERMISSIVE
public     | content_queue  | authenticated_admin_update_content_queue       | PERMISSIVE
public     | content_queue  | service_role_bypass_content_queue              | PERMISSIVE
public     | audit_logs     | authenticated_admin_select_audit_logs          | PERMISSIVE
public     | audit_logs     | service_role_insert_audit_logs                 | PERMISSIVE
public     | audit_logs     | audit_logs_immutable                           | RESTRICTIVE
public     | audit_logs     | service_role_bypass_audit_logs                 | PERMISSIVE
```

✅ **All 7 policies present and active**

---

## Production Build & Deployment (5 minutes)

### Step 6: Trigger Vercel Production Deployment

**Action:** Deploy latest `main` branch to production

**Option A: Via Vercel Dashboard**
```
1. Log in to Vercel Dashboard
2. Select your project (wana-glamping)
3. Click: "Deployments"
4. Click: "Deploy" button
5. Select branch: "main"
6. Click: "Deploy Now"
7. Wait for build to complete (status: "Ready")
```

**Option B: Via Git Push**
```bash
git push origin main
# Vercel will auto-deploy on push
```

**Expected Result:**
```
✅ Build Status: Ready
✅ Production URL: https://wana-glamping.life/
✅ Deployment Time: < 2 minutes
```

**Monitor Build Output:**
- Navigate to Deployments → [Latest Build]
- Check "Build Logs" tab
- Look for any errors in build output
- Confirm all environment variables present

---

## Post-Deployment Validation (10 minutes)

### Step 7: Test Admin Access (Authorized User)

**Action:** Log in as an admin user and verify access to protected routes

**Test 1: Login and Navigate**
```
1. Go to: https://wana-glamping.life/
2. Click: Login
3. Sign in with admin account (one from admin_users table)
4. Navigate to: https://wana-glamping.life/admin/content
5. Verify: Page loads and displays content with pagination
```

**Expected Result:**
```
✅ Login successful
✅ /admin/content loads with data
✅ Pagination controls visible
✅ Table displays items correctly
✅ No RLS error messages in console
```

**Check Browser Console:**
```javascript
// Open DevTools (F12) → Console tab
// Should see no errors like:
// ❌ "new row violates row-level security policy"
// ❌ "PGRST116"
```

### Step 8: Test Admin Moderation (Authorized User)

**Action:** Verify moderation dashboard works with RLS

**Test 2: Moderation Dashboard**
```
1. Navigate to: https://wana-glamping.life/admin/moderation
2. Verify: Page loads and displays PENDING items
3. Try: Approve/Reject an item
4. Verify: Status updates, audit log created
```

**Expected Result:**
```
✅ /admin/moderation loads
✅ PENDING items display
✅ Approve/Reject buttons functional
✅ Action audit logged (check /admin logs)
✅ No RLS violations in console
```

### Step 9: Test Non-Admin Access (Unauthorized User)

**Action:** Verify RLS blocks unauthorized access

**Test 3: Unauthorized Access**
```
1. Create a test non-admin user (not in admin_users)
2. Log in with that account
3. Try to navigate to: https://wana-glamping.life/admin/content
4. Verify: Middleware redirects to login or shows error
```

**Expected Result:**
```
✅ Non-admin user redirected to login
✅ Cannot access /admin/* routes
✅ RLS policies working as expected
```

**Test 4: Direct Query Attempt (Advanced)**
```typescript
// In browser console with non-admin logged in:
const { data, error } = await supabase
  .from('content_queue')
  .select('*');

if (error?.code === 'PGRST116' || error?.message?.includes('violates row-level security')) {
  console.log('✅ RLS correctly blocking unauthorized access');
}
```

### Step 10: Verify Pagination API Endpoints

**Action:** Test new server-side pagination APIs

**Test 5: Content API**
```bash
# In browser or curl:
curl "https://wana-glamping.life/api/admin/content?page=0&limit=25&sortBy=created_at&sortOrder=desc"

# Expected response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 0,
    "limit": 25,
    "total": 150,
    "totalPages": 6,
    "hasNext": true,
    "hasPrev": false
  }
}
```

✅ **Confirmation:** HTTP 200, valid JSON response

**Test 6: Audit Logs API**
```bash
curl "https://wana-glamping.life/api/admin/audit-logs?page=0&limit=50"

# Expected response includes audit entries
```

✅ **Confirmation:** HTTP 200, audit log entries returned

---

## Verification Checklist

Use this checklist to confirm all deployment steps completed:

### Pre-Deployment
- [ ] Database backup created and noted
- [ ] `admin_users` table exists with correct schema
- [ ] All authorized admins added to `admin_users` table
- [ ] All admin records have `is_active = true`

### RLS Policy Deployment
- [ ] `content_queue` RLS enabled
- [ ] `content_queue` SELECT policy created
- [ ] `content_queue` UPDATE policy created
- [ ] `content_queue` service role bypass created
- [ ] `audit_logs` RLS enabled
- [ ] `audit_logs` SELECT policy created
- [ ] `audit_logs` INSERT policy created
- [ ] `audit_logs` immutability policy created
- [ ] `audit_logs` service role bypass created
- [ ] All 7 policies verified with pg_policies query

### Build & Deployment
- [ ] Latest `main` branch pushed to GitHub
- [ ] Vercel deployment triggered
- [ ] Build completed successfully (status: "Ready")
- [ ] No build errors in deployment logs
- [ ] Production URL accessible

### Post-Deployment Validation
- [ ] Admin user can login
- [ ] `/admin/content` loads with pagination
- [ ] `/admin/moderation` loads with PENDING items
- [ ] Non-admin access blocked by middleware
- [ ] RLS policies enforced (no console errors)
- [ ] Pagination API `/api/admin/content` responds with 200
- [ ] Pagination API `/api/admin/audit-logs` responds with 200
- [ ] No RLS violation errors (PGRST116)
- [ ] Audit logs being created for actions

---

## Troubleshooting Guide

### Issue: "new row violates row-level security policy"

**Cause:** User not in `admin_users` table or `is_active = false`

**Solution:**
```sql
-- Check if user is in admin_users
SELECT * FROM admin_users WHERE user_id = 'USER_ID_HERE'::uuid;

-- Add user if missing
INSERT INTO admin_users (user_id, is_active) 
VALUES ('USER_ID_HERE'::uuid, true);

-- Activate if inactive
UPDATE admin_users SET is_active = true WHERE user_id = 'USER_ID_HERE'::uuid;
```

### Issue: /admin routes return 401 Unauthorized

**Cause:** Middleware authentication failing

**Solution:**
```
1. Clear browser cookies: Settings → Cookies → Clear
2. Log out and log back in
3. Check Supabase Auth session is active
4. Verify JWT token is valid
```

### Issue: Vercel Build Fails

**Cause:** Missing environment variables or code errors

**Solution:**
```
1. Check Vercel Dashboard → Settings → Environment Variables
2. Verify NEXT_PUBLIC_SUPABASE_URL is set
3. Verify SUPABASE_SERVICE_ROLE_KEY is set
4. Check build logs for specific error
5. Rebuild after fixing issues
```

### Issue: Pagination API returns empty data

**Cause:** Service role key not used or data doesn't exist

**Solution:**
```
1. Verify data exists in tables: SELECT COUNT(*) FROM content_queue;
2. Check API route uses createClient({ useServiceRole: true })
3. Verify service role key is correct in environment
4. Test with curl to isolate client vs server issue
```

---

## Rollback Procedures

### Emergency Rollback: Disable RLS

If RLS policies cause critical issues, disable them:

```sql
-- Drop all policies
DROP POLICY IF EXISTS "authenticated_admin_select_content_queue" ON content_queue;
DROP POLICY IF EXISTS "authenticated_admin_update_content_queue" ON content_queue;
DROP POLICY IF EXISTS "service_role_bypass_content_queue" ON content_queue;
DROP POLICY IF EXISTS "authenticated_admin_select_audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "service_role_insert_audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_immutable" ON audit_logs;
DROP POLICY IF EXISTS "service_role_bypass_audit_logs" ON audit_logs;

-- Disable RLS
ALTER TABLE content_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
```

### Restore from Backup

If critical issues persist:

```
1. Supabase Dashboard → Settings → Backups
2. Click: "Restore" on the backup created in Step 1
3. Confirm restoration
4. Wait for backup to restore (15-30 minutes)
5. Investigate issues and retry deployment
```

---

## Post-Deployment Monitoring

### Monitor RLS Performance

```sql
-- Check for RLS violations in logs
SELECT 
  timestamp,
  message,
  detail
FROM postgres_logs
WHERE message ILIKE '%violates row-level security%'
  AND timestamp > NOW() - INTERVAL '1 hour'
ORDER BY timestamp DESC;
```

### Monitor Admin Activity

```sql
-- Recent admin actions
SELECT 
  user_id,
  action,
  target_table,
  created_at
FROM audit_logs
ORDER BY created_at DESC
LIMIT 20;
```

### Set Up Alerts

In Supabase Dashboard → Alerts:
- Alert on RLS violations (threshold: >5 per hour)
- Alert on failed authentications (threshold: >10 per hour)
- Alert on slow queries (threshold: >1000ms)

---

## Sign-Off

Once all steps completed and verified:

**Deployment Completed By:** ___________________  
**Date:** ___________________  
**Time:** ___________________  
**Issues Encountered:** ☐ None ☐ Yes (documented above)  
**Rollback Executed:** ☐ No ☐ Yes (describe below)  

**Notes:**
```
[Document any issues, resolutions, or deviations from this procedure]
```

---

**For Support:** Contact dev team or review README_ADMIN.md for troubleshooting
