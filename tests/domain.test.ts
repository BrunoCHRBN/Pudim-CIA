import { describe, it, expect } from 'vitest';
import { Product, CartItem } from '@/types/domain';
import { formatCentsToBRL } from '@/lib/formatters';
import { MOCK_PRODUCTS } from '@/mocks/products';

describe('Domain Model & Cent Operations', () => {
  it('formats cents to BRL string accurately without floating-point errors', () => {
    expect(formatCentsToBRL(1700)).toBe('R$ 17,00');
    expect(formatCentsToBRL(500)).toBe('R$ 5,00');
    expect(formatCentsToBRL(650)).toBe('R$ 6,50');
    expect(formatCentsToBRL(0)).toBe('R$ 0,00');
  });

  it('filters published products correctly from draft and archived statuses', () => {
    const published = MOCK_PRODUCTS.filter((p) => p.status === 'published');
    const draftOrArchived = MOCK_PRODUCTS.filter((p) => p.status !== 'published');

    expect(published).toHaveLength(3);
    expect(draftOrArchived).toHaveLength(1);
    expect(draftOrArchived[0]?.id).toBe('prod_pudim_rascunho_teste');
  });

  it('computes unit price with variant price adjustments in cents', () => {
    const mockProductWithAdjustment: Product = {
      id: 'prod_test',
      categoryId: 'cat_test',
      name: 'Pudim Especial',
      slug: 'pudim-especial',
      description: 'Teste',
      priceCents: 2000, // R$ 20,00
      status: 'published',
      isFeatured: false,
      displayOrder: 1,
      images: [],
      variants: [
        {
          id: 'var_premium',
          productId: 'prod_test',
          name: 'Tamanho Família (+ R$ 5,00)',
          priceAdjustmentCents: 500, // +R$ 5,00
          isAvailable: true,
          displayOrder: 1,
        },
      ],
      createdAt: '2026-08-12T00:00:00.000Z',
      updatedAt: '2026-08-12T00:00:00.000Z',
    };

    const variant = mockProductWithAdjustment.variants[0];
    const finalPriceCents = mockProductWithAdjustment.priceCents + (variant?.priceAdjustmentCents || 0);

    expect(finalPriceCents).toBe(2500);
    expect(formatCentsToBRL(finalPriceCents)).toBe('R$ 25,00');
  });

  it('calculates total cart price in cents based strictly on IDs', () => {
    const cart: CartItem[] = [
      {
        id: 'cart_1',
        productId: 'prod_pudim_classico',
        variantId: 'var_pudim_tradicional',
        priceCents: 1700,
        quantity: 2,
      },
      {
        id: 'cart_2',
        productId: 'prod_cones_trufados',
        variantId: 'var_cone_ninho_nutella',
        priceCents: 500,
        quantity: 3,
      },
    ];

    const totalCents = cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
    expect(totalCents).toBe(4900); // 3400 + 1500 = 4900 centavos
    expect(formatCentsToBRL(totalCents)).toBe('R$ 49,00');
  });
});
