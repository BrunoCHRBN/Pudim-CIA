export type ProductStatus = 'draft' | 'published' | 'archived';
export type UserRole = 'owner' | 'admin' | 'customer';

export interface Profile {
  id: string;
  fullName: string | null;
  role: UserRole;
  active: boolean;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt: string;
  displayOrder: number;
  isPrimary: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku?: string;
  priceAdjustmentCents: number; // e.g. 0, +200 (+R$ 2,00), -100 (-R$ 1,00)
  isAvailable: boolean;
  displayOrder: number;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  shortDescription?: string;
  description: string;
  priceCents: number; // e.g. 1700 = R$ 17,00
  status: ProductStatus;
  isFeatured: boolean;
  displayOrder: number;
  images: ProductImage[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string; // Unique cart item ID
  productId: string; // Base product ID
  variantId: string; // Selected variant ID
  quantity: number; // 1..10
  observations?: string;
  priceCents?: number; // Cached price per unit in cents (non-authoritative)
  cachedProductName?: string;
  cachedVariantName?: string;
  cachedUnitPriceCents?: number;
  cachedImageUrl?: string;
}

export interface BusinessSettings {
  id: string;
  storeName: string;
  whatsappPhone: string;
  pixKey: string;
  pixBeneficiary: string;
  pixCity: string;
  minOrderCents: number;
  isAcceptingOrders: boolean;
  deliveryFeeCents: number;
  updatedAt: string;
}

export type DeliveryMethod = 'entrega' | 'retirada';
export type PaymentMethod = 'pix' | 'cartao' | 'dinheiro';

export interface CheckoutData {
  clientName: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  paymentMethod: PaymentMethod;
  changeAmount?: string;
}

/** @deprecated V1 key — kept for migration reference only. No longer read by any production code. */
export const CART_STORAGE_KEY_V1 = 'pudimecia_cart_v1';
export const CART_STORAGE_KEY_V2 = 'pudimecia_cart_v2';
export const CART_STORAGE_KEY = CART_STORAGE_KEY_V2;
export const NAME_STORAGE_KEY = 'pudimecia_client_name';
