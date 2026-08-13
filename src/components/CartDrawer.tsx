'use client';

import React, { useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { Product } from '@/types/domain';
import { useCart } from '@/context/CartContext';
import { formatCentsToBRL } from '@/lib/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
  onOpenCheckout: () => void;
}

export function CartDrawer({
  isOpen,
  products,
  onClose,
  onOpenCheckout,
}: CartDrawerProps) {
  const { items, increment, decrement, removeItem, getAuthoritativePriceCents, displayTotal } = useCart();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      <div
        id="cart-drawer-overlay"
        className={`cart-drawer-overlay ${isOpen ? 'active' : ''}`}
        aria-hidden={!isOpen}
        data-testid="cart-drawer-overlay"
        onClick={onClose}
      />

      <aside
        id="cart-drawer"
        className={`cart-drawer ${isOpen ? 'active' : ''}`}
        aria-hidden={!isOpen}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        data-testid="cart-drawer"
      >
        <div className="cart-drawer-header">
          <h3 id="cart-drawer-title">Seu Carrinho</h3>
          <button
            type="button"
            className="modal-close-btn"
            id="cart-drawer-close"
            aria-label="Fechar carrinho"
            data-testid="cart-drawer-close"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="cart-drawer-body" id="cart-items" data-testid="cart-items">
          {items.length === 0 ? (
            <p className="cart-empty">
              Seu carrinho está vazio.
              <br />
              Escolha uma especialidade para começar.
            </p>
          ) : (
            items.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              const variant = product?.variants.find((v) => v.id === item.variantId);
              const productName = product?.name || item.cachedProductName || 'Produto';
              const variantName = variant?.name || item.cachedVariantName || 'Padrão';
              const unitPrice = getAuthoritativePriceCents(item, products);
              const itemTotalCents = unitPrice * item.quantity;

              return (
                <div
                  key={item.id}
                  className="cart-item"
                  data-id={item.id}
                  data-testid={`cart-item-${item.id}`}
                >
                  <div className="cart-item-info">
                    <h4>{productName}</h4>
                    <p>
                      {variantName}
                      {item.observations ? ` · ${item.observations}` : ''}
                    </p>
                  </div>
                  <div className="cart-item-price">{formatCentsToBRL(itemTotalCents)}</div>
                  <div className="cart-item-actions">
                    <div className="cart-item-qty">
                      <button
                        type="button"
                        data-action="dec"
                        data-testid={`cart-dec-${item.id}`}
                        aria-label="Diminuir"
                        onClick={() => decrement(item.id)}
                      >
                        −
                      </button>
                      <span data-testid={`cart-qty-${item.id}`}>{item.quantity}</span>
                      <button
                        type="button"
                        data-action="inc"
                        data-testid={`cart-inc-${item.id}`}
                        aria-label="Aumentar"
                        onClick={() => increment(item.id)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="cart-item-remove"
                      data-action="remove"
                      data-testid={`cart-remove-${item.id}`}
                      onClick={() => removeItem(item.id)}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="cart-drawer-footer">
          <div className="cart-subtotal">
            <span>Subtotal</span>
            <strong id="cart-subtotal" data-testid="cart-subtotal">
              {formatCentsToBRL(displayTotal)}
            </strong>
          </div>
          <button
            type="button"
            className="btn-submit-order"
            id="btn-checkout"
            data-testid="btn-checkout"
            disabled={items.length === 0}
            onClick={() => {
              if (items.length > 0) {
                onClose();
                onOpenCheckout();
              }
            }}
          >
            <span>Finalizar Pedido</span>
            <ArrowRight className="btn-icon" size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}
