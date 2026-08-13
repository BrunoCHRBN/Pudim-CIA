'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAdminProducts, fetchAdminCategories, duplicateAdminProduct, updateProductStatus } from '@/lib/admin';
import { Product, Category, ProductStatus } from '@/types/domain';
import { formatCentsToBRL } from '@/lib/formatters';
import { Plus, Search, Copy, Edit, Eye, EyeOff, Archive, Package, Star, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    const [pData, cData] = await Promise.all([
      fetchAdminProducts(statusFilter, searchQuery),
      fetchAdminCategories(),
    ]);
    setProducts(pData);
    setCategories(cData);
    setLoading(false);
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDuplicate = async (id: string) => {
    setActionLoadingId(id);
    const res = await duplicateAdminProduct(id);
    setActionLoadingId(null);

    if (res.success) {
      showNotification('success', 'Produto duplicado com sucesso em rascunho!');
      await loadData();
    } else {
      showNotification('error', res.error || 'Erro ao duplicar produto.');
    }
  };

  const handleStatusChange = async (id: string, newStatus: ProductStatus) => {
    setActionLoadingId(id);
    const res = await updateProductStatus(id, newStatus);
    setActionLoadingId(null);

    if (res.success) {
      const label = newStatus === 'published' ? 'publicado' : newStatus === 'draft' ? 'despublicado' : 'arquivado';
      showNotification('success', `Status alterado para ${label} com sucesso!`);
      await loadData();
    } else {
      showNotification('error', res.error || 'Erro ao atualizar status.');
    }
  };

  const getCategoryName = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.name : 'Sem categoria';
  };

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
      {/* Page Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#f4efe8]">
            Catálogo de Produtos
          </h1>
          <p className="text-sm text-[#b8a698]">
            Crie, edite, duplique e ajuste a visibilidade dos produtos da loja.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#d9822b] hover:bg-[#c2711e] text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-[#d9822b]/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Novo Produto</span>
        </Link>
      </div>

      {/* Alert Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/50'
              : 'bg-red-950/40 text-red-300 border border-red-800/50'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#1e1713] border border-[#3d2f26] rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'published', label: 'Publicados' },
            { id: 'draft', label: 'Rascunhos' },
            { id: 'archived', label: 'Arquivados' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-[#d9822b] text-white shadow-sm'
                  : 'bg-[#241c16] text-[#b8a698] hover:text-[#f4efe8] border border-[#3d2f26]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-80">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#8c786a] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome ou slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#140e0b] border border-[#3d2f26] focus:border-[#d9822b] text-[#f4efe8] placeholder-[#8c786a] pl-9 pr-3 py-2 rounded-xl text-sm focus:outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            className="px-3.5 py-2 bg-[#241c16] hover:bg-[#2d231c] text-[#e6dad0] border border-[#3d2f26] rounded-xl text-xs font-semibold shrink-0 cursor-pointer"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-[#1e1713] border border-[#3d2f26] rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#b8a698] flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#d9822b]" />
            <span>Carregando produtos...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-[#8c786a] space-y-3">
            <Package className="w-12 h-12 text-[#8c786a] mx-auto" />
            <p className="font-medium text-[#f4efe8]">Nenhum produto encontrado</p>
            <p className="text-xs">Tente ajustar o filtro de status ou termo de busca.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#2d231c] bg-[#1a1410] text-xs font-semibold uppercase text-[#8c786a]">
                  <th className="py-3.5 px-4">Produto</th>
                  <th className="py-3.5 px-4">Categoria</th>
                  <th className="py-3.5 px-4">Preço</th>
                  <th className="py-3.5 px-4">Variantes</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d231c]">
                {products.map((product) => {
                  const primaryImg = product.images.find((i) => i.isPrimary)?.url || product.images[0]?.url;
                  const isBusy = actionLoadingId === product.id;

                  return (
                    <tr key={product.id} className="hover:bg-[#241c16] transition-colors">
                      {/* Product Thumbnail & Details */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#140e0b] border border-[#3d2f26] overflow-hidden shrink-0 flex items-center justify-center relative">
                            {primaryImg ? (
                              <img src={primaryImg} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-6 h-6 text-[#8c786a]" />
                            )}
                            {product.isFeatured && (
                              <span className="absolute top-0.5 right-0.5 bg-amber-500 text-black p-0.5 rounded-full shadow" title="Destaque">
                                <Star className="w-2.5 h-2.5 fill-black" />
                              </span>
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#f4efe8]">{product.name}</span>
                              {product.isFeatured && (
                                <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-semibold rounded uppercase">
                                  Destaque
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-[#8c786a] font-mono block">{product.slug}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-[#241c16] border border-[#3d2f26] text-xs font-medium text-[#e6dad0]">
                          {getCategoryName(product.categoryId)}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-4 font-bold text-[#f4efe8]">
                        {formatCentsToBRL(product.priceCents)}
                      </td>

                      {/* Variants Count */}
                      <td className="py-4 px-4 text-xs text-[#b8a698]">
                        {product.variants.length > 0 ? (
                          <span>{product.variants.length} opções</span>
                        ) : (
                          <span className="text-[#8c786a]">Padrão</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                            product.status === 'published'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : product.status === 'draft'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : 'bg-red-500/15 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {product.status === 'published' ? 'Publicado' : product.status === 'draft' ? 'Rascunho' : 'Arquivado'}
                        </span>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit */}
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="p-2 bg-[#241c16] hover:bg-[#2d231c] text-[#d9822b] border border-[#3d2f26] rounded-xl text-xs font-medium transition-all"
                            title="Editar produto"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicate(product.id)}
                            disabled={isBusy}
                            className="p-2 bg-[#241c16] hover:bg-[#2d231c] text-[#e6dad0] border border-[#3d2f26] rounded-xl text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
                            title="Duplicar produto"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Publish / Unpublish Toggle */}
                          {product.status === 'published' ? (
                            <button
                              onClick={() => handleStatusChange(product.id, 'draft')}
                              disabled={isBusy}
                              className="p-2 bg-amber-950/30 hover:bg-amber-900/40 text-amber-300 border border-amber-800/40 rounded-xl text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
                              title="Despublicar (Mover para Rascunho)"
                            >
                              <EyeOff className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(product.id, 'published')}
                              disabled={isBusy}
                              className="p-2 bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-300 border border-emerald-800/40 rounded-xl text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
                              title="Publicar produto"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}

                          {/* Archive */}
                          {product.status !== 'archived' && (
                            <button
                              onClick={() => handleStatusChange(product.id, 'archived')}
                              disabled={isBusy}
                              className="p-2 bg-red-950/30 hover:bg-red-900/40 text-red-300 border border-red-800/40 rounded-xl text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
                              title="Arquivar produto"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
