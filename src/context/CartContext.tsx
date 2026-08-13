'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { CartItem, Product, CART_STORAGE_KEY_V1, CART_STORAGE_KEY_V2 } from '@/types/domain';

export interface AddItemInput {
  productId: string;
  variantId: string;
  quantity: number;
  observations?: string;
  priceCents?: number;
  cachedProductName?: string;
  cachedVariantName?: string;
  cachedUnitPriceCents?: number;
  cachedImageUrl?: string;
}

export interface CartContextType {
  items: CartItem[];
  cartCount: number;
  displayTotal: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (input: AddItemInput, catalogProducts?: Product[]) => void;
  removeItem: (id: string) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  clear: () => void;
  getAuthoritativePriceCents: (item: CartItem, catalogProducts?: Product[]) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function migrateV1ToV2Cart(v1Raw: string | null): CartItem[] {
  if (!v1Raw) return [];
  try {
    const parsed = JSON.parse(v1Raw);
    if (!Array.isArray(parsed)) return [];

    const migrated: CartItem[] = [];

    for (const item of parsed) {
      if (typeof item !== 'object' || item === null) continue;

      if (item.productId && item.variantId) {
        migrated.push({
          id: item.id || `${item.productId}-${item.variantId}-${Math.random().toString(36).slice(2, 7)}`,
          productId: String(item.productId),
          variantId: String(item.variantId),
          quantity: Math.min(10, Math.max(1, Number(item.quantity) || 1)),
          observations: item.observations ? String(item.observations) : undefined,
          priceCents: typeof item.priceCents === 'number' ? item.priceCents : undefined,
        });
        continue;
      }

      const legacyProduct = String(item.product || item.name || '');
      const legacyOption = String(item.option || item.variant || '');

      let productId = 'prod_pudim_classico';
      let variantId = 'var_pudim_tradicional';

      if (legacyProduct.includes('Cone')) {
        productId = 'prod_cones_trufados';
        variantId = 'var_cone_tradicional';
        if (legacyOption.includes('Ninho')) variantId = 'var_cone_ninho_nutella';
        if (legacyOption.includes('Misto')) variantId = 'var_cone_misto';
      } else if (legacyProduct.includes('Trufa')) {
        productId = 'prod_caixa_trufas';
        variantId = 'var_trufa_sortido';
        if (legacyOption.includes('Leite')) variantId = 'var_trufa_ao_leite';
        if (legacyOption.includes('Amargo')) variantId = 'var_trufa_meio_amargo';
        if (legacyOption.includes('Sensação')) variantId = 'var_trufa_sensacao';
        if (legacyOption.includes('Maracujá')) variantId = 'var_trufa_maracuja';
      }

      migrated.push({
        id: item.id || `${productId}-${variantId}-${Math.random().toString(36).slice(2, 7)}`,
        productId,
        variantId,
        quantity: Math.min(10, Math.max(1, Number(item.qty || item.quantity) || 1)),
        observations: item.observations ? String(item.observations) : undefined,
        priceCents:
          typeof item.price === 'number'
            ? Math.round(item.price * 100)
            : typeof item.priceCents === 'number'
            ? item.priceCents
            : undefined,
      });
    }

    return migrated;
  } catch {
    return [];
  }
}

export function CartProvider({
  children,
  catalogProducts = [],
}: {
  children: React.ReactNode;
  catalogProducts?: Product[];
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Client-side initialization & migration
  useEffect(() => {
    try {
      const v2Raw = localStorage.getItem(CART_STORAGE_KEY_V2);
      if (v2Raw) {
        const parsed = JSON.parse(v2Raw);
        if (Array.isArray(parsed)) {
          setItems(parsed);
          setIsInitialized(true);
          return;
        }
      }

      // Check v1 fallback migration
      const v1Raw = localStorage.getItem(CART_STORAGE_KEY_V1);
      if (v1Raw) {
        const migrated = migrateV1ToV2Cart(v1Raw);
        setItems(migrated);
        localStorage.setItem(CART_STORAGE_KEY_V2, JSON.stringify(migrated));
        localStorage.removeItem(CART_STORAGE_KEY_V1);
      }
    } catch {
      setItems([]);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save to localStorage v2 on change
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY_V2, JSON.stringify(items));
    } catch {
      // Ignore storage write errors
    }
  }, [items, isInitialized]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const getAuthoritativePriceCents = useCallback(
    (item: CartItem, passedCatalog?: Product[]): number => {
      const catalog = passedCatalog && passedCatalog.length > 0 ? passedCatalog : catalogProducts;
      const product = catalog.find((p) => p.id === item.productId);
      if (product) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        const adjustment = variant ? variant.priceAdjustmentCents : 0;
        return product.priceCents + adjustment;
      }
      // Non-authoritative cached fallback
      return item.cachedUnitPriceCents ?? item.priceCents ?? 0;
    },
    [catalogProducts]
  );

  const addItem = useCallback(
    (input: AddItemInput, passedCatalog?: Product[]) => {
      const catalog = passedCatalog && passedCatalog.length > 0 ? passedCatalog : catalogProducts;
      const product = catalog.find((p) => p.id === input.productId);
      const variant = product?.variants.find((v) => v.id === input.variantId);

      const resolvedUnitPrice =
        (product?.priceCents || 0) + (variant?.priceAdjustmentCents || 0) ||
        input.cachedUnitPriceCents ||
        input.priceCents ||
        0;

      setItems((prevItems) => {
        const existingIndex = prevItems.findIndex(
          (item) =>
            item.productId === input.productId &&
            item.variantId === input.variantId &&
            (item.observations || '') === (input.observations || '')
        );

        if (existingIndex > -1) {
          const updated = [...prevItems];
          const existing = updated[existingIndex];
          if (existing) {
            updated[existingIndex] = {
              ...existing,
              quantity: Math.min(10, existing.quantity + input.quantity),
              priceCents: resolvedUnitPrice,
              cachedUnitPriceCents: resolvedUnitPrice,
            };
          }
          return updated;
        }

        const newItem: CartItem = {
          id: `${input.productId}-${input.variantId}-${Math.random().toString(36).slice(2, 7)}`,
          productId: input.productId,
          variantId: input.variantId,
          quantity: Math.min(10, Math.max(1, input.quantity)),
          observations: input.observations?.trim() || undefined,
          priceCents: resolvedUnitPrice,
          cachedProductName: product?.name || input.cachedProductName,
          cachedVariantName: variant?.name || input.cachedVariantName,
          cachedUnitPriceCents: resolvedUnitPrice,
          cachedImageUrl: product?.images.find((img) => img.isPrimary)?.url || input.cachedImageUrl,
        };

        return [...prevItems, newItem];
      });

      setIsOpen(true);
    },
    [catalogProducts]
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const increment = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: Math.min(10, item.quantity + 1) } : item))
    );
  }, []);

  const decrement = useCallback((id: string) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity - 1;
            if (nextQty < 1) return null;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  }, []);

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const cartCount = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  }, [items]);

  const displayTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const price = getAuthoritativePriceCents(item);
      return sum + price * item.quantity;
    }, 0);
  }, [items, getAuthoritativePriceCents]);

  const value = useMemo(
    () => ({
      items,
      cartCount,
      displayTotal,
      isOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      increment,
      decrement,
      clear,
      getAuthoritativePriceCents,
    }),
    [
      items,
      cartCount,
      displayTotal,
      isOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      increment,
      decrement,
      clear,
    ]
  );

  return React.createElement(CartContext.Provider, { value }, children);
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
