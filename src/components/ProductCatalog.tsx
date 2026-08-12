'use client';

import React from 'react';
import { Product } from '@/types/domain';
import { ProductGrid } from '@/components/ProductGrid';
import { ProductsCTA } from '@/components/ProductsCTA';

interface ProductCatalogProps {
  products: Product[];
  onOpenItemModal: (productId: string) => void;
}

export function ProductCatalog({ products, onOpenItemModal }: ProductCatalogProps) {
  return (
    <section className="products-section" id="catalogo">
      <div className="container">
        <div className="section-header reveal-fade revealed">
          <span className="section-tagline">Cardápio de Delícias</span>
          <h2 className="section-title">Nossas Especialidades</h2>
        </div>

        <ProductGrid products={products} onOpenModal={onOpenItemModal} />
        <ProductsCTA />
      </div>
    </section>
  );
}
