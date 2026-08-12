'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { PRODUCT_CONFIG, CartItem } from '@/types';
import { formatBRL } from '@/lib/formatters';

interface ItemModalProps {
  isOpen: boolean;
  productName: string;
  initialPrice: number;
  onClose: () => void;
  onAddToCart: (item: Omit<CartItem, 'id'>) => void;
}

export function ItemModal({
  isOpen,
  productName,
  initialPrice,
  onClose,
  onAddToCart,
}: ItemModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState('');
  const [observations, setObservations] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const modalRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const product = PRODUCT_CONFIG[productName];
  const options = product?.options || [];
  const currentPrice = product?.price || initialPrice;
  const totalPrice = quantity * currentPrice;

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setObservations('');
      setErrorMsg('');
      setIsDropdownOpen(false);
      const opts = PRODUCT_CONFIG[productName]?.options || [];
      if (opts.length > 0) {
        setSelectedOption(opts[0] ?? '');
      }
    }
  }, [isOpen, productName]);

  // Click outside custom dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Keyboard trap and ESC
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

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOption) {
      setErrorMsg('Selecione uma opção de sabor.');
      return;
    }

    onAddToCart({
      product: productName,
      price: currentPrice,
      qty: quantity,
      option: selectedOption,
      observations: observations.trim(),
    });

    onClose();
  };

  return (
    <div
      id="item-modal"
      className={`modal-overlay ${isOpen ? 'active' : ''}`}
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal="true"
      aria-labelledby="item-modal-title"
      data-testid="item-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-container" role="document" ref={modalRef}>
        <button
          type="button"
          id="item-modal-close"
          className="modal-close-btn"
          aria-label="Fechar modal"
          data-testid="item-modal-close"
          onClick={onClose}
        >
          <X size={18} />
        </button>

        <div className="modal-section-label">Pedido</div>
        <h3 className="modal-title" id="item-modal-title">
          Adicionar ao Carrinho
        </h3>
        <p className="modal-subtitle">
          Você selecionou: <strong id="item-product-name">{productName}</strong>
        </p>

        <form id="item-form" className="modal-form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <div className="form-group qty-group">
              <label htmlFor="item-quantity">Quantidade *</label>
              <div className="qty-selector">
                <button
                  type="button"
                  className="qty-btn"
                  id="item-qty-dec"
                  data-testid="item-qty-dec"
                  aria-label="Diminuir quantidade"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  -
                </button>
                <input
                  type="number"
                  id="item-quantity"
                  name="item-quantity"
                  min="1"
                  max="10"
                  value={quantity}
                  readOnly
                  data-testid="item-quantity"
                />
                <button
                  type="button"
                  className="qty-btn"
                  id="item-qty-inc"
                  data-testid="item-qty-inc"
                  aria-label="Aumentar quantidade"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                >
                  +
                </button>
              </div>
            </div>

            <div className="form-group sabor-group">
              <label htmlFor="item-dropdown-btn">Opção / Sabor *</label>
              <div
                className={`custom-dropdown ${isDropdownOpen ? 'open' : ''}`}
                id="item-dropdown"
                ref={dropdownRef}
              >
                <button
                  type="button"
                  className={`custom-dropdown-btn ${errorMsg ? 'is-invalid' : ''}`}
                  id="item-dropdown-btn"
                  aria-haspopup="listbox"
                  aria-expanded={isDropdownOpen}
                  data-testid="item-dropdown-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDropdownOpen(!isDropdownOpen);
                  }}
                >
                  <span id="item-dropdown-label">
                    {selectedOption || 'Selecione uma opção'}
                  </span>
                  <svg
                    className="dropdown-chevron"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M6 8L10 12L14 8"
                      stroke="#C68B59"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div
                  className="custom-dropdown-menu"
                  id="item-dropdown-menu"
                  role="listbox"
                  aria-labelledby="item-dropdown-btn"
                  data-testid="item-dropdown-menu"
                >
                  {options.map((opt) => (
                    <div
                      key={opt}
                      className={`custom-dropdown-item ${
                        selectedOption === opt ? 'selected' : ''
                      }`}
                      role="option"
                      aria-selected={selectedOption === opt}
                      data-value={opt}
                      data-testid={`item-option-${opt}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOption(opt);
                        setErrorMsg('');
                        setIsDropdownOpen(false);
                      }}
                    >
                      <span>{opt}</span>
                      <svg
                        className="check-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M20 6L9 17L4 12"
                          stroke="#C68B59"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  ))}
                </div>
              </div>
              {errorMsg && (
                <span className="field-error" id="item-option-error" data-testid="item-option-error">
                  {errorMsg}
                </span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="item-observations">Observações (Opcional)</label>
            <textarea
              id="item-observations"
              name="item-observations"
              rows={2}
              placeholder="Ex: Sem calda extra, embalagem para presente, etc."
              data-testid="item-observations"
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
            />
          </div>

          <div className="modal-total-bar">
            <span>Subtotal:</span>
            <strong id="item-total-price" data-testid="item-total-price">
              {formatBRL(totalPrice)}
            </strong>
          </div>

          <button
            type="submit"
            className="btn-submit-order"
            id="btn-add-to-cart"
            data-testid="btn-add-to-cart"
          >
            <span>Adicionar ao Carrinho</span>
            <ShoppingBag className="btn-icon" size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
