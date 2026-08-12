'use client';

import React from 'react';
import { MOCK_PRODUCTS } from '@/mocks/products';
import { ProductGrid } from '@/components/ProductGrid';
import { ProductsCTA } from '@/components/ProductsCTA';

interface ProductCatalogProps {
  onOpenItemModal: (productName: string, price: number) => void;
}

export function ProductCatalog({ onOpenItemModal }: ProductCatalogProps) {
  return (
    <section className="products-section" id="catalogo">
      <div className="container">
        <div className="section-header reveal-fade revealed">
          <span className="section-tagline">Cardápio de Delícias</span>
          <h2 className="section-title">Nossas Especialidades</h2>
        </div>

        <ProductGrid products={MOCK_PRODUCTS} onOpenModal={onOpenItemModal} />
        <ProductsCTA />
      </div>
    </section>
  );
}
