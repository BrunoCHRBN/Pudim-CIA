import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateSlug,
  fetchAdminStats,
  fetchAdminProducts,
  fetchAdminProductById,
  createAdminProduct,
  updateAdminProduct,
  duplicateAdminProduct,
  updateProductStatus,
  fetchAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  fetchAdminSettings,
  updateAdminSettings,
} from '../src/lib/admin';

describe('Admin Area Logic Tests', () => {
  it('should format slugs correctly with generateSlug', () => {
    expect(generateSlug('Pudim de Leite Ninho!')).toBe('pudim-de-leite-ninho');
    expect(generateSlug('  Caixa Gourmet com 6 Trufas   ')).toBe('caixa-gourmet-com-6-trufas');
    expect(generateSlug('Açaí Especial')).toBe('acai-especial');
  });

  it('should fetch admin stats', async () => {
    const stats = await fetchAdminStats();
    expect(stats).toHaveProperty('publishedProducts');
    expect(stats).toHaveProperty('draftProducts');
    expect(stats).toHaveProperty('archivedProducts');
    expect(stats).toHaveProperty('totalCategories');
    expect(typeof stats.publishedProducts).toBe('number');
  });

  it('should create a new product', async () => {
    const res = await createAdminProduct({
      name: 'Pudim de Nutella Especial',
      slug: 'pudim-nutella-especial',
      shortDescription: 'Cremoso e irresistível',
      description: 'Pudim artesanal com Nutella pura.',
      priceCents: 2200,
      categoryId: '11111111-1111-1111-1111-111111111111',
      status: 'published',
      isFeatured: true,
      imageUrl: '/assets/pudim_classico.png',
      variants: [
        { name: 'Tamanho Família (1kg)', priceAdjustmentCents: 1500, isAvailable: true },
      ],
    });

    expect(res.success).toBe(true);
    expect(res.data).toBeDefined();
    expect(res.data?.name).toBe('Pudim de Nutella Especial');
    expect(res.data?.priceCents).toBe(2200);
    expect(res.data?.variants.length).toBe(1);
    expect(res.data?.shortDescription).toBe('Cremoso e irresistível');
  });

  it('should fetch products and filter by status', async () => {
    const allProducts = await fetchAdminProducts('all');
    expect(allProducts.length).toBeGreaterThan(0);

    const publishedProducts = await fetchAdminProducts('published');
    expect(publishedProducts.every((p) => p.status === 'published')).toBe(true);
  });

  it('should duplicate a product and set duplicate status to draft', async () => {
    const products = await fetchAdminProducts('all');
    expect(products.length).toBeGreaterThan(0);
    const firstId = products[0]!.id;

    const dupRes = await duplicateAdminProduct(firstId);
    expect(dupRes.success).toBe(true);
    const dupProd = dupRes.data || dupRes.newProduct;
    expect(dupProd).toBeDefined();
    expect(dupProd?.status).toBe('draft');
    expect(dupProd?.name).toContain('(Cópia)');
  });

  it('should update product status', async () => {
    const products = await fetchAdminProducts('all');
    expect(products.length).toBeGreaterThan(0);
    const targetId = products[0]!.id;

    const updateRes = await updateProductStatus(targetId, 'archived');
    expect(updateRes.success).toBe(true);

    const updatedProd = await fetchAdminProductById(targetId);
    expect(updatedProd?.status).toBe('archived');
  });

  it('should create and update category', async () => {
    const createRes = await createAdminCategory({
      name: 'Tortas & Bolos',
      displayOrder: 5,
      active: true,
    });
    expect(createRes.success).toBe(true);
    expect(createRes.data?.slug).toBe('tortas-bolos');

    if (createRes.data) {
      const updateRes = await updateAdminCategory(createRes.data.id, {
        active: false,
      });
      expect(updateRes.success).toBe(true);
    }
  });

  it('should fetch and update business settings', async () => {
    const initialSettings = await fetchAdminSettings();
    expect(initialSettings).toHaveProperty('storeName');

    const updateRes = await updateAdminSettings({
      minOrderCents: 2500,
      isAcceptingOrders: false,
    });
    expect(updateRes.success).toBe(true);

    const updatedSettings = await fetchAdminSettings();
    expect(updatedSettings.minOrderCents).toBe(2500);
    expect(updatedSettings.isAcceptingOrders).toBe(false);
  });
});
