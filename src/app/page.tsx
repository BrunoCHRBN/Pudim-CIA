'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { EssenceCarousel } from '@/components/EssenceCarousel';
import { Pillars } from '@/components/Pillars';
import { ProductCatalog } from '@/components/ProductCatalog';
import { Footer } from '@/components/Footer';
import { FabWhatsApp } from '@/components/FabWhatsApp';
import { ItemModal } from '@/components/ItemModal';
import { CartDrawer } from '@/components/CartDrawer';
import { CheckoutModal } from '@/components/CheckoutModal';
import { CartItem, CART_STORAGE_KEY } from '@/types';

export default function HomePage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemModalProduct, setItemModalProduct] = useState('');
  const [itemModalPrice, setItemModalPrice] = useState(0);

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Load cart on client side
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setCart(parsed);
      }
    } catch {
      setCart([]);
    }
  }, []);

  // Save cart to localStorage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newCart));
    } catch {
      // Ignore storage errors
    }
  };

  const handleOpenItemModal = (productName: string, price: number) => {
    setItemModalProduct(productName);
    setItemModalPrice(price);
    setIsItemModalOpen(true);
  };

  const handleAddToCart = (newItem: Omit<CartItem, 'id'>) => {
    const existingIndex = cart.findIndex(
      (item) =>
        item.product === newItem.product &&
        item.option === newItem.option &&
        item.observations === newItem.observations
    );

    let updatedCart: CartItem[];
    if (existingIndex > -1) {
      updatedCart = [...cart];
      const existing = updatedCart[existingIndex];
      if (existing) {
        updatedCart[existingIndex] = {
          ...existing,
          qty: Math.min(10, existing.qty + newItem.qty),
        };
      }
    } else {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      updatedCart = [...cart, { ...newItem, id }];
    }

    saveCart(updatedCart);
    setIsCartDrawerOpen(true);
  };

  const handleUpdateQty = (id: string, delta: number) => {
    const updated = cart
      .map((item) => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          if (newQty < 1) return null;
          return { ...item, qty: Math.min(10, newQty) };
        }
        return item;
      })
      .filter((item): item is CartItem => item !== null);

    saveCart(updated);
  };

  const handleRemoveItem = (id: string) => {
    const updated = cart.filter((item) => item.id !== id);
    saveCart(updated);
  };

  const handleClearCart = () => {
    saveCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const isAnyOverlayOpen = isItemModalOpen || isCartDrawerOpen || isCheckoutModalOpen;

  // Manage body scroll lock
  useEffect(() => {
    if (isAnyOverlayOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }, [isAnyOverlayOpen]);

  return (
    <>
      <Navbar cartCount={cartCount} onOpenCart={() => setIsCartDrawerOpen(true)} />
      <main>
        <Hero />
        <EssenceCarousel isOverlayOpen={isAnyOverlayOpen} />
        <Pillars />
        <ProductCatalog onOpenItemModal={handleOpenItemModal} />
      </main>
      <Footer />
      <FabWhatsApp />

      <ItemModal
        isOpen={isItemModalOpen}
        productName={itemModalProduct}
        initialPrice={itemModalPrice}
        onClose={() => setIsItemModalOpen(false)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartDrawerOpen}
        cart={cart}
        onClose={() => setIsCartDrawerOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onOpenCheckout={() => setIsCheckoutModalOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        cart={cart}
        onClose={() => setIsCheckoutModalOpen(false)}
        onClearCart={handleClearCart}
      />
    </>
  );
}
