-- RLS and Storage policies for media and moderation
-- Run this in Supabase SQL editor AFTER creating the tables and the bucket

-- NOTE: These policies assume you have a `properties` table with `id` and `owner_id`,
-- and a `profiles` table with `id` and a boolean `is_admin` column. Adjust as necessary.

-- 1) Ensure admin flag exists (optional helper)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- 2) Function helper to test admin
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean LANGUAGE sql STABLE AS $$
  SELECT coalesce((SELECT is_admin FROM public.profiles WHERE id = uid), false);
$$;

-- 3) Enable RLS on properties_media
ALTER TABLE public.properties_media ENABLE ROW LEVEL SECURITY;

-- Allow INSERT only if the current user owns the referenced property
CREATE POLICY "properties_media_insert_if_property_owner" ON public.properties_media
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = properties_media.property_id
        AND p.owner_id = auth.uid()
    )
  );

-- Allow SELECT only for approved media or the uploader or admins
CREATE POLICY "properties_media_select_approved_or_owner_or_admin" ON public.properties_media
  FOR SELECT
  USING (
    status = 'approved'
    OR uploaded_by = auth.uid()
    OR public.is_admin(auth.uid())
  );

-- Allow UPDATE for the uploader or admins
CREATE POLICY "properties_media_modify_owner_or_admin_update" ON public.properties_media
  FOR UPDATE
  USING (
    uploaded_by = auth.uid() OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    uploaded_by = auth.uid() OR public.is_admin(auth.uid())
  );

-- Allow DELETE for the uploader or admins
CREATE POLICY "properties_media_modify_owner_or_admin_delete" ON public.properties_media
  FOR DELETE
  USING (
    uploaded_by = auth.uid() OR public.is_admin(auth.uid())
  );

-- 4) Enable RLS on content_queue
ALTER TABLE public.content_queue ENABLE ROW LEVEL SECURITY;

-- Allow INSERT into content_queue if the user owns the property
CREATE POLICY "content_queue_insert_if_property_owner" ON public.content_queue
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = content_queue.property_id
        AND p.owner_id = auth.uid()
    )
  );

-- Allow SELECT for admins and property owners (so owners can see their own pending content)
CREATE POLICY "content_queue_select_admins_and_owners" ON public.content_queue
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = content_queue.property_id
        AND p.owner_id = auth.uid()
    )
    OR public.is_admin(auth.uid())
  );

-- Allow UPDATE for admins (to change status) or assigned reviewer
CREATE POLICY "content_queue_update_admin_or_reviewer" ON public.content_queue
  FOR UPDATE
  USING (
    public.is_admin(auth.uid()) OR reviewer_id = auth.uid()
  )
  WITH CHECK (
    public.is_admin(auth.uid()) OR reviewer_id = auth.uid()
  );

-- 5) error_logs: keep inserts available to service role (service role bypasses RLS)
-- Optionally enable RLS and only allow inserts from authenticated service or logging roles
-- We'll enable RLS and allow inserts from any authenticated user (service role can bypass)
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "error_logs_insert_any_authenticated" ON public.error_logs
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 6) Storage: restrict access to bucket 'properties_media'
-- Add RLS on storage.objects and limit access based on metadata and bucket
-- WARNING: modifying storage.objects impacts the Supabase storage layer; test carefully.

-- Enable RLS on storage.objects (protected table for all buckets)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow inserts to properties_media if the metadata contains the uploader's id
CREATE POLICY "storage_objects_insert_properties_media_owner" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'properties_media' AND (metadata ->> 'owner') = auth.uid()
  );

-- Allow SELECT on properties_media objects only if metadata.status = 'approved' OR owner = auth.uid() OR admin
CREATE POLICY "storage_objects_select_properties_media_public_or_owner_or_admin" ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'properties_media' AND (
      (metadata ->> 'status') = 'approved'
      OR (metadata ->> 'owner') = auth.uid()
      OR public.is_admin(auth.uid())
    )
  );

-- Allow UPDATE by owner or admin
CREATE POLICY "storage_objects_modify_properties_media_owner_or_admin_update" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'properties_media' AND (
      (metadata ->> 'owner') = auth.uid() OR public.is_admin(auth.uid())
    )
  )
  WITH CHECK (
    bucket_id = 'properties_media' AND (
      (metadata ->> 'owner') = auth.uid() OR public.is_admin(auth.uid())
    )
  );

-- Allow DELETE by owner or admin
CREATE POLICY "storage_objects_modify_properties_media_owner_or_admin_delete" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'properties_media' AND (
      (metadata ->> 'owner') = auth.uid() OR public.is_admin(auth.uid())
    )
  );

-- End of policies
