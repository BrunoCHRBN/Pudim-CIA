-- 1. ALTER PROFILES TABLE
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

-- Update role constraint on profiles to allow 'owner', 'admin', 'customer'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('owner', 'admin', 'customer'));

-- 2. ALTER CATEGORIES TABLE
ALTER TABLE categories ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

-- 3. HELPER FUNCTION TO CHECK ACTIVE ADMIN OR OWNER
CREATE OR REPLACE FUNCTION is_admin_or_owner()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN ('owner', 'admin')
      AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update is_admin() function to alias is_admin_or_owner() for backward compatibility
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN is_admin_or_owner();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. UPDATE RLS POLICIES FOR CATEGORIES
DROP POLICY IF EXISTS "Public can read categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Public can read active categories" ON categories;
DROP POLICY IF EXISTS "Admins and owners can manage categories" ON categories;

CREATE POLICY "Public can read active categories"
  ON categories FOR SELECT
  USING (active = true OR is_admin_or_owner());

CREATE POLICY "Admins and owners can manage categories"
  ON categories FOR ALL
  USING (is_admin_or_owner())
  WITH CHECK (is_admin_or_owner());

-- 5. UPDATE RLS POLICIES FOR PRODUCTS
DROP POLICY IF EXISTS "Public can read published products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Admins and owners can manage products" ON products;

CREATE POLICY "Public can read published products"
  ON products FOR SELECT
  USING (status = 'published' OR is_admin_or_owner());

CREATE POLICY "Admins and owners can manage products"
  ON products FOR ALL
  USING (is_admin_or_owner())
  WITH CHECK (is_admin_or_owner());

-- 6. UPDATE RLS POLICIES FOR PRODUCT VARIANTS
DROP POLICY IF EXISTS "Public can read variants of published products" ON product_variants;
DROP POLICY IF EXISTS "Admins can manage product variants" ON product_variants;
DROP POLICY IF EXISTS "Admins and owners can manage product variants" ON product_variants;

CREATE POLICY "Public can read variants of published products"
  ON product_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_variants.product_id
        AND (products.status = 'published' OR is_admin_or_owner())
    )
  );

CREATE POLICY "Admins and owners can manage product variants"
  ON product_variants FOR ALL
  USING (is_admin_or_owner())
  WITH CHECK (is_admin_or_owner());

-- 7. UPDATE RLS POLICIES FOR PRODUCT IMAGES
DROP POLICY IF EXISTS "Public can read images of published products" ON product_images;
DROP POLICY IF EXISTS "Admins can manage product images" ON product_images;
DROP POLICY IF EXISTS "Admins and owners can manage product images" ON product_images;

CREATE POLICY "Public can read images of published products"
  ON product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_images.product_id
        AND (products.status = 'published' OR is_admin_or_owner())
    )
  );

CREATE POLICY "Admins and owners can manage product images"
  ON product_images FOR ALL
  USING (is_admin_or_owner())
  WITH CHECK (is_admin_or_owner());

-- 8. UPDATE RLS POLICIES FOR BUSINESS SETTINGS
DROP POLICY IF EXISTS "Public can read business settings" ON business_settings;
DROP POLICY IF EXISTS "Admins can manage business settings" ON business_settings;
DROP POLICY IF EXISTS "Admins and owners can manage business settings" ON business_settings;

CREATE POLICY "Public can read business settings"
  ON business_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins and owners can manage business settings"
  ON business_settings FOR ALL
  USING (is_admin_or_owner())
  WITH CHECK (is_admin_or_owner());

-- 9. UPDATE RLS POLICIES FOR PROFILES
DROP POLICY IF EXISTS "Users can read own profile or admins can read all" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins and owners can manage all profiles" ON profiles;

CREATE POLICY "Users can read own profile or admins can read all"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR is_admin_or_owner());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins and owners can manage all profiles"
  ON profiles FOR ALL
  USING (is_admin_or_owner())
  WITH CHECK (is_admin_or_owner());
