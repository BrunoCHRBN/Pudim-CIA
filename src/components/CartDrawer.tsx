'use client';

import React, { useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { CartItem, Product } from '@/types/domain';
import { formatCentsToBRL } from '@/lib/formatters';

interface CartDrawerProps {
  isOpen: boolean;
  cart: CartItem[];
  products: Product[];
  onClose: () => void;
  onUpdateQty: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onOpenCheckout: () => void;
}

export function CartDrawer({
  isOpen,
  cart,
  products,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onOpenCheckout,
}: CartDrawerProps) {
  const totalCents = cart.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

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
          {cart.length === 0 ? (
            <p className="cart-empty">
              Seu carrinho está vazio.
              <br />
              Escolha uma especialidade para começar.
            </p>
          ) : (
            cart.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              const variant = product?.variants.find((v) => v.id === item.variantId);
              const productName = product?.name || 'Produto';
              const variantName = variant?.name || 'Padrão';
              const itemTotalCents = item.priceCents * item.quantity;

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
                        onClick={() => onUpdateQty(item.id, -1)}
                      >
                        −
                      </button>
                      <span data-testid={`cart-qty-${item.id}`}>{item.quantity}</span>
                      <button
                        type="button"
                        data-action="inc"
                        data-testid={`cart-inc-${item.id}`}
                        aria-label="Aumentar"
                        onClick={() => onUpdateQty(item.id, 1)}
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      className="cart-item-remove"
                      data-action="remove"
                      data-testid={`cart-remove-${item.id}`}
                      onClick={() => onRemoveItem(item.id)}
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
              {formatCentsToBRL(totalCents)}
            </strong>
          </div>
          <button
            type="button"
            className="btn-submit-order"
            id="btn-checkout"
            data-testid="btn-checkout"
            disabled={cart.length === 0}
            onClick={() => {
              if (cart.length > 0) {
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
