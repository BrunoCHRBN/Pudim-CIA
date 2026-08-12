'use client';

import React from 'react';
import Image from 'next/image';
import { MockProduct } from '@/mocks/products';
import { formatBRL } from '@/lib/formatters';

interface ProductCardProps {
  product: MockProduct;
  onOpenModal: (name: string, price: number) => void;
}

export function ProductCard({ product, onOpenModal }: ProductCardProps) {
  const handleClick = () => {
    onOpenModal(product.name, product.price);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpenModal(product.name, product.price);
    }
  };

  return (
    <article
      className={`product-card reveal-fade ${product.delayClass} revealed`}
      data-product={product.name}
      data-price={product.price.toFixed(2)}
      data-testid={product.testId}
      tabIndex={0}
      role="button"
      aria-label={`Encomendar ${product.name}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <div className="product-img-wrap">
        <Image
          src={product.image}
          alt={product.alt}
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
          <span className="product-price">{formatBRL(product.price)}</span>
          <button
            type="button"
            className="btn-encomendar"
            data-testid={product.btnTestId}
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
