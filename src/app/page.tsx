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
import { Product, BusinessSettings } from '@/types/domain';
import { fetchPublishedCatalog } from '@/lib/catalog';
import { useCart } from '@/context/CartContext';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const { items, clear: handleClearCart } = useCart();

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Load live catalog and business settings from Supabase
  useEffect(() => {
    async function loadCatalog() {
      const data = await fetchPublishedCatalog();
      setProducts(data.products);
      setSettings(data.settings);
    }
    loadCatalog();
  }, []);

  const handleOpenItemModal = (productId: string) => {
    setSelectedProductId(productId);
    setIsItemModalOpen(true);
  };

  const handleAddToCart = () => {
    setIsCartDrawerOpen(true);
  };

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
      <Navbar onOpenCart={() => setIsCartDrawerOpen(true)} />
      <main>
        <Hero />
        <EssenceCarousel isOverlayOpen={isAnyOverlayOpen} />
        <Pillars />
        <ProductCatalog products={products} onOpenItemModal={handleOpenItemModal} />
      </main>
      <Footer />
      <FabWhatsApp />

      <ItemModal
        isOpen={isItemModalOpen}
        productId={selectedProductId}
        products={products}
        onClose={() => setIsItemModalOpen(false)}
        onAddToCart={handleAddToCart}
      />

      <CartDrawer
        isOpen={isCartDrawerOpen}
        products={products}
        onClose={() => setIsCartDrawerOpen(false)}
        onOpenCheckout={() => setIsCheckoutModalOpen(true)}
      />

      {settings && (
        <CheckoutModal
          isOpen={isCheckoutModalOpen}
          cart={items}
          products={products}
          settings={settings}
          onClose={() => setIsCheckoutModalOpen(false)}
          onClearCart={handleClearCart}
        />
      )}
    </>
  );
}
