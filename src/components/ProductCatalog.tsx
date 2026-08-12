'use client';

import React from 'react';
import Image from 'next/image';
import { MessageCircle } from 'lucide-react';
import { PRODUCT_CONFIG } from '@/types';
import { formatBRL } from '@/lib/formatters';

interface ProductCatalogProps {
  onOpenItemModal: (productName: string, price: number) => void;
}

const productsList = [
  {
    name: 'Pudim Clássico',
    testId: 'product-card-pudim',
    btnTestId: 'btn-encomendar-pudim',
    delayClass: '',
  },
  {
    name: 'Cones Trufados',
    testId: 'product-card-cones',
    btnTestId: 'btn-encomendar-cones',
    delayClass: 'delay-1',
  },
  {
    name: 'Caixa de Trufas Gourmet',
    testId: 'product-card-trufas',
    btnTestId: 'btn-encomendar-trufas',
    delayClass: 'delay-2',
  },
];

export function ProductCatalog({ onOpenItemModal }: ProductCatalogProps) {
  return (
    <section className="products-section" id="catalogo">
      <div className="container">
        <div className="section-header reveal-fade revealed">
          <span className="section-tagline">Cardápio de Delícias</span>
          <h2 className="section-title">Nossas Especialidades</h2>
        </div>

        <div className="products-grid">
          {productsList.map((item) => {
            const product = PRODUCT_CONFIG[item.name];
            if (!product) return null;

            return (
              <article
                key={item.name}
                className={`product-card reveal-fade ${item.delayClass} revealed`}
                data-product={item.name}
                data-price={product.price.toFixed(2)}
                data-testid={item.testId}
                tabIndex={0}
                role="button"
                aria-label={`Encomendar ${item.name}`}
                onClick={() => onOpenItemModal(item.name, product.price)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpenItemModal(item.name, product.price);
                  }
                }}
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
                  <h3 className="product-name">{item.name}</h3>
                  <p className="product-desc">{product.description}</p>
                  <div className="product-footer">
                    <span className="product-price">{formatBRL(product.price)}</span>
                    <button
                      type="button"
                      className="btn-encomendar"
                      data-testid={item.btnTestId}
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenItemModal(item.name, product.price);
                      }}
                    >
                      Encomendar
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="products-cta reveal-fade delay-3 revealed">
          <p className="products-cta-text">
            Gostou? Faça seu pedido diretamente pelo WhatsApp — rápido e sem complicação.
          </p>
          <a
            href="https://wa.me/5516991359739?text=Ol%C3%A1!%20Gostaria%20de%20fazer%20um%20pedido%20na%20Pudim%20%26%20CIA!"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-whatsapp"
            id="whatsapp-cta"
            data-testid="whatsapp-cta"
          >
            <MessageCircle className="btn-icon" size={20} />
            <span>Encomendar via WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}
