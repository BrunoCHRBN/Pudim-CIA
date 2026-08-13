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
      <div className="min-h-[60vh] flex items-center justify-center text-[#b8a698]">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#d9822b]" />
          <span>Carregando configurações...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#f4efe8]">
          Configurações da Loja
        </h1>
        <p className="text-sm text-[#b8a698]">
          Defina chave PIX, número de contato WhatsApp, taxas de entrega e disponibilidade de atendimento.
        </p>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50'
              : 'bg-red-950/40 text-red-300 border border-red-800/50'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{notification.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Store Operating Status Banner */}
        <section className="bg-[#1e1713] border border-[#3d2f26] p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl border ${isAcceptingOrders ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                <Store className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-serif font-bold text-[#f4efe8]">Status de Atendimento</h2>
                <p className="text-xs text-[#8c786a]">
                  {isAcceptingOrders ? 'A loja está aberta para receber novos pedidos.' : 'A loja está temporariamente fechada para novos pedidos.'}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAcceptingOrders}
                onChange={(e) => setIsAcceptingOrders(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-[#241c16] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </section>

        {/* Section 1: Store Details */}
        <section className="bg-[#1e1713] border border-[#3d2f26] p-6 rounded-2xl space-y-4 shadow-xl">
          <h2 className="text-lg font-serif font-bold text-[#f4efe8] border-b border-[#2d231c] pb-3 flex items-center gap-2">
            <Store className="w-5 h-5 text-[#d9822b]" /> Identificação da Loja
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-[#8c786a]">Nome do Estabelecimento *</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full bg-[#140e0b] border border-[#3d2f26] focus:border-[#d9822b] text-[#f4efe8] p-3 rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-[#8c786a]">WhatsApp de Atendimento *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#8c786a] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="5516991359739"
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  className="w-full bg-[#140e0b] border border-[#3d2f26] focus:border-[#d9822b] text-[#f4efe8] pl-10 pr-3 py-3 rounded-xl text-sm font-mono focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: PIX Settings */}
        <section className="bg-[#1e1713] border border-[#3d2f26] p-6 rounded-2xl space-y-4 shadow-xl">
          <h2 className="text-lg font-serif font-bold text-[#f4efe8] border-b border-[#2d231c] pb-3 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#d9822b]" /> Configurações de Pagamento PIX
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-[#8c786a]">Chave PIX *</label>
              <input
                type="text"
                required
                placeholder="ex: CPF, Email ou Chave Aleatória"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                className="w-full bg-[#140e0b] border border-[#3d2f26] focus:border-[#d9822b] text-[#f4efe8] p-3 rounded-xl text-sm font-mono focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-[#8c786a]">Nome do Beneficiário *</label>
              <input
                type="text"
                required
                placeholder="Pudim e Cia"
                value={pixBeneficiary}
                onChange={(e) => setPixBeneficiary(e.target.value)}
                className="w-full bg-[#140e0b] border border-[#3d2f26] focus:border-[#d9822b] text-[#f4efe8] p-3 rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-[#8c786a]">Cidade do Beneficiário *</label>
              <input
                type="text"
                required
                placeholder="Araraquara"
                value={pixCity}
                onChange={(e) => setPixCity(e.target.value)}
                className="w-full bg-[#140e0b] border border-[#3d2f26] focus:border-[#d9822b] text-[#f4efe8] p-3 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Section 3: Financial & Delivery Fees */}
        <section className="bg-[#1e1713] border border-[#3d2f26] p-6 rounded-2xl space-y-4 shadow-xl">
          <h2 className="text-lg font-serif font-bold text-[#f4efe8] border-b border-[#2d231c] pb-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#d9822b]" /> Regras Financeiras e Taxas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-[#8c786a]">Valor Mínimo de Pedido (R$)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8c786a] font-bold">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  className="w-full bg-[#140e0b] border border-[#3d2f26] focus:border-[#d9822b] text-[#f4efe8] pl-10 pr-3 py-3 rounded-xl text-sm font-bold focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-[#8c786a]">Taxa Fixa de Entrega (R$)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8c786a] font-bold">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(e.target.value)}
                  className="w-full bg-[#140e0b] border border-[#3d2f26] focus:border-[#d9822b] text-[#f4efe8] pl-10 pr-3 py-3 rounded-xl text-sm font-bold focus:outline-none"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-[#d9822b] hover:bg-[#c2711e] text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-[#d9822b]/20 cursor-pointer disabled:opacity-50"
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
