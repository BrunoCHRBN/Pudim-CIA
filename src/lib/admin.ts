import { createClient } from './supabase/client';
import { Product, Category, BusinessSettings, ProductStatus } from '@/types/domain';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, DEFAULT_BUSINESS_SETTINGS } from '@/mocks/products';

// In-memory fallback state for dev environment when Supabase is unconfigured
let localProductsState: Product[] = [...MOCK_PRODUCTS];
let localCategoriesState: Category[] = [...MOCK_CATEGORIES];
let localSettingsState: BusinessSettings = { ...DEFAULT_BUSINESS_SETTINGS };

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return Boolean(url && !url.includes('placeholder.supabase.co'));
}

export interface AdminStats {
  publishedProducts: number;
  draftProducts: number;
  archivedProducts: number;
  totalCategories: number;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  if (!isSupabaseConfigured()) {
    return {
      publishedProducts: localProductsState.filter((p) => p.status === 'published').length,
      draftProducts: localProductsState.filter((p) => p.status === 'draft').length,
      archivedProducts: localProductsState.filter((p) => p.status === 'archived').length,
      totalCategories: localCategoriesState.length,
    };
  }

  try {
    const supabase = createClient();
    const [pubRes, draftRes, archRes, catRes] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
      supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'archived'),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
    ]);

    return {
      publishedProducts: pubRes.count || 0,
      draftProducts: draftRes.count || 0,
      archivedProducts: archRes.count || 0,
      totalCategories: catRes.count || 0,
    };
  } catch {
    return {
      publishedProducts: localProductsState.filter((p) => p.status === 'published').length,
      draftProducts: localProductsState.filter((p) => p.status === 'draft').length,
      archivedProducts: localProductsState.filter((p) => p.status === 'archived').length,
      totalCategories: localCategoriesState.length,
    };
  }
}

export async function fetchAdminProducts(statusFilter?: string, searchQuery?: string): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    let list = [...localProductsState];
    if (statusFilter && statusFilter !== 'all') {
      list = list.filter((p) => p.status === statusFilter);
    }
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
    }
    return list;
  }

  try {
    const supabase = createClient();
    let query = supabase.from('products').select(`
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
    `).order('display_order', { ascending: true });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (searchQuery && searchQuery.trim()) {
      query = query.ilike('name', `%${searchQuery.trim()}%`);
    }

    const { data, error } = await query;
    if (error || !data) return localProductsState;

    return data.map((p: any) => {
      const rawVariants: any[] = p.product_variants || [];
      const rawImages: any[] = p.product_images || [];

      return {
        id: p.id,
        categoryId: p.category_id,
        name: p.name,
        slug: p.slug,
        shortDescription: p.short_description || '',
        description: p.description || '',
        priceCents: p.price_cents ?? 0,
        status: p.status as ProductStatus,
        isFeatured: p.is_featured ?? false,
        displayOrder: p.display_order ?? 0,
        images: rawImages.map((img) => ({
          id: img.id,
          productId: img.product_id,
          url: img.url,
          alt: img.alt || p.name,
          displayOrder: img.display_order ?? 0,
          isPrimary: img.is_primary ?? false,
        })),
        variants: rawVariants.map((v) => ({
          id: v.id,
          productId: v.product_id,
          name: v.name,
          sku: v.sku || undefined,
          priceAdjustmentCents: v.price_adjustment_cents ?? 0,
          isAvailable: v.is_available ?? true,
          displayOrder: v.display_order ?? 0,
        })),
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      };
    });
  } catch {
    return localProductsState;
  }
}

export async function fetchAdminProductById(id: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    return localProductsState.find((p) => p.id === id) || null;
  }

  try {
    const supabase = createClient();
    const { data: p, error } = await supabase
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
      .eq('id', id)
      .single();

    if (error || !p) return localProductsState.find((prod) => prod.id === id) || null;

    const rawVariants: any[] = p.product_variants || [];
    const rawImages: any[] = p.product_images || [];

    return {
      id: p.id,
      categoryId: p.category_id,
      name: p.name,
      slug: p.slug,
      shortDescription: p.short_description || '',
      description: p.description || '',
      priceCents: p.price_cents ?? 0,
      status: p.status as ProductStatus,
      isFeatured: p.is_featured ?? false,
      displayOrder: p.display_order ?? 0,
      images: rawImages.map((img) => ({
        id: img.id,
        productId: img.product_id,
        url: img.url,
        alt: img.alt || p.name,
        displayOrder: img.display_order ?? 0,
        isPrimary: img.is_primary ?? false,
      })),
      variants: rawVariants.map((v) => ({
        id: v.id,
        productId: v.product_id,
        name: v.name,
        sku: v.sku || undefined,
        priceAdjustmentCents: v.price_adjustment_cents ?? 0,
        isAvailable: v.is_available ?? true,
        displayOrder: v.display_order ?? 0,
      })),
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    };
  } catch {
    return localProductsState.find((p) => p.id === id) || null;
  }
}

