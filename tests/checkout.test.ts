import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  calculateCheckoutSubtotal,
  calculateCheckoutTotal,
  validateCheckoutData,
} from '../src/lib/checkout';
import { buildWhatsAppOrderMessage, buildWhatsAppUrl } from '../src/lib/whatsapp';
import { Product, BusinessSettings, CartItem, CheckoutData } from '../src/types/domain';

describe('Milestone AG-08: Checkout Refactoring & Modularization', () => {
  const sampleSettings: BusinessSettings = {
    id: 'b_1',
    storeName: 'Pudim & CIA Testes',
    whatsappPhone: '5516999998888',
    pixKey: 'pix-teste@email.com',
    pixBeneficiary: 'Doceria Pudim e Cia',
    pixCity: 'Araraquara',
    minOrderCents: 0,
    isAcceptingOrders: true,
    deliveryFeeCents: 500, // R$ 5,00
    updatedAt: new Date().toISOString(),
  };

  const sampleProducts: Product[] = [
    {
      id: 'prod_pudim_classico',
      categoryId: 'cat_1',
      name: 'Pudim Clássico',
      slug: 'pudim-classico',
      description: 'Pudim delicioso de leite condensado',
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
  ];

  const sampleCart: CartItem[] = [
    {
      id: 'item_1',
      productId: 'prod_pudim_classico',
      variantId: 'var_pudim_tradicional',
      quantity: 2,
    },
  ];

  describe('Checkout Calculations & Validation (lib/checkout.ts)', () => {
    it('calculates subtotal correctly from cart items and products', () => {
      const subtotal = calculateCheckoutSubtotal(sampleCart, sampleProducts);
      expect(subtotal).toBe(3400); // 1700 * 2 = 3400 cents (R$ 34,00)
    });

    it('adds delivery fee to total when deliveryMethod is entrega', () => {
      const totalEntrega = calculateCheckoutTotal(
        sampleCart,
        sampleProducts,
        'entrega',
        sampleSettings
      );
      expect(totalEntrega).toBe(3900); // 3400 + 500 = 3900 cents (R$ 39,00)
    });

    it('does not add delivery fee when deliveryMethod is retirada', () => {
      const totalRetirada = calculateCheckoutTotal(
        sampleCart,
        sampleProducts,
        'retirada',
        sampleSettings
      );
      expect(totalRetirada).toBe(3400);
    });

    it('fails validation when client name is missing', () => {
      const invalidData: CheckoutData = {
        clientName: '  ',
        deliveryMethod: 'retirada',
        paymentMethod: 'pix',
      };
      const res = validateCheckoutData(invalidData);
      expect(res.isValid).toBe(false);
      expect(res.errors.clientName).toBeDefined();
    });

    it('fails validation when delivery method is entrega and address is missing', () => {
      const invalidData: CheckoutData = {
        clientName: 'Maria Silva',
        deliveryMethod: 'entrega',
        deliveryAddress: '',
        paymentMethod: 'pix',
      };
      const res = validateCheckoutData(invalidData);
      expect(res.isValid).toBe(false);
      expect(res.errors.deliveryAddress).toBeDefined();
    });

    it('passes validation when pickup is selected without address', () => {
      const validData: CheckoutData = {
        clientName: 'Maria Silva',
        deliveryMethod: 'retirada',
        paymentMethod: 'cartao',
      };
      const res = validateCheckoutData(validData);
      expect(res.isValid).toBe(true);
      expect(res.errors.clientName).toBeUndefined();
      expect(res.errors.deliveryAddress).toBeUndefined();
    });
  });

  describe('WhatsApp Message Formatting (lib/whatsapp.ts)', () => {
    it('builds WhatsApp order message dynamically using business settings', () => {
      const checkoutData: CheckoutData = {
        clientName: 'João Santos',
        deliveryMethod: 'entrega',
        deliveryAddress: 'Rua Voluntários da Pátria, 1000',
        paymentMethod: 'pix',
      };

      const msg = buildWhatsAppOrderMessage({
        cart: sampleCart,
        products: sampleProducts,
        checkoutData,
        settings: sampleSettings,
      });

      expect(msg).toContain('Olá, Pudim & CIA Testes!');
      expect(msg).toContain('João Santos');
      expect(msg).toContain('Pudim Clássico');
      expect(msg).toContain('Rua Voluntários da Pátria, 1000');
      expect(msg).toContain('CÓDIGO PIX COPIA E COLA');
      expect(msg).toContain('pix-teste@email.com');
    });

    it('builds valid WhatsApp URL with cleaned phone number', () => {
      const url = buildWhatsAppUrl('(16) 99999-8888', 'Olá teste');
      expect(url).toBe('https://api.whatsapp.com/send?phone=16999998888&text=Ol%C3%A1%20teste');
    });
  });

  describe('Zero Hardcoded Business Information in Checkout UI', () => {
    it('verifies that CheckoutModal.tsx contains no hardcoded phone numbers or Pix keys', () => {
      const checkoutModalPath = path.join(process.cwd(), 'src', 'components', 'CheckoutModal.tsx');
      const content = fs.readFileSync(checkoutModalPath, 'utf8');

      // Verify no hardcoded phone string
      expect(content).not.toContain('5516991359739');
      // Verify no hardcoded email key string
      expect(content).not.toContain('suachave@email.com');
    });
  });
});
