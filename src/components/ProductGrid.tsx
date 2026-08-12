'use client';

import React from 'react';
import { MockProduct } from '@/mocks/products';
import { ProductCard } from '@/components/ProductCard';

interface ProductGridProps {
  products: MockProduct[];
  onOpenModal: (name: string, price: number) => void;
}

export function ProductGrid({ products, onOpenModal }: ProductGridProps) {
  return (
    <div className="products-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onOpenModal={onOpenModal} />
      ))}
    </div>
  );
}