export interface SaveProductPayload {
  name: string;
  slug?: string;
  shortDescription?: string;
  description: string;
  priceCents: number;
  categoryId: string;
  status: ProductStatus;
  isFeatured: boolean;
  imageUrl?: string;
  variants?: { name: string; sku?: string; priceAdjustmentCents: number; isAvailable: boolean }[];
}

export async function createAdminProduct(payload: SaveProductPayload): Promise<{ success: boolean; data?: Product; error?: string }> {
  const finalSlug = payload.slug?.trim() ? generateSlug(payload.slug) : generateSlug(payload.name);

  if (!isSupabaseConfigured()) {
    const newId = `prod-${Date.now()}`;
    const newProduct: Product = {
      id: newId,
      name: payload.name,
      slug: finalSlug,
      shortDescription: payload.shortDescription || '',
      description: payload.description,
      priceCents: payload.priceCents,
      categoryId: payload.categoryId,
      status: payload.status,
      isFeatured: payload.isFeatured,
      displayOrder: localProductsState.length + 1,
      images: payload.imageUrl
        ? [{ id: `img-${Date.now()}`, productId: newId, url: payload.imageUrl, alt: payload.name, displayOrder: 1, isPrimary: true }]
        : [],
      variants: (payload.variants || []).map((v, idx) => ({
        id: `var-${Date.now()}-${idx}`,
        productId: newId,
        name: v.name,
        sku: v.sku,
        priceAdjustmentCents: v.priceAdjustmentCents,
        isAvailable: v.isAvailable,
        displayOrder: idx + 1,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localProductsState = [newProduct, ...localProductsState];
    return { success: true, data: newProduct };
  }

  try {
    const supabase = createClient();
    const { data: prodData, error: prodError } = await supabase
      .from('products')
      .insert({
        name: payload.name,
        slug: finalSlug,
        short_description: payload.shortDescription || '',
        description: payload.description,
        price_cents: payload.priceCents,
        category_id: payload.categoryId,
        status: payload.status,
        is_featured: payload.isFeatured,
      })
      .select()
      .single();

    if (prodError || !prodData) {
      return { success: false, error: prodError?.message || 'Erro ao criar produto' };
    }

    const productId = prodData.id;

    if (payload.imageUrl) {
      await supabase.from('product_images').insert({
        product_id: productId,
        url: payload.imageUrl,
        alt: payload.name,
        display_order: 1,
        is_primary: true,
      });
    }

    if (payload.variants && payload.variants.length > 0) {
      await supabase.from('product_variants').insert(
        payload.variants.map((v, idx) => ({
          product_id: productId,
          name: v.name,
          sku: v.sku || null,
          price_adjustment_cents: v.priceAdjustmentCents,
          is_available: v.isAvailable,
          display_order: idx + 1,
        }))
      );
    }

    const createdProd = await fetchAdminProductById(productId);
    return { success: true, data: createdProd || undefined };
  } catch (err: any) {
    return { success: false, error: err.message || 'Falha ao salvar no banco de dados' };
  }
}

export async function updateAdminProduct(id: string, payload: Partial<SaveProductPayload>): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    const idx = localProductsState.findIndex((p) => p.id === id);
    if (idx === -1) return { success: false, error: 'Produto não encontrado' };

    const current = localProductsState[idx];
    if (!current) return { success: false, error: 'Produto não encontrado' };

    const updatedSlug = payload.slug !== undefined ? generateSlug(payload.slug) : current.slug;
    const updatedImages = payload.imageUrl
      ? [{ id: `img-${Date.now()}`, productId: id, url: payload.imageUrl, alt: payload.name || current.name, displayOrder: 1, isPrimary: true }]
      : current.images;
    const updatedVariants = payload.variants
      ? payload.variants.map((v, vIdx) => ({
          id: `var-${Date.now()}-${vIdx}`,
          productId: id,
          name: v.name,
          sku: v.sku,
          priceAdjustmentCents: v.priceAdjustmentCents,
          isAvailable: v.isAvailable,
          displayOrder: vIdx + 1,
        }))
      : current.variants;

    localProductsState[idx] = {
      ...current,
      name: payload.name !== undefined ? payload.name : current.name,
      slug: updatedSlug,
      shortDescription: payload.shortDescription !== undefined ? payload.shortDescription : current.shortDescription,
      description: payload.description !== undefined ? payload.description : current.description,
      priceCents: payload.priceCents !== undefined ? payload.priceCents : current.priceCents,
      categoryId: payload.categoryId !== undefined ? payload.categoryId : current.categoryId,
      status: payload.status !== undefined ? payload.status : current.status,
      isFeatured: payload.isFeatured !== undefined ? payload.isFeatured : current.isFeatured,
      images: updatedImages,
      variants: updatedVariants,
      updatedAt: new Date().toISOString(),
    };
    return { success: true };
  }

  try {
    const supabase = createClient();
    const updateFields: any = {};
    if (payload.name !== undefined) updateFields.name = payload.name;
    if (payload.slug !== undefined) updateFields.slug = generateSlug(payload.slug);
    if (payload.shortDescription !== undefined) updateFields.short_description = payload.shortDescription;
    if (payload.description !== undefined) updateFields.description = payload.description;
    if (payload.priceCents !== undefined) updateFields.price_cents = payload.priceCents;
    if (payload.categoryId !== undefined) updateFields.category_id = payload.categoryId;
    if (payload.status !== undefined) updateFields.status = payload.status;
    if (payload.isFeatured !== undefined) updateFields.is_featured = payload.isFeatured;

    if (Object.keys(updateFields).length > 0) {
      const { error } = await supabase.from('products').update(updateFields).eq('id', id);
      if (error) return { success: false, error: error.message };
    }

    if (payload.imageUrl) {
      await supabase.from('product_images').delete().eq('product_id', id);
      await supabase.from('product_images').insert({
        product_id: id,
        url: payload.imageUrl,
        alt: payload.name || 'Imagem do produto',
        display_order: 1,
        is_primary: true,
      });
    }

    if (payload.variants) {
      await supabase.from('product_variants').delete().eq('product_id', id);
      if (payload.variants.length > 0) {
        await supabase.from('product_variants').insert(
          payload.variants.map((v, idx) => ({
            product_id: id,
            name: v.name,
            sku: v.sku || null,
            price_adjustment_cents: v.priceAdjustmentCents,
            is_available: v.isAvailable,
            display_order: idx + 1,
          }))
        );
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erro ao atualizar produto' };
  }
}

export async function duplicateAdminProduct(id: string): Promise<{ success: boolean; data?: Product; newProduct?: Product; error?: string }> {
  const original = await fetchAdminProductById(id);
  if (!original) return { success: false, error: 'Produto original não encontrado' };

  const duplicatePayload: SaveProductPayload = {
    name: `${original.name} (Cópia)`,
    slug: `${original.slug}-copia-${Date.now().toString().slice(-4)}`,
    shortDescription: original.shortDescription,
    description: original.description,
    priceCents: original.priceCents,
    categoryId: original.categoryId,
    status: 'draft', // duplicated product starts as draft
    isFeatured: false,
    imageUrl: original.images[0]?.url,
    variants: original.variants.map((v) => ({
      name: v.name,
      sku: v.sku ? `${v.sku}-COPY` : undefined,
      priceAdjustmentCents: v.priceAdjustmentCents,
      isAvailable: v.isAvailable,
    })),
  };

  const res = await createAdminProduct(duplicatePayload);
  return {
    success: res.success,
    data: res.data,
    newProduct: res.data,
    error: res.error,
  };
}

export async function updateProductStatus(id: string, status: ProductStatus): Promise<{ success: boolean; error?: string }> {
  return updateAdminProduct(id, { status });
}

export async function uploadProductImage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  if (!isSupabaseConfigured()) {
    // Return object URL or placeholder for dev/testing when Supabase is unconfigured
    const mockUrl = URL.createObjectURL(file);
    return { success: true, url: mockUrl };
  }

  try {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(filePath);

    return { success: true, url: publicUrlData.publicUrl };
  } catch (err: any) {
    return { success: false, error: err.message || 'Falha ao fazer upload da imagem' };
  }
}

// CATEGORIES MANAGEMENT
export async function fetchAdminCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    return localCategoriesState;
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('categories').select('*').order('display_order', { ascending: true });
    if (error || !data) return localCategoriesState;

    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      displayOrder: c.display_order ?? 0,
      active: c.active ?? true,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));
  } catch {
    return localCategoriesState;
  }
}

