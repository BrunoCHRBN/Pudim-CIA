import { createClient } from './supabase/client';
import { Product, Category, BusinessSettings, ProductVariant, ProductImage } from '@/types/domain';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, DEFAULT_BUSINESS_SETTINGS } from '@/mocks/products';

export interface CatalogData {
  products: Product[];
  categories: Category[];
  settings: BusinessSettings;
}

export async function fetchPublishedCatalog(): Promise<CatalogData> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';

  // If using placeholder URL or unconfigured environment, return default catalog
  if (!supabaseUrl || supabaseUrl.includes('placeholder.supabase.co')) {
    return {
      products: MOCK_PRODUCTS.filter((p) => p.status === 'published'),
      categories: MOCK_CATEGORIES.filter((c) => c.active),
      settings: DEFAULT_BUSINESS_SETTINGS,
    };
  }

  try {
    const supabase = createClient();

    // Create a timeout promise to prevent hanging on unreachable Supabase endpoints
    const queryPromise = Promise.all([
      supabase.from('categories').select('*').eq('active', true).order('display_order', { ascending: true }),
      supabase
        .from('products')
        .select(`
          id,
          category_id,
          name,
          slug,
          short_description,
          description,
          price_cents,
          status,
          is_featured,
          display_order,
          created_at,
          updated_at,
          product_variants (
            id,
            product_id,
            name,
            sku,
            price_adjustment_cents,
            is_available,
            display_order
          ),
          product_images (
            id,
            product_id,
            url,
            alt,
            display_order,
            is_primary
          )
        `)
        .eq('status', 'published')
        .order('display_order', { ascending: true }),
      supabase.from('business_settings').select('*').limit(1).maybeSingle(),
    ]);

    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500));

    const result = await Promise.race([queryPromise, timeoutPromise]);

    if (!result) {
      return {
        products: MOCK_PRODUCTS.filter((p) => p.status === 'published'),
        categories: MOCK_CATEGORIES.filter((c) => c.active),
        settings: DEFAULT_BUSINESS_SETTINGS,
      };
    }

    const [{ data: catData, error: catError }, { data: prodData, error: prodError }, { data: settingsData }] = result;

    if (catError || prodError || !prodData || prodData.length === 0) {
      return {
        products: MOCK_PRODUCTS.filter((p) => p.status === 'published'),
        categories: MOCK_CATEGORIES.filter((c) => c.active),
        settings: DEFAULT_BUSINESS_SETTINGS,
      };
    }

    const categories: Category[] = (catData && catData.length > 0 ? catData : MOCK_CATEGORIES).map((c: Record<string, any>) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      displayOrder: c.display_order ?? 0,
      active: c.active ?? true,
      createdAt: c.created_at || new Date().toISOString(),
      updatedAt: c.updated_at || new Date().toISOString(),
    }));

    const products: Product[] = prodData.map((p: Record<string, any>) => {
      const rawVariants: Record<string, any>[] = p.product_variants || [];
      const rawImages: Record<string, any>[] = p.product_images || [];

      const variants: ProductVariant[] = rawVariants
        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
        .map((v) => ({
          id: v.id,
          productId: v.product_id,
          name: v.name,
          sku: v.sku || undefined,
          priceAdjustmentCents: v.price_adjustment_cents ?? 0,
          isAvailable: v.is_available ?? true,
          displayOrder: v.display_order ?? 0,
        }));

      const images: ProductImage[] = rawImages
        .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
        .map((img) => ({
          id: img.id,
          productId: img.product_id,
          url: img.url,
          alt: img.alt || p.name,
          displayOrder: img.display_order ?? 0,
          isPrimary: img.is_primary ?? false,
        }));

      return {
        id: p.id,
        categoryId: p.category_id,
        name: p.name,
        slug: p.slug,
        shortDescription: p.short_description || '',
        description: p.description || '',
        priceCents: p.price_cents ?? 0,
        status: p.status,
        isFeatured: p.is_featured ?? false,
        displayOrder: p.display_order ?? 0,
        images,
        variants,
        createdAt: p.created_at || new Date().toISOString(),
        updatedAt: p.updated_at || new Date().toISOString(),
      };
    });

    const settings: BusinessSettings = settingsData
      ? {
          id: settingsData.id,
          storeName: settingsData.store_name || 'Pudim & CIA',
          whatsappPhone: settingsData.whatsapp_phone || '5516991359739',
          pixKey: settingsData.pix_key || 'suachave@email.com',
          pixBeneficiary: settingsData.pix_beneficiary || 'Pudim e Cia',
          pixCity: settingsData.pix_city || 'Araraquara',
          minOrderCents: settingsData.min_order_cents ?? 0,
          isAcceptingOrders: settingsData.is_accepting_orders ?? true,
          deliveryFeeCents: settingsData.delivery_fee_cents ?? 0,
          updatedAt: settingsData.updated_at || new Date().toISOString(),
        }
      : DEFAULT_BUSINESS_SETTINGS;

    return {
      products,
      categories,
      settings,
    };
  } catch {
    return {
      products: MOCK_PRODUCTS.filter((p) => p.status === 'published'),
      categories: MOCK_CATEGORIES.filter((c) => c.active),
      settings: DEFAULT_BUSINESS_SETTINGS,
    };
  }
}
