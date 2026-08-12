-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. CATEGORIES POLICIES
CREATE POLICY "Public can read categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  USING (is_admin());

-- 2. PRODUCTS POLICIES
CREATE POLICY "Public can read published products"
  ON products FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  USING (is_admin());

-- 3. PRODUCT VARIANTS POLICIES
CREATE POLICY "Public can read variants of published products"
  ON product_variants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_variants.product_id
        AND products.status = 'published'
    )
  );

CREATE POLICY "Admins can manage product variants"
  ON product_variants FOR ALL
  USING (is_admin());

-- 4. PRODUCT IMAGES POLICIES
CREATE POLICY "Public can read images of published products"
  ON product_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM products
      WHERE products.id = product_images.product_id
        AND products.status = 'published'
    )
  );

CREATE POLICY "Admins can manage product images"
  ON product_images FOR ALL
  USING (is_admin());

-- 5. BUSINESS SETTINGS POLICIES
CREATE POLICY "Public can read business settings"
  ON business_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage business settings"
  ON business_settings FOR ALL
  USING (is_admin());

-- 6. PROFILES POLICIES
CREATE POLICY "Users can read own profile or admins can read all"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR is_admin());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can manage all profiles"
  ON profiles FOR ALL
  USING (is_admin());