export async function createAdminCategory(payload: { name: string; slug?: string; displayOrder?: number; active?: boolean }): Promise<{ success: boolean; data?: Category; error?: string }> {
  const finalSlug = payload.slug?.trim() ? generateSlug(payload.slug) : generateSlug(payload.name);

  if (!isSupabaseConfigured()) {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: payload.name,
      slug: finalSlug,
      displayOrder: payload.displayOrder ?? localCategoriesState.length + 1,
      active: payload.active ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    localCategoriesState = [...localCategoriesState, newCat];
    return { success: true, data: newCat };
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: payload.name,
        slug: finalSlug,
        display_order: payload.displayOrder ?? 0,
        active: payload.active ?? true,
      })
      .select()
      .single();

    if (error || !data) return { success: false, error: error?.message || 'Erro ao criar categoria' };

    const cat: Category = {
      id: data.id,
      name: data.name,
      slug: data.slug,
      displayOrder: data.display_order,
      active: data.active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
    return { success: true, data: cat };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erro ao criar categoria' };
  }
}

export async function updateAdminCategory(id: string, payload: Partial<Category>): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    const idx = localCategoriesState.findIndex((c) => c.id === id);
    if (idx === -1) return { success: false, error: 'Categoria não encontrada' };

    const current = localCategoriesState[idx];
    if (!current) return { success: false, error: 'Categoria não encontrada' };

    localCategoriesState[idx] = {
      ...current,
      ...payload,
      slug: payload.slug ? generateSlug(payload.slug) : current.slug,
      updatedAt: new Date().toISOString(),
    };
    return { success: true };
  }

  try {
    const supabase = createClient();
    const updateData: any = {};
    if (payload.name !== undefined) updateData.name = payload.name;
    if (payload.slug !== undefined) updateData.slug = generateSlug(payload.slug);
    if (payload.displayOrder !== undefined) updateData.display_order = payload.displayOrder;
    if (payload.active !== undefined) updateData.active = payload.active;

    const { error } = await supabase.from('categories').update(updateData).eq('id', id);
    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erro ao atualizar categoria' };
  }
}

