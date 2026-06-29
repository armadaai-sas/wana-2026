# Admin Dashboard Architecture & Operations Guide

## Overview

This document outlines the architecture, security policies, and operational procedures for the Wana Glamping admin dashboard system. The dashboard is built on a containerized component architecture with strict row-level security (RLS) policies enforced at the database level.

---

## 1. Architecture Patterns

### 1.1 Container/Presentational Pattern

All admin modules follow a strict separation of concerns:

- **Container Component** (`page.tsx`): Handles data fetching, state management, and business logic
- **Presentational Component** (`*View.tsx`): Pure UI rendering with no side effects

**Example Structure:**
```
app/admin/moderation/
  ├── page.tsx (Container - logic, state, data fetching)
  └── ModerationView.tsx (Presentational - UI only)
```

**Benefits:**
- Testable business logic separate from UI
- Reusable presentational components
- Clear data flow and responsibility
- Easier debugging and maintenance

### 1.2 Centralized Type Definitions

All data models are defined in `types/database.types.ts` to prevent schema mismatches:

```typescript
export interface ContentQueueItem {
  id: string;
  file_url: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  // ... other fields
}
```

**Rule:** Every new admin module must import and use these types. Never define duplicate interfaces.

### 1.3 Direct Supabase Client

The admin dashboard uses `supabaseClient.js` for direct Supabase connections:

```typescript
import { supabase } from '@/supabaseClient';
```

This ensures:
- No fallback stubs in production
- Transparent error handling
- Consistent authentication context

---

## 2. Database Security & Row Level Security (RLS)

### 2.1 RLS Policy Overview

All admin tables enforce RLS at the database level. Users can only access data permitted by policies.

### 2.2 Content Queue Table Policies (Phase 3 Hardening)

**Table:** `content_queue`

| Policy | Operation | Condition | Effect |
|--------|-----------|-----------|--------|
| `authenticated_admin_select_content_queue` | SELECT | Admin in `admin_users` table + active | Only authorized admins can view |
| `authenticated_admin_update_content_queue` | UPDATE | Admin in `admin_users` table + active | Only authorized admins can modify |
| `service_role_bypass_content_queue` | All | `auth.role() = 'service_role'` | Backend operations bypass RLS |

**Phase 3 SQL (Hardened):**
```sql
ALTER TABLE content_queue ENABLE ROW LEVEL SECURITY;

-- SELECT: Restrict to authenticated admins only
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

-- UPDATE: Restrict to authenticated admins only
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

-- Service role bypass for backend operations
CREATE POLICY "service_role_bypass_content_queue" ON content_queue
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
```

**Why Phase 3 Hardening:** Moves from loose "any authenticated user" to strict "admin_users table" verification, ensuring only activated administrators can access sensitive content.

### 2.3 Audit Logs Table Policies (Phase 3 Hardening)

**Table:** `audit_logs`

| Policy | Operation | Condition | Effect |
|--------|-----------|-----------|--------|
| `authenticated_admin_select_audit_logs` | SELECT | Admin in `admin_users` table + active | Only authorized admins can view audit trail |
| `service_role_insert_audit_logs` | INSERT | Service role only | Application logs actions automatically |
| `service_role_bypass_audit_logs` | All | `auth.role() = 'service_role'` | Backend operations bypass RLS |

**Phase 3 SQL (Hardened & Immutable):**
```sql
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- SELECT: Restrict to authenticated admins only
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

-- INSERT: Service role only (automatic logging)
CREATE POLICY "service_role_insert_audit_logs" ON audit_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Immutability: Audit logs cannot be modified after creation
CREATE POLICY "audit_logs_immutable" ON audit_logs
  FOR UPDATE, DELETE
  USING (false);

-- Service role bypass for administrative queries
CREATE POLICY "service_role_bypass_audit_logs" ON audit_logs
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
```

**Why Phase 3 Hardening:** Combines admin verification with immutability guarantees, ensuring audit logs cannot be tampered with and only verified admins can review them.

### 2.5 Applying Phase 3 RLS Policies

Execute the SQL in `sql/rls-policies.sql` to enable hardened access control:

**Via Supabase Dashboard:**
1. Navigate to **SQL Editor** in Supabase Console
2. Create a new query
3. Copy contents of `sql/rls-policies.sql`
4. Run all statements

**Verification:**
```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('content_queue', 'audit_logs');

-- List all policies
SELECT schemaname, tablename, policyname, permissive
FROM pg_policies
WHERE tablename IN ('content_queue', 'audit_logs');
```

### 2.6 Testing RLS Policies

**Test with Authenticated Admin:**
```typescript
// This should SUCCEED if user is in admin_users and is_active = true
const { data, error } = await supabase
  .from('content_queue')
  .select('*');

if (!error) {
  console.log('✅ RLS allows admin access:', data);
} else {
  console.error('❌ RLS denied admin access:', error.message);
}
```

