-- Migration: 20260812000004_admin_storage_and_short_description.sql
-- 1. ADD SHORT_DESCRIPTION COLUMN TO PRODUCTS TABLE
ALTER TABLE products ADD COLUMN IF NOT EXISTS short_description TEXT NOT NULL DEFAULT '';

-- 2. CREATE PRODUCT-IMAGES STORAGE BUCKET
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 3. STORAGE RLS POLICIES FOR PRODUCT-IMAGES
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and owners can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and owners can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins and owners can delete product images" ON storage.objects;

CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins and owners can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND is_admin_or_owner());

CREATE POLICY "Admins and owners can update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND is_admin_or_owner());

CREATE POLICY "Admins and owners can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND is_admin_or_owner());
