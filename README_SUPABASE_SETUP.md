# Supabase: Media & Moderation Setup (Glamping Waná)

This document lists the exact steps to apply the SQL migrations, create the storage bucket, and configure environment variables required by the application.

## 1) Run SQL migrations
Open Supabase Dashboard → SQL Editor and run the following files in order:

- `database/migrations/2026-06-01-create-media-and-content-queue.sql`
- `database/migrations/2026-06-01-rls-storage-policies.sql`

These create the `properties_media`, `content_queue`, and `error_logs` tables and add recommended RLS/storage policies.

## 2) Create Storage Bucket
In Supabase Dashboard → Storage → Create a new bucket:

- Bucket ID: `properties_media`
- Public: No (recommended). Use signed URLs to serve approved media.

## 3) Service Role Key (Server uploads)
Set `SUPABASE_SERVICE_ROLE_KEY` in your deployment environment (Netlify / Vercel) — this key must remain secret.

Example on Netlify: set Environment Variable `SUPABASE_SERVICE_ROLE_KEY` to your Supabase Service Role key.

## 4) Upload Flow
Your frontend should send a `FormData` POST to `/api/upload` with fields:

- `file`: the file blob
- `propertyId`: property UUID (optional but recommended)

Server will:
- Validate file size and type (max 5MB for images)
- Upload to `properties_media` bucket
- Insert a row into `properties_media` with `uploaded_by` taken from the `properties.owner_id`
- Insert into `content_queue` with `status = 'pending'`

Example client call:

```js
const fd = new FormData();
fd.append('file', fileInput.files[0]);
fd.append('propertyId', propertyId);
const res = await fetch('/api/upload', { method: 'POST', body: fd });
const json = await res.json();
```

## 5) Approving media
When a moderator approves an item:

- Update `content_queue` record `status` to `approved` and set `updated_at = now()` and `reviewer_id`.
- Update the corresponding `properties_media` row `status = 'approved'`.

Serve media either via signed URLs or a public URL only after approval.

## 6) Optional: Google Vision
To enable the `analyze-image` endpoint:

1. Create a Google Cloud project and enable the Vision API.
2. Create a Service Account and download the JSON key.
3. Set `GOOGLE_APPLICATION_CREDENTIALS` in your deployment environment to the path of the JSON key (or set credentials via env vars).
4. Install dependency:

```bash
npm install @google-cloud/vision
```

## 7) Netlify deployment
If you deploy on Netlify, add these environment variables in your site settings:

- `NEXT_PUBLIC_SUPABASE_URL` → your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` → your Supabase service role key (server-only; never expose to clients)

Netlify build settings:

- Build command: `npm run build`
- Base directory: (root)
- Publish directory: `public`

Because this app uses Next.js API routes and server-side Supabase uploads, Netlify’s `@netlify/plugin-nextjs` is required. The repo already includes `@netlify/plugin-nextjs` and the `netlify.toml` config.

## 8) RLS Notes & Testing
- Test policies in a staging Supabase project first.
- If you need moderators with special access, set `profiles.is_admin = true` for those users.

---

If you want, I can:
- Update the client `add-property` flow to call `/api/upload` automatically (I can patch `app/host/add-property/page.tsx`).
- Generate SQL for creating a signing function or an admin dashboard for approvals.
