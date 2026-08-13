'use client';

import React, { useEffect, useState } from 'react';
import { fetchAdminSettings, updateAdminSettings } from '@/lib/admin';
import { Save, Store, Phone, QrCode, DollarSign, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form Fields
  const [storeName, setStoreName] = useState('');
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [pixBeneficiary, setPixBeneficiary] = useState('');
  const [pixCity, setPixCity] = useState('');
  const [minOrder, setMinOrder] = useState('0.00');
  const [deliveryFee, setDeliveryFee] = useState('0.00');
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      const data = await fetchAdminSettings();
      setStoreName(data.storeName);
      setWhatsappPhone(data.whatsappPhone);
      setPixKey(data.pixKey);
      setPixBeneficiary(data.pixBeneficiary);
      setPixCity(data.pixCity);
      setMinOrder((data.minOrderCents / 100).toFixed(2));
      setDeliveryFee((data.deliveryFeeCents / 100).toFixed(2));
      setIsAcceptingOrders(data.isAcceptingOrders);
      setLoading(false);
    }
    loadSettings();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotification(null);

    const minCents = Math.round((parseFloat(minOrder.replace(',', '.')) || 0) * 100);
    const feeCents = Math.round((parseFloat(deliveryFee.replace(',', '.')) || 0) * 100);

    const res = await updateAdminSettings({
      storeName: storeName.trim(),
      whatsappPhone: whatsappPhone.trim(),
      pixKey: pixKey.trim(),
      pixBeneficiary: pixBeneficiary.trim(),
      pixCity: pixCity.trim(),
      minOrderCents: minCents,
      deliveryFeeCents: feeCents,
      isAcceptingOrders,
    });

    setSaving(false);

    if (res.success) {
      showNotification('success', 'Configurações salvas com sucesso!');
    } else {
      showNotification('error', res.error || 'Erro ao atualizar configurações.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-admin-text-secondary">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-admin-accent" />
          <span>Carregando configurações...</span>
        </div>
      </div>
    );
  }

  return (
    <main data-testid="admin-settings-page" className="max-w-4xl mx-auto p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-admin-text">
          Configurações da Loja
        </h1>
        <p className="text-sm text-admin-text-secondary">
          Defina chave PIX, número de contato WhatsApp, taxas de entrega e disponibilidade de atendimento.
        </p>
      </div>

      {notification && (
        <div
          data-testid="settings-notification"
          className={`p-4 rounded-admin-card text-sm font-medium flex items-center gap-2 transition-all ${
            notification.type === 'success'
              ? 'bg-status-success/10 text-status-success border border-status-success/30'
              : 'bg-status-danger/10 text-status-danger border border-status-danger/30'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{notification.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Operating Status Banner */}
        <section className="bg-admin-surface-raised border border-admin-border-strong p-6 rounded-admin-panel space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-admin-card border ${isAcceptingOrders ? 'bg-status-success/10 border-status-success/30 text-status-success' : 'bg-status-danger/10 border-status-danger/30 text-status-danger'}`}>
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-admin-text">Status de Atendimento</h2>
                <p className="text-xs text-admin-text-muted">
                  {isAcceptingOrders ? 'A loja está aberta para receber novos pedidos.' : 'A loja está temporariamente fechada para novos pedidos.'}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                data-testid="settings-accepting-orders-checkbox"
                type="checkbox"
                checked={isAcceptingOrders}
                onChange={(e) => setIsAcceptingOrders(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-admin-surface-hover peer-focus:outline-none rounded-admin-badge peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-admin-badge after:h-6 after:w-6 after:transition-all peer-checked:bg-status-success"></div>
            </label>
          </div>
        </section>

        {/* Section 1: Store Details */}
        <section className="bg-admin-surface-raised border border-admin-border-strong p-6 rounded-admin-panel space-y-4 shadow-xl">
          <h2 className="text-lg font-serif font-bold text-admin-text border-b border-admin-border pb-3 flex items-center gap-2">
            <Store className="w-5 h-5 text-admin-accent" /> Identificação da Loja
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-admin-text-muted">Nome do Estabelecimento *</label>
              <input
                data-testid="settings-store-name-input"
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-admin-bg border border-admin-border-strong focus:border-admin-accent text-admin-text p-3 rounded-admin-input text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-admin-text-muted">WhatsApp de Atendimento *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-admin-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  data-testid="settings-whatsapp-input"
                  type="text"
                  required
                  placeholder="5516991359739"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  className="w-full bg-admin-bg border border-admin-border-strong focus:border-admin-accent text-admin-text pl-10 pr-3 py-3 rounded-admin-input text-sm font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: PIX Settings */}
        <section className="bg-admin-surface-raised border border-admin-border-strong p-6 rounded-admin-panel space-y-4 shadow-xl">
          <h2 className="text-lg font-serif font-bold text-admin-text border-b border-admin-border pb-3 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-admin-accent" /> Configurações de Pagamento PIX
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-admin-text-muted">Chave PIX *</label>
              <input
                data-testid="settings-pix-key-input"
                type="text"
                required
                placeholder="ex: CPF, Email ou Chave Aleatória"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                className="w-full bg-admin-bg border border-admin-border-strong focus:border-admin-accent text-admin-text p-3 rounded-admin-input text-sm font-mono focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-admin-text-muted">Nome do Beneficiário *</label>
              <input
                data-testid="settings-pix-beneficiary-input"
                type="text"
                required
                placeholder="Pudim e Cia"
                value={pixBeneficiary}
                onChange={(e) => setPixBeneficiary(e.target.value)}
                className="w-full bg-admin-bg border border-admin-border-strong focus:border-admin-accent text-admin-text p-3 rounded-admin-input text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-admin-text-muted">Cidade do Beneficiário *</label>
              <input
                data-testid="settings-pix-city-input"
                type="text"
                required
                placeholder="Araraquara"
                value={pixCity}
                onChange={(e) => setPixCity(e.target.value)}
                className="w-full bg-admin-bg border border-admin-border-strong focus:border-admin-accent text-admin-text p-3 rounded-admin-input text-sm focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Financial & Delivery Fees */}
        <section className="bg-admin-surface-raised border border-admin-border-strong p-6 rounded-admin-panel space-y-4 shadow-xl">
          <h2 className="text-lg font-serif font-bold text-admin-text border-b border-admin-border pb-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-admin-accent" /> Regras Financeiras e Taxas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-admin-text-muted">Valor Mínimo de Pedido (R$)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-admin-text-muted font-bold">R$</span>
                <input
                  data-testid="settings-min-order-input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  className="w-full bg-admin-bg border border-admin-border-strong focus:border-admin-accent text-admin-text pl-10 pr-3 py-3 rounded-admin-input text-sm font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-admin-text-muted">Taxa Fixa de Entrega (R$)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-admin-text-muted font-bold">R$</span>
                <input
                  data-testid="settings-delivery-fee-input"
                  type="number"
                  step="0.01"
                  min="0"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  className="w-full bg-admin-bg border border-admin-border-strong focus:border-admin-accent text-admin-text pl-10 pr-3 py-3 rounded-admin-input text-sm font-bold focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            data-testid="settings-submit-button"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-admin-accent hover:bg-admin-accent-hover text-white font-semibold rounded-admin-button text-sm transition-all shadow-md shadow-admin-accent/20 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Salvar Configurações</span>
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
