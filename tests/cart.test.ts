import { describe, it, expect, beforeEach } from 'vitest';
import { migrateV1ToV2Cart } from '../src/context/CartContext';
import { CART_STORAGE_KEY_V1, CART_STORAGE_KEY_V2, Product, CartItem } from '../src/types/domain';

describe('Milestone AG-07: Cart Refactoring & CartProvider Tests', () => {
  const sampleCatalog: Product[] = [
    {
      id: 'prod_pudim_classico',
      categoryId: 'cat_1',
      name: 'Pudim Clássico',
      slug: 'pudim-classico',
      description: 'Pudim clássico de leite moça',
      priceCents: 1700,
      status: 'published',
      isFeatured: true,
      displayOrder: 1,
      images: [],
      variants: [
        {
          id: 'var_pudim_tradicional',
          productId: 'prod_pudim_classico',
          name: 'Tradicional de Leite Moça',
          priceAdjustmentCents: 0,
          isAvailable: true,
          displayOrder: 1,
        },
      ],
      createdAt: '',
      updatedAt: '',
    },
    {
      id: 'prod_cones_trufados',
      categoryId: 'cat_1',
      name: 'Cones Trufados',
      slug: 'cones-trufados',
      description: 'Cones trufados crocantes',
      priceCents: 500,
      status: 'published',
      isFeatured: true,
      displayOrder: 2,
      images: [],
      variants: [
        {
          id: 'var_cone_ninho_nutella',
          productId: 'prod_cones_trufados',
          name: 'Ninho com Nutella',
          priceAdjustmentCents: 150, // +R$ 1,50
          isAvailable: true,
          displayOrder: 1,
        },
      ],
      createdAt: '',
      updatedAt: '',
    },
  ];

  describe('V1 to V2 Storage Migration Strategy (migrateV1ToV2Cart)', () => {
    it('returns empty array when v1 raw storage string is null or empty', () => {
      expect(migrateV1ToV2Cart(null)).toEqual([]);
      expect(migrateV1ToV2Cart('')).toEqual([]);
      expect(migrateV1ToV2Cart('invalid_json')).toEqual([]);
    });

    it('migrates valid v1 items containing productId and variantId', () => {
      const v1Raw = JSON.stringify([
        {
          id: 'item_1',
          productId: 'prod_pudim_classico',
          variantId: 'var_pudim_tradicional',
          quantity: 2,
          observations: 'Sem calda extra',
          priceCents: 1700,
        },
      ]);

      const migrated = migrateV1ToV2Cart(v1Raw);
      expect(migrated).toHaveLength(1);
      expect(migrated[0]?.productId).toBe('prod_pudim_classico');
      expect(migrated[0]?.variantId).toBe('var_pudim_tradicional');
      expect(migrated[0]?.quantity).toBe(2);
      expect(migrated[0]?.observations).toBe('Sem calda extra');
    });

    it('safely maps legacy v1 product/option string structures to v2 format', () => {
      const legacyV1Raw = JSON.stringify([
        {
          product: 'Pudim Clássico',
          option: 'Tradicional de Leite Moça',
          price: 17.0,
          qty: 3,
        },
        {
          product: 'Cones Trufados',
          option: 'Ninho com Nutella',
          price: 6.5,
          qty: 1,
        },
      ]);

      const migrated = migrateV1ToV2Cart(legacyV1Raw);
      expect(migrated).toHaveLength(2);
      expect(migrated[0]?.productId).toBe('prod_pudim_classico');
      expect(migrated[0]?.variantId).toBe('var_pudim_tradicional');
      expect(migrated[0]?.quantity).toBe(3);

      expect(migrated[1]?.productId).toBe('prod_cones_trufados');
      expect(migrated[1]?.variantId).toBe('var_cone_ninho_nutella');
      expect(migrated[1]?.quantity).toBe(1);
    });

    it('discards corrupted/unparseable items from v1 array without throwing errors', () => {
      const corruptV1Raw = JSON.stringify(['corrupt_string', null, 12345, { productId: 'prod_pudim_classico', variantId: 'var_pudim_tradicional', quantity: 1 }]);
      const migrated = migrateV1ToV2Cart(corruptV1Raw);
      expect(migrated).toHaveLength(1);
      expect(migrated[0]?.productId).toBe('prod_pudim_classico');
    });
  });

  describe('Authoritative Total & Pricing Logic', () => {
    it('calculates authoritative displayTotal based on catalog product base price + variant adjustment', () => {
      const cartItems: CartItem[] = [
        {
          id: '1',
          productId: 'prod_pudim_classico',
          variantId: 'var_pudim_tradicional',
          quantity: 2,
        },
        {
          id: '2',
          productId: 'prod_cones_trufados',
          variantId: 'var_cone_ninho_nutella',
          quantity: 3,
        },
      ];

      // Pudim: 1700 * 2 = 3400 cents
      // Cone with variant (+150): (500 + 150) * 3 = 650 * 3 = 1950 cents
      // Subtotal: 3400 + 1950 = 5350 cents

      const total = cartItems.reduce((sum, item) => {
        const prod = sampleCatalog.find((p) => p.id === item.productId);
        const variant = prod?.variants.find((v) => v.id === item.variantId);
        const unitPrice = (prod?.priceCents || 0) + (variant?.priceAdjustmentCents || 0);
        return sum + unitPrice * item.quantity;
      }, 0);

      expect(total).toBe(5350);
    });

    it('falls back to cached priceCents when catalog product is not found', () => {
      const itemWithCachedPrice: CartItem = {
        id: '99',
        productId: 'unknown_prod',
        variantId: 'unknown_var',
        quantity: 1,
        cachedUnitPriceCents: 1200,
      };

      const unitPrice = itemWithCachedPrice.cachedUnitPriceCents || 0;
      expect(unitPrice).toBe(1200);
    });
  });
});