// STORE BUSINESS SETTINGS
export async function fetchAdminSettings(): Promise<BusinessSettings> {
  if (!isSupabaseConfigured()) {
    return localSettingsState;
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase.from('business_settings').select('*').limit(1).maybeSingle();
    if (error || !data) return localSettingsState;

    return {
      id: data.id,
      storeName: data.store_name || 'Pudim & CIA',
      whatsappPhone: data.whatsapp_phone || '5516991359739',
      pixKey: data.pix_key || 'suachave@email.com',
      pixBeneficiary: data.pix_beneficiary || 'Pudim e Cia',
      pixCity: data.pix_city || 'Araraquara',
      minOrderCents: data.min_order_cents ?? 0,
      isAcceptingOrders: data.is_accepting_orders ?? true,
      deliveryFeeCents: data.delivery_fee_cents ?? 0,
      updatedAt: data.updated_at,
    };
  } catch {
    return localSettingsState;
  }
}

export async function updateAdminSettings(settings: Partial<BusinessSettings>): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    localSettingsState = {
      ...localSettingsState,
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    return { success: true };
  }

  try {
    const supabase = createClient();
    const updateData: any = {};
    if (settings.storeName !== undefined) updateData.store_name = settings.storeName;
    if (settings.whatsappPhone !== undefined) updateData.whatsapp_phone = settings.whatsappPhone;
    if (settings.pixKey !== undefined) updateData.pix_key = settings.pixKey;
    if (settings.pixBeneficiary !== undefined) updateData.pix_beneficiary = settings.pixBeneficiary;
    if (settings.pixCity !== undefined) updateData.pix_city = settings.pixCity;
    if (settings.minOrderCents !== undefined) updateData.min_order_cents = settings.minOrderCents;
    if (settings.isAcceptingOrders !== undefined) updateData.is_accepting_orders = settings.isAcceptingOrders;
    if (settings.deliveryFeeCents !== undefined) updateData.delivery_fee_cents = settings.deliveryFeeCents;

    const currentSettings = await fetchAdminSettings();
    const { error } = await supabase
      .from('business_settings')
      .update(updateData)
      .eq('id', currentSettings.id);

    if (error) return { success: false, error: error.message };

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Erro ao atualizar configurações' };
  }
}
