# Phase 3 Production Deployment - Quick Reference

**Quick Start:** Follow this checklist for a 30-minute production deployment.

---

## 🔐 Pre-Deployment (5 min)

- [ ] **Backup Database**
  - Supabase Dashboard → Settings → Backups → "Create backup"
  - Wait for "Backup created" confirmation

- [ ] **Verify admin_users Table**
  ```sql
  SELECT COUNT(*) FROM admin_users;
  -- Should return > 0
  ```

- [ ] **Add Admins to admin_users**
  ```sql
  INSERT INTO admin_users (user_id, is_active)
  VALUES ('ADMIN_USER_ID'::uuid, true);
  ```

---

## 🗝️ Deploy RLS Policies (10 min)

**Copy-paste these 9 SQL blocks into Supabase SQL Editor, one at a time:**

```sql
-- Block 1
ALTER TABLE content_queue ENABLE ROW LEVEL SECURITY;

-- Block 2
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

-- Block 3
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

-- Block 4
CREATE POLICY "service_role_bypass_content_queue" ON content_queue
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Block 5
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Block 6
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

-- Block 7
CREATE POLICY "service_role_insert_audit_logs" ON audit_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Block 8
CREATE POLICY "audit_logs_immutable" ON audit_logs
  FOR UPDATE, DELETE
  USING (false);

-- Block 9
CREATE POLICY "service_role_bypass_audit_logs" ON audit_logs
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
```

**Verify Policies:**
```sql
SELECT COUNT(*) FROM pg_policies WHERE tablename IN ('content_queue', 'audit_logs');
-- Should return: 7
```

---

## 🚀 Deploy to Production (5 min)

**Option A: Vercel Dashboard**
- Log in to Vercel
- Select project: wana-glamping
- Click: Deployments → Deploy
- Select branch: main
- Click: Deploy Now
- Wait for "Ready" status

**Option B: Git Push**
```bash
git push origin main
# Vercel auto-deploys
```

---

## ✅ Post-Deployment Validation (10 min)

### Test 1: Admin Access
```
✅ Go to: https://wana-glamping.life/
✅ Login as admin user
✅ Navigate to: /admin/content
✅ Verify: Page loads, pagination works
✅ Console: No RLS errors
```

### Test 2: Moderation Dashboard
```
✅ Navigate to: /admin/moderation
✅ Verify: PENDING items display
✅ Test: Approve/Reject action
✅ Verify: Action logged to audit_logs
```

### Test 3: Unauthorized Access
```
✅ Logout or use private/incognito window
✅ Try to visit: /admin/content
✅ Verify: Redirected to login (RLS working)
```

### Test 4: API Endpoints
```bash
# Content API
curl "https://wana-glamping.life/api/admin/content?page=0&limit=25"
# Expected: HTTP 200 with pagination data

# Audit Logs API
curl "https://wana-glamping.life/api/admin/audit-logs?page=0&limit=50"
# Expected: HTTP 200 with audit entries
```

---

## ⚠️ If Something Goes Wrong

### RLS Error: "violates row-level security policy"
```sql
-- Check user is in admin_users
SELECT * FROM admin_users WHERE user_id = 'USER_ID'::uuid;

-- Add/activate user
INSERT INTO admin_users (user_id, is_active) VALUES ('USER_ID'::uuid, true)
ON CONFLICT (user_id) DO UPDATE SET is_active = true;
```

### Build Failed in Vercel
1. Check: Vercel Dashboard → Deployments → [Latest] → "Build Logs"
2. Look for error message
3. Fix issue and push to main again
4. Vercel will retry automatically

### Emergency Rollback
```sql
-- Disable RLS (in Supabase SQL Editor)
ALTER TABLE content_queue DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

-- Or restore from backup: Supabase → Settings → Backups → Restore
```

---

## 📋 Sign-Off

| Task | Status |
|------|--------|
| Database backup created | ☐ Done |
| admin_users populated | ☐ Done |
| RLS policies deployed (7 total) | ☐ Done |
| Vercel build deployed | ☐ Done |
| Admin access verified | ☐ Done |
| Unauthorized access blocked | ☐ Done |
| API endpoints working | ☐ Done |
| Documentation reviewed | ☐ Done |

**Deployment Timestamp:** ________________  
**Verified By:** ________________

---

**Full Guide:** See `DEPLOYMENT_PHASE3.md` for detailed instructions  
**Questions?** Check `README_ADMIN.md` troubleshooting section