**Test with Non-Admin User:**
```typescript
// This should FAIL with RLS error
const { error } = await supabase
  .from('content_queue')
  .select('*');

if (error?.code === 'PGRST116') {
  console.log('✅ RLS correctly denies non-admin access');
}
```

**Test Immutability:**
```typescript
// This should always FAIL even with service role
const { error } = await supabase
  .from('audit_logs')
  .update({ action: 'Modified' })
  .eq('id', 'some-id');

if (error?.code === 'PGRST116') {
  console.log('✅ Audit logs correctly immutable');
}
```

### 2.4 Middleware Authentication

All `/admin/*` routes (except `/admin/debug`) require authenticated sessions:

**File:** `middleware.ts`

```typescript
if (req.nextUrl.pathname.startsWith('/admin')) {
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
}
```

---

## 3.5 Server-Side Pagination API Routes (Phase 3)

### Content Management API

**Endpoint:** `GET /api/admin/content`

**Purpose:** Provides server-side paginated access to content_queue data with full filtering and sorting capabilities.

**Query Parameters:**
- `page` (number, default: 0) - Page number, 0-indexed
- `limit` (number, default: 25, max: 100) - Items per page
- `sortBy` (string, default: 'created_at') - Column to sort by
- `sortOrder` ('asc' | 'desc', default: 'desc') - Sort direction

**Request Example:**
```bash
GET /api/admin/content?page=0&limit=25&sortBy=created_at&sortOrder=desc
```

**Response Structure:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Content Title",
      "status": "PENDING",
      "created_at": "2026-06-04T10:30:00Z",
      "updated_at": "2026-06-04T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 0,
    "limit": 25,
    "total": 150,
    "totalPages": 6,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "sortBy": "created_at",
    "sortOrder": "desc",
    "timestamp": "2026-06-04T10:30:00Z"
  }
}
```

**Security:** RLS enforced at database level - only authenticated admins in `admin_users` table can access.

### Audit Logs API

**Endpoint:** `GET /api/admin/audit-logs`

**Purpose:** Provides server-side paginated access to audit_logs for compliance and debugging.

**Query Parameters:**
- `page` (number, default: 0) - Page number, 0-indexed
- `limit` (number, default: 50, max: 100) - Items per page
- `sortOrder` ('asc' | 'desc', default: 'desc') - Sort by created_at

**Request Example:**
```bash
GET /api/admin/audit-logs?page=0&limit=50&sortOrder=desc
```

**Response Structure:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "admin-uuid",
      "action": "Content approved",
      "target_table": "content_queue",
      "target_id": "item-uuid",
      "created_at": "2026-06-04T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 0,
    "limit": 50,
    "total": 500,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2026-06-04T10:30:00Z"
  }
}
```

**Security:** RLS enforced - only authenticated admins can SELECT audit logs.

---

## 3. Admin Modules

### 3.1 Moderation Dashboard

**Route:** `/admin/moderation`

**Purpose:** Review and approve/reject user-uploaded content before publication.

**Data Source:** `content_queue` table

**Key Features:**
- ✅ Filter PENDING items
- ✅ Individual approve/reject actions
- ✅ Bulk approve/reject operations
- ✅ Per-item loading states
- ✅ Automatic audit trail creation

**Flow:**
1. Container fetches PENDING items
2. User clicks Approve/Reject
3. `processQueueItem()` updates status + creates audit log
4. Presentational component re-renders without item

**Audit Logging:**
```typescript
await supabase.from('audit_logs').insert({
  user_id: reviewer,
  action: `Content ${status === 'APPROVED' ? 'approved' : 'rejected'}`,
  target_table: 'content_queue',
  target_id: item.id,
});
```

### 3.2 Content Management (CMS)

**Route:** `/admin/content`

**Purpose:** View and manage all content items (properties, projects, etc.)

**Data Source:** `properties` table

**Key Features:**
- ✅ Server-side pagination (25 items per page)
- ✅ Sorted by creation date (newest first)
- ✅ Table view with metadata
- ✅ Edit action placeholders for future expansion
- ✅ Total count display

**Pagination Implementation:**
```typescript
const start = page * ITEMS_PER_PAGE;
const end = start + ITEMS_PER_PAGE - 1;

const { data } = await supabase
  .from('properties')
  .select('*')
  .order('created_at', { ascending: false })
  .range(start, end); // Server-side pagination
```

**Benefits:**
- Only loads 25 items at a time (not all 10,000+)
- Reduced memory footprint
- Faster page load times
- Scales with dataset size

---

## 4. Component Library

### 4.1 ActionButton

**File:** `components/admin/ui/ActionButton.tsx`

