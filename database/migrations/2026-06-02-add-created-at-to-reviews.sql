-- Migration: Add created_at to reviews table to avoid build-time ordering errors
-- Run this in Supabase SQL editor or locally with psql against your DB

-- Only add the column if it does not already exist
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Optional: if you rely on an `is_visible` column and it's missing, add it manually
-- ALTER TABLE public.reviews
--   ADD COLUMN IF NOT EXISTS is_visible boolean DEFAULT true;

-- End of migration
