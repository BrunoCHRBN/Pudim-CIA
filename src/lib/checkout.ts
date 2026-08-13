import { CartItem, Product, BusinessSettings, DeliveryMethod, CheckoutData } from '@/types/domain';

export function getItemUnitPrice(item: CartItem, products: Product[]): number {
  const prod = products.find((p) => p.id === item.productId);
  const variant = prod?.variants.find((v) => v.id === item.variantId);
  if (prod) {
    return prod.priceCents + (variant ? variant.priceAdjustmentCents : 0);
  }
  return item.cachedUnitPriceCents ?? item.priceCents ?? 0;
}

export function calculateCheckoutSubtotal(cart: CartItem[], products: Product[]): number {
  return cart.reduce((sum, item) => sum + getItemUnitPrice(item, products) * item.quantity, 0);
}

export function calculateCheckoutTotal(
  cart: CartItem[],
  products: Product[],
  deliveryMethod: DeliveryMethod,
  settings?: BusinessSettings
): number {
  const subtotal = calculateCheckoutSubtotal(cart, products);
  const deliveryFee = deliveryMethod === 'entrega' ? settings?.deliveryFeeCents ?? 0 : 0;
  return subtotal + deliveryFee;
}

export interface CheckoutValidationResult {
  isValid: boolean;
  errors: {
    clientName?: string;
    deliveryAddress?: string;
  };
}

export function validateCheckoutData(data: CheckoutData): CheckoutValidationResult {
  const errors: { clientName?: string; deliveryAddress?: string } = {};

  if (!data.clientName || !data.clientName.trim()) {
    errors.clientName = 'Por favor, informe seu nome.';
  }

  if (data.deliveryMethod === 'entrega' && (!data.deliveryAddress || !data.deliveryAddress.trim())) {
    errors.deliveryAddress = 'Por favor, informe o endereço de entrega.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
