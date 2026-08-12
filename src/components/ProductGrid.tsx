'use client';

import React from 'react';
import { Product } from '@/types/domain';
import { ProductCard } from '@/components/ProductCard';

interface ProductGridProps {
  products: Product[];
  onOpenModal: (productId: string) => void;
}

export function ProductGrid({ products, onOpenModal }: ProductGridProps) {
  // Show published products sorted by displayOrder
  const publishedProducts = products
    .filter((p) => p.status === 'published')
    .sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="products-grid">
      {publishedProducts.map((product) => (
        <ProductCard key={product.id} product={product} onOpenModal={onOpenModal} />
      ))}
    </div>
  );
}
