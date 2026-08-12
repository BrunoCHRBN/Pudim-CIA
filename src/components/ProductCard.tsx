'use client';

import React from 'react';
import Image from 'next/image';
import { Product } from '@/types/domain';
import { formatCentsToBRL } from '@/lib/formatters';

interface ProductCardProps {
  product: Product;
  onOpenModal: (productId: string) => void;
}

export function ProductCard({ product, onOpenModal }: ProductCardProps) {
  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const imageUrl = primaryImage?.url || '/assets/logo.png';
  const imageAlt = primaryImage?.alt || product.name;

  const handleClick = () => {
    onOpenModal(product.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpenModal(product.id);
    }
  };

  const priceBRL = formatCentsToBRL(product.priceCents);
  const testIdMap: Record<string, string> = {
    prod_pudim_classico: 'product-card-pudim',
    prod_cones_trufados: 'product-card-cones',
    prod_caixa_trufas: 'product-card-trufas',
  };
  const btnTestIdMap: Record<string, string> = {
    prod_pudim_classico: 'btn-encomendar-pudim',
    prod_cones_trufados: 'btn-encomendar-cones',
    prod_caixa_trufas: 'btn-encomendar-trufas',
  };

  return (
    <article
      className="product-card reveal-fade revealed"
      data-product-id={product.id}
      data-price-cents={product.priceCents}
      data-testid={testIdMap[product.id] || `product-card-${product.id}`}
      tabIndex={0}
      role="button"
      aria-label={`Encomendar ${product.name}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="product-img-wrap">
        <Image
          src={imageUrl}
          alt={imageAlt}
          className="product-img"
          width={600}
          height={400}
          loading="lazy"
        />
      </div>
      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">{priceBRL}</span>
          <button
            type="button"
            className="btn-encomendar"
            data-testid={btnTestIdMap[product.id] || `btn-encomendar-${product.id}`}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            Encomendar
          </button>
        </div>
      </div>
    </article>
  );
}
