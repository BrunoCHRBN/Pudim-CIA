'use client';

import React, { useState, useEffect } from 'react';
import { X, Bike, ShoppingBag, Copy, Send, Loader2 } from 'lucide-react';
import {
  CartItem,
  DeliveryMethod,
  PaymentMethod,
  PIX_KEY,
  PIX_BENEFICIARY,
  PIX_CITY,
  WHATSAPP_PHONE,
  NAME_STORAGE_KEY,
} from '@/types';
import { formatBRL } from '@/lib/formatters';
import { generatePixEMV } from '@/lib/pix';

interface CheckoutModalProps {
  isOpen: boolean;
  cart: CartItem[];
  onClose: () => void;
  onClearCart: () => void;
}

export function CheckoutModal({
  isOpen,
  cart,
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

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

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
    const pixCode = generatePixEMV(PIX_KEY, PIX_BENEFICIARY, PIX_CITY, total);
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

    let hasError = false;
    setNameError('');
    setAddressError('');

    if (!clientName.trim()) {
      setNameError('Por favor, informe seu nome.');
      hasError = true;
    }

    if (deliveryMethod === 'entrega' && !deliveryAddress.trim()) {
      setAddressError('Por favor, informe o endereço de entrega.');
      hasError = true;
    }

    if (cart.length === 0 || hasError) return;

    localStorage.setItem(NAME_STORAGE_KEY, clientName.trim());

    setIsSubmitting(true);

    const totalStr = formatBRL(total);
    const emojiDetalhes = '\uD83C\uDF6E';
    const emojiCliente = '\uD83D\uDC64';
    const emojiEntrega = '\uD83D\uDEF5';
    const emojiRetirada = '\uD83D\uDECD';
    const emojiPagamento = '\uD83D\uDCB3';
    const emojiPix = '\uD83D\uDD11';

    const deliveryIcon = deliveryMethod === 'entrega' ? emojiEntrega : emojiRetirada;
    const deliveryMethodStr =
      deliveryMethod === 'entrega' ? 'Entrega (Delivery)' : 'Retirar na Loja';

    let paymentMethodStr = '';
    if (paymentMethod === 'pix') {
      paymentMethodStr = 'Pix (Pago via Copia e Cola do site)';
    } else if (paymentMethod === 'cartao') {
      paymentMethodStr = 'Cartão';
    } else {
      paymentMethodStr = `Dinheiro (Troco para: ${
        changeAmount.trim() ? changeAmount.trim() : 'Não necessário'
      })`;
    }

    let msg = `Olá, Pudim & Cia! Gostaria de fazer um pedido através do site:\n\n`;
    msg += `${emojiDetalhes} *DETALHES DO PEDIDO*\n`;
    cart.forEach((item, idx) => {
      msg += `\n*Item ${idx + 1}:* ${item.product}\n`;
      msg += `*Quantidade:* ${item.qty}x\n`;
      msg += `*Opção/Sabor:* ${item.option}\n`;
      msg += `*Subtotal:* ${formatBRL(item.price * item.qty)}\n`;
      if (item.observations) {
        msg += `*Obs. do item:* ${item.observations}\n`;
      }
    });
    msg += `\n*Valor Total:* ${totalStr}\n\n`;
    msg += `---\n`;
    msg += `${emojiCliente} *CLIENTE*\n`;
    msg += `*Nome:* ${clientName.trim()}\n\n`;
    msg += `---\n`;
    msg += `${deliveryIcon} *ENVIO*\n`;
    msg += `*Tipo:* ${deliveryMethodStr}\n`;
    if (deliveryMethod === 'entrega') {
      msg += `*Endereço:* ${deliveryAddress.trim()}\n`;
    }
    msg += `\n---\n`;
    msg += `${emojiPagamento} *PAGAMENTO*\n`;
    msg += `*Forma:* ${paymentMethodStr}\n`;

    if (paymentMethod === 'pix') {
      const pixCode = generatePixEMV(PIX_KEY, PIX_BENEFICIARY, PIX_CITY, total);
      msg += `\n---\n${emojiPix} *CÓDIGO PIX COPIA E COLA*\n${pixCode}`;
    }

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(
      msg
    )}`;

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
                      : `Copiar código Pix Copia e Cola (${formatBRL(total)})`}
                  </span>
                </button>
              </div>
            )}
          </div>

          <div className="modal-total-bar">
            <span>Valor Total:</span>
            <strong id="checkout-total-price" data-testid="checkout-total-price">
              {formatBRL(total)}
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
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
