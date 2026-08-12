-- SEED DATA FOR PUDIM & CIA

-- 1. BUSINESS SETTINGS SEED
INSERT INTO business_settings (
  id,
  store_name,
  whatsapp_phone,
  pix_key,
  pix_beneficiary,
  pix_city,
  min_order_cents,
  is_accepting_orders,
  delivery_fee_cents
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Pudim & CIA',
  '5516991359739',
  'suachave@email.com',
  'Pudim e Cia',
  'Araraquara',
  0,
  TRUE,
  0
) ON CONFLICT (id) DO UPDATE SET
  store_name = EXCLUDED.store_name,
  whatsapp_phone = EXCLUDED.whatsapp_phone,
  pix_key = EXCLUDED.pix_key,
  pix_beneficiary = EXCLUDED.pix_beneficiary,
  pix_city = EXCLUDED.pix_city;

-- 2. CATEGORY SEED
INSERT INTO categories (
  id,
  name,
  slug,
  display_order
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Especialidades',
  'especialidades',
  1
) ON CONFLICT (slug) DO NOTHING;

-- 3. PRODUCTS SEED
-- 3.1 Pudim Clássico
INSERT INTO products (
  id,
  category_id,
  name,
  slug,
  description,
  price_cents,
  status,
  is_featured,
  display_order
) VALUES (
  '22222222-2222-2222-2222-222222222221',
  '11111111-1111-1111-1111-111111111111',
  'Pudim Clássico',
  'pudim-classico',
  'Textura ultra aveludada, calda de caramelo brilhante e o sabor inconfundível do verdadeiro leite condensado.',
  1700,
  'published',
  TRUE,
  1
) ON CONFLICT (slug) DO NOTHING;

-- 3.2 Cones Trufados
INSERT INTO products (
  id,
  category_id,
  name,
  slug,
  description,
  price_cents,
  status,
  is_featured,
  display_order
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Cones Trufados',
  'cones-trufados',
  'Cones de wafer crocantes recheados com ganache artesanal cremosa nos sabores Tradicional, Ninho e Nutella.',
  500,
  'published',
  TRUE,
  2
) ON CONFLICT (slug) DO NOTHING;

-- 3.3 Caixa de Trufas Gourmet
INSERT INTO products (
  id,
  category_id,
  name,
  slug,
  description,
  price_cents,
  status,
  is_featured,
  display_order
) VALUES (
  '22222222-2222-2222-2222-222222222223',
  '11111111-1111-1111-1111-111111111111',
  'Caixa de Trufas Gourmet',
  'caixa-trufas-gourmet',
  'Seleção especial de 6 trufas artesanais com chocolate nobre e recheios cremosos — perfeita para presentear.',
  600,
  'published',
  TRUE,
  3
) ON CONFLICT (slug) DO NOTHING;

-- 4. VARIANTS SEED
-- Variants for Pudim Clássico
INSERT INTO product_variants (id, product_id, name, sku, price_adjustment_cents, is_available, display_order)
VALUES ('33333333-3333-3333-3333-333333333301', '22222222-2222-2222-2222-222222222221', 'Tradicional de Leite Moça', 'PUD-TRAD-001', 0, TRUE, 1)
ON CONFLICT (id) DO NOTHING;

-- Variants for Cones Trufados
INSERT INTO product_variants (id, product_id, name, sku, price_adjustment_cents, is_available, display_order) VALUES
  ('33333333-3333-3333-3333-333333333302', '22222222-2222-2222-2222-222222222222', 'Chocolate Tradicional', 'CONE-TRAD-001', 0, TRUE, 1),
  ('33333333-3333-3333-3333-333333333303', '22222222-2222-2222-2222-222222222222', 'Ninho com Nutella', 'CONE-NINH-002', 0, TRUE, 2),
  ('33333333-3333-3333-3333-333333333304', '22222222-2222-2222-2222-222222222222', 'Misto', 'CONE-MIST-003', 0, TRUE, 3)
ON CONFLICT (id) DO NOTHING;

-- Variants for Caixa de Trufas Gourmet
INSERT INTO product_variants (id, product_id, name, sku, price_adjustment_cents, is_available, display_order) VALUES
  ('33333333-3333-3333-3333-333333333305', '22222222-2222-2222-2222-222222222223', 'Ao Leite', 'TRUF-LEIT-001', 0, TRUE, 1),
  ('33333333-3333-3333-3333-333333333306', '22222222-2222-2222-2222-222222222223', 'Meio Amargo', 'TRUF-AMAR-002', 0, TRUE, 2),
  ('33333333-3333-3333-3333-333333333307', '22222222-2222-2222-2222-222222222223', 'Sensação', 'TRUF-SENS-003', 0, TRUE, 3),
  ('33333333-3333-3333-3333-333333333308', '22222222-2222-2222-2222-222222222223', 'Maracujá', 'TRUF-MARA-004', 0, TRUE, 4),
  ('33333333-3333-3333-3333-333333333309', '22222222-2222-2222-2222-222222222223', 'Sortido', 'TRUF-SORT-005', 0, TRUE, 5)
ON CONFLICT (id) DO NOTHING;

-- 5. IMAGES SEED
INSERT INTO product_images (id, product_id, url, alt, display_order, is_primary) VALUES
  ('44444444-4444-4444-4444-444444444401', '22222222-2222-2222-2222-222222222221', '/assets/pudim_classico.png', 'Pudim Clássico de Leite Moça', 1, TRUE),
  ('44444444-4444-4444-4444-444444444402', '22222222-2222-2222-2222-222222222222', '/assets/cones_trufados.png', 'Cones Trufados Variados', 1, TRUE),
  ('44444444-4444-4444-4444-444444444403', '22222222-2222-2222-2222-222222222223', '/assets/caixa_trufas.png', 'Caixa de Trufas Gourmet', 1, TRUE)
ON CONFLICT (id) DO NOTHING;
