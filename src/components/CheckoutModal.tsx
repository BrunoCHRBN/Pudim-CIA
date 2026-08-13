'use client';

import React, { useState, useEffect } from 'react';
import { X, Bike, ShoppingBag, Copy, Send, Loader2 } from 'lucide-react';
import {
  CartItem,
  Product,
  BusinessSettings,
  DeliveryMethod,
  PaymentMethod,
  CheckoutData,
  NAME_STORAGE_KEY,
} from '@/types/domain';
import { formatCentsToBRL } from '@/lib/formatters';
import { generatePixEMV } from '@/lib/pix';
import { calculateCheckoutTotal, validateCheckoutData } from '@/lib/checkout';
import { buildWhatsAppOrderMessage, buildWhatsAppUrl } from '@/lib/whatsapp';

interface CheckoutModalProps {
  isOpen: boolean;
  cart: CartItem[];
  products: Product[];
  settings: BusinessSettings;
  onClose: () => void;
  onClearCart: () => void;
}

export function CheckoutModal({
  isOpen,
  cart,
  products,
  settings,
  onClose,
  onClearCart,
}: CheckoutModalProps) {
  const [clientName, setClientName] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('entrega');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [changeAmount, setChangeAmount] = useState('');

  const [nameError, setNameError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [isCopying, setIsCopying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalCents = calculateCheckoutTotal(cart, products, deliveryMethod, settings);

  useEffect(() => {
    if (isOpen) {
      setNameError('');
      setAddressError('');
      setIsSubmitting(false);
      const savedName = localStorage.getItem(NAME_STORAGE_KEY);
      if (savedName) setClientName(savedName);
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  const handleCopyPix = () => {
    const pixCode = generatePixEMV(
      settings.pixKey,
      settings.pixBeneficiary,
      settings.pixCity,
      totalCents
    );
    navigator.clipboard
      .writeText(pixCode)
      .then(() => {
        setIsCopying(true);
        setTimeout(() => setIsCopying(false), 2000);
      })
      .catch((err) => console.error('Error copying text:', err));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const checkoutData: CheckoutData = {
      clientName,
      deliveryMethod,
      deliveryAddress,
      paymentMethod,
      changeAmount,
    };

    const { isValid, errors } = validateCheckoutData(checkoutData);

    setNameError(errors.clientName || '');
    setAddressError(errors.deliveryAddress || '');

    if (!isValid || cart.length === 0) return;

    localStorage.setItem(NAME_STORAGE_KEY, clientName.trim());
    setIsSubmitting(true);

    const message = buildWhatsAppOrderMessage({
      cart,
      products,
      checkoutData,
      settings,
    });

    const whatsappUrl = buildWhatsAppUrl(settings.whatsappPhone, message);

    onClearCart();
    onClose();

    const opened = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    if (!opened) {
      window.location.href = whatsappUrl;
    }
  };

  return (
    <div
      id="checkout-modal"
      className={`modal-overlay ${isOpen ? 'active' : ''}`}
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      data-testid="checkout-modal"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-container modal-container--checkout" role="document">
        <button
          type="button"
          id="checkout-modal-close"
          className="modal-close-btn"
          aria-label="Fechar modal"
          data-testid="checkout-modal-close"
          onClick={onClose}
        >
          <X size={18} />
        </button>

        <h3 className="modal-title" id="checkout-modal-title">
          Finalizar Pedido
        </h3>
        <p className="modal-subtitle">
          Revise os dados e envie sua encomenda pelo WhatsApp.
        </p>

        <form id="checkout-form" className="modal-form" onSubmit={handleSubmit} noValidate>
          {/* Cliente */}
          <div className="modal-section">
            <div className="modal-section-label">Cliente</div>
            <div className="form-group">
              <label htmlFor="client-name">Seu Nome *</label>
              <input
                type="text"
                id="client-name"
                name="client-name"
                required
                placeholder="Digite seu nome completo"
                data-testid="client-name"
                autoComplete="name"
                className={nameError ? 'is-invalid' : ''}
                value={clientName}
                onChange={(e) => {
                  setClientName(e.target.value);
                  if (nameError) setNameError('');
                }}
              />
              {nameError && (
                <span
                  className="field-error"
                  id="client-name-error"
                  data-testid="client-name-error"
                >
                  {nameError}
                </span>
              )}
            </div>
          </div>

          {/* Entrega */}
          <div className="modal-section">
            <div className="modal-section-label">Entrega</div>
            <div className="form-group">
              <label>Como deseja receber? *</label>
              <div
                className="btn-toggle-group"
                id="delivery-method-group"
                data-testid="delivery-method-group"
              >
                <button
                  type="button"
                  className={`btn-toggle ${deliveryMethod === 'entrega' ? 'active' : ''}`}
                  data-value="entrega"
                  data-testid="delivery-entrega"
                  onClick={() => setDeliveryMethod('entrega')}
                >
                  <Bike size={16} />
                  <span>Entrega</span>
                </button>
                <button
                  type="button"
                  className={`btn-toggle ${deliveryMethod === 'retirada' ? 'active' : ''}`}
                  data-value="retirada"
                  data-testid="delivery-retirada"
                  onClick={() => {
                    setDeliveryMethod('retirada');
                    setAddressError('');
                  }}
                >
                  <ShoppingBag size={16} />
                  <span>Retirar na Loja</span>
                </button>
              </div>
            </div>

            {deliveryMethod === 'entrega' && (
              <div className="form-group" id="address-field-group">
                <label htmlFor="delivery-address">Endereço Completo de Entrega *</label>
                <input
                  type="text"
                  id="delivery-address"
                  name="delivery-address"
                  placeholder="Rua, número, bairro, apto..."
                  data-testid="delivery-address"
                  autoComplete="street-address"
                  className={addressError ? 'is-invalid' : ''}
                  value={deliveryAddress}
                  onChange={(e) => {
                    setDeliveryAddress(e.target.value);
                    if (addressError) setAddressError('');
                  }}
                />
                {addressError && (
                  <span
                    className="field-error"
                    id="delivery-address-error"
                    data-testid="delivery-address-error"
                  >
                    {addressError}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Pagamento */}
          <div className="modal-section">
            <div className="modal-section-label">Pagamento</div>
            <div className="form-group">
              <label>Forma de Pagamento *</label>
              <div
                className="btn-toggle-group"
                id="payment-method-group"
                data-testid="payment-method-group"
              >
                <button
                  type="button"
                  className={`btn-toggle ${paymentMethod === 'pix' ? 'active' : ''}`}
                  data-value="pix"
                  data-testid="payment-pix"
                  onClick={() => setPaymentMethod('pix')}
                >
                  <span>Pix</span>
                </button>
                <button
                  type="button"
                  className={`btn-toggle ${paymentMethod === 'cartao' ? 'active' : ''}`}
                  data-value="cartao"
                  data-testid="payment-cartao"
                  onClick={() => setPaymentMethod('cartao')}
                >
                  <span>Cartão</span>
                </button>
                <button
                  type="button"
                  className={`btn-toggle ${paymentMethod === 'dinheiro' ? 'active' : ''}`}
                  data-value="dinheiro"
                  data-testid="payment-dinheiro"
                  onClick={() => setPaymentMethod('dinheiro')}
                >
                  <span>Dinheiro</span>
                </button>
              </div>
            </div>

            {paymentMethod === 'dinheiro' && (
              <div className="form-group" id="change-field-group">
                <label htmlFor="change-amount">Troco para quanto? (Opcional)</label>
                <input
                  type="text"
                  id="change-amount"
                  name="change-amount"
                  placeholder="Ex: R$ 50,00"
                  data-testid="change-amount"
                  value={changeAmount}
                  onChange={(e) => setChangeAmount(e.target.value)}
                />
              </div>
            )}

            {paymentMethod === 'pix' && (
              <div className="pix-area" id="pix-area" data-testid="pix-area">
                <p className="pix-info">Copie o código abaixo para pagar via Pix Copia e Cola:</p>
                <p
                  className="pix-placeholder-notice"
                  id="pix-placeholder-notice"
                  data-testid="pix-placeholder-notice"
                >
                  Pix em configuração — confirme o pagamento pelo WhatsApp
                </p>
                <button
                  type="button"
                  className="btn-pix-copy"
                  id="btn-pix-copy"
                  data-testid="btn-pix-copy"
                  style={{ backgroundColor: isCopying ? '#25D366' : '' }}
                  onClick={handleCopyPix}
                >
                  <Copy className="copy-icon" size={16} />
                  <span id="btn-pix-text">
                    {isCopying
                      ? '✓ Copiado!'
                      : `Copiar código Pix Copia e Cola (${formatCentsToBRL(totalCents)})`}
                  </span>
                </button>
              </div>
            )}
          </div>

          <div className="modal-total-bar">
            <span>Valor Total:</span>
            <strong id="checkout-total-price" data-testid="checkout-total-price">
              {formatCentsToBRL(totalCents)}
            </strong>
          </div>

          <button
            type="submit"
            className="btn-submit-order"
            id="btn-submit-order"
            data-testid="btn-submit-order"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span>Abrindo WhatsApp...</span>
                <Loader2 className="btn-icon animate-spin" size={18} />
              </>
            ) : (
              <>
                <span>Enviar Pedido</span>
                <Send className="btn-icon" size={18} />
              </>
            ) }
          </button>
        </form>
      </div>
    </div>
  );
}