Reusable button component for admin actions.

**Props:**
```typescript
interface ActionButtonProps {
  onClick: () => void;
  label: string;
  variant: 'primary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}
```

**Usage:**
```tsx
<ActionButton
  onClick={() => handleApprove(item.id)}
  label="Approve"
  variant="primary"
  loading={isProcessing}
/>
```

### 4.2 StatusBadge

**File:** `components/admin/ui/StatusBadge.tsx`

Color-coded status indicator.

**Props:**
```typescript
interface StatusBadgeProps {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}
```

**Usage:**
```tsx
<StatusBadge status={item.status} />
```

---

## 5. Audit Logging System

### 5.1 Purpose

The audit system creates an immutable log of all administrative actions for compliance and troubleshooting.

### 5.2 Audit Log Schema

**Table:** `audit_logs`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique identifier |
| `user_id` | UUID | Admin who performed action |
| `action` | TEXT | Action description (e.g., "Content approved") |
| `target_table` | TEXT | Table affected (e.g., "content_queue") |
| `target_id` | TEXT | ID of affected record |
| `created_at` | TIMESTAMP | When action occurred |

### 5.3 Audit Log Flow

```
User Action → Container Logic → Database Update → Audit Insert → Immutable Record
```

**Key Points:**
- Audit logging is **non-blocking** (won't fail the main operation)
- Logs are **immutable** (RLS prevents updates/deletes)
- All admin actions are **logged automatically**

---

## 6. Adding New Admin Modules

### 6.1 Checklist

When creating a new admin module, follow this checklist:

- [ ] **Create container component** at `app/admin/[module]/page.tsx`
- [ ] **Create presentational component** at `app/admin/[module]/[ModuleName]View.tsx`
- [ ] **Add TypeScript interface** to `types/database.types.ts`
- [ ] **Import from centralized types** (never duplicate)
- [ ] **Use direct Supabase client** (`import { supabase } from '@/supabaseClient'`)
- [ ] **Implement error handling** with console logging
- [ ] **Add loading states** with spinners/skeletons
- [ ] **Document in README_ADMIN.md**
- [ ] **Test RLS policies** in development
- [ ] **Add audit logging** for critical actions

### 6.2 Template: Creating a New Module

**Step 1: Define Type**

```typescript
// types/database.types.ts
export interface MyNewItem {
  id: string;
  name: string;
  status: string;
  created_at: string;
}
```

**Step 2: Create Container**

```typescript
// app/admin/mynew/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/supabaseClient';
import { MyNewItem } from '@/types/database.types';
import MyNewView from './MyNewView';

export default function MyNewContainer() {
  const [items, setItems] = useState<MyNewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('my_table')
        .select('*');
      
      if (error) console.error(error);
      setItems(data || []);
      setLoading(false);
    }
    load();
  }, []);

  return <MyNewView items={items} loading={loading} />;
}
```

**Step 3: Create Presentational**

```typescript
// app/admin/mynew/MyNewView.tsx
import { MyNewItem } from '@/types/database.types';

interface MyNewViewProps {
  items: MyNewItem[];
  loading: boolean;
}

export default function MyNewView({ items, loading }: MyNewViewProps) {
  if (loading) return <div>Loading...</div>;
  
  return (
    <main>
      <h1>My New Module</h1>
      {items.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </main>
  );
}
```

**Step 4: Protect Route**

Middleware automatically protects all `/admin/*` routes. No additional setup needed.

**Step 5: Document**

Add section to this README describing the new module.

---

## 7. Performance Optimization

### 7.1 Pagination Strategy

All admin modules that display lists should implement server-side pagination:

```typescript
const ITEMS_PER_PAGE = 25;
const { data } = await supabase
  .from('table')
  .select('*')
  .range(start, end);
```

**Why:** Prevents loading thousands of records into memory.

### 7.2 Indexing

All audit/content tables have indexes on frequently queried columns:

```sql
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_content_queue_status ON content_queue(status);
```

### 7.3 Console Logging

Use structured logging for debugging:

```typescript
console.log('[ModuleName] Operation description', { context: data });
console.error('[ModuleName] Error occurred', { error });
```

**Pattern:** `[ModuleName]` prefix makes logs filterable in browser DevTools.

---

## 8. Security Best Practices

### 8.1 Authentication

- ✅ All `/admin` routes require authenticated session
- ✅ Middleware redirects unauthenticated users to `/auth/login`
- ✅ No sensitive data in local storage

### 8.2 Authorization

- ✅ RLS policies enforce database-level access control
- ✅ Only authenticated users can SELECT/UPDATE
- ✅ Service role only can DELETE (backend operations)

### 8.3 Audit Trail

- ✅ All state changes logged to `audit_logs`
- ✅ Logs are immutable (prevent tampering)
- ✅ User ID tracked for each action

### 8.4 Error Handling

- ✅ Never expose raw database errors to UI
- ✅ Log errors to console with context
- ✅ Show user-friendly error messages

---

## 9. Troubleshooting

### Issue: `/admin/moderation` shows "No pending content"

**Diagnosis:**
1. Check Supabase Table Editor → `content_queue` → Any items with `status = 'PENDING'`?
2. Check browser console → Are there any fetch errors?
3. Check RLS policies → Is `Admins can select content queue` enabled?

**Solution:**
1. Insert test item with `status = 'PENDING'`
2. Verify RLS policy is active
3. Check middleware redirects

### Issue: Audit logs not being created

**Diagnosis:**
1. Check Supabase Table Editor → `audit_logs` → Any rows?
2. Check browser console → `[Moderation] Audit log created` message?

**Solution:**
1. Verify `audit_logs` table exists
2. Check RLS policy allows INSERT for service role
3. Verify user_id is being captured correctly

### Issue: `/admin/content` shows pagination errors

**Diagnosis:**
1. Check browser console for range errors
2. Verify `properties` table has data
3. Check total count calculation

**Solution:**
1. Ensure `totalCount` > 0 before showing pagination
2. Verify `.range(start, end)` uses correct values
3. Test with multiple pages of data

---

## 10. Phase 3: Database Hardening & Production Deployment

### 10.1 Pre-Deployment Checklist

Before deploying Phase 3 hardening to production:

- [ ] **RLS Policies**: Execute `sql/rls-policies.sql` in Supabase SQL Editor
- [ ] **Admin Users Table**: Populate `admin_users` with authorized administrators
- [ ] **Verify admin_users Schema**: Ensure columns exist: `user_id`, `is_active`
- [ ] **Test RLS Policies**: Verify authenticated and service role access works
- [ ] **API Routes**: Deploy new pagination APIs (`/api/admin/content`, `/api/admin/audit-logs`)
- [ ] **Pagination Integration**: Update client components to use new APIs if desired
- [ ] **Rate Limiting**: Verify middleware protects admin endpoints
- [ ] **Audit Logging**: Test that all admin actions create audit trail entries
- [ ] **Documentation**: Update any internal wikis/runbooks with RLS policy details
- [ ] **Monitoring**: Set up alerts for unusual admin activity
- [ ] **Rollback Plan**: Document how to disable RLS if emergency occurs
- [ ] **Code Committed**: All changes committed with clear commit messages

### 10.2 Deployment Steps

**Step 1: Backup Database**
```bash
# Create backup in Supabase Dashboard
# Settings → Backups → Create backup
```

**Step 2: Apply RLS Policies**
```sql
-- Execute entire contents of sql/rls-policies.sql
-- Start with ALTER TABLE...ENABLE ROW LEVEL SECURITY
-- Then create each policy one at a time
```

**Step 3: Test Access Control**
- Log in as admin user
- Navigate to `/admin/content`, `/admin/moderation`
- Verify data loads correctly
- Check browser console for errors

**Step 4: Test Non-Admin Access**
- Create test non-admin user
- Try to access `/admin/*` routes
- Verify middleware redirects to login

**Step 5: Monitor Logs**
```bash
# Check Supabase logs for RLS violations
# Supabase Dashboard → Logs → PostgreSQL Logs
```

### 10.3 Production Monitoring

After deployment, monitor these metrics:

| Metric | Alert Threshold | Action |
|--------|-----------------|--------|
| RLS Violations | >5 per minute | Page oncall, review user access |
| Admin API Latency | >1000ms | Check database performance, review query plans |
| Failed Admin Logins | >10 per hour | Potential security incident |
| Audit Log Growth | >10K per day | Normal, but monitor for anomalies |

---

## 11. Deployment Checklist

Before deploying admin changes to production:

- [ ] All RLS policies executed in Supabase
- [ ] Types added to `types/database.types.ts`
- [ ] Container/Presentational pattern followed
- [ ] Error handling implemented
- [ ] Console logging added
- [ ] Tested in development
- [ ] Audit logging verified
- [ ] Documentation updated
- [ ] No hardcoded secrets or IDs
- [ ] Code committed with clear message

---

## 12. Support & Questions

For issues or questions about the admin dashboard:

1. Check this README
2. Review browser console logs (filter by `[ModuleName]`)
3. Check Supabase dashboard → SQL Editor for RLS policies
4. Verify authentication status in Supabase Auth section
5. For Phase 3 RLS issues: Check `sql/rls-policies.sql` was fully applied

---

**Version:** 2.0 (Phase 3: Database Hardening & Pagination)  
**Last Updated:** 2026-06-04  
**Maintainer:** Wana Glamping Dev Team
