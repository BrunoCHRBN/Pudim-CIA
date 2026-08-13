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
    <main data-testid="admin-products-page" className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
      {/* Page Title & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-admin-text">
            Catálogo de Produtos
          </h1>
          <p className="text-sm text-admin-text-secondary">
            Crie, edite, duplique e ajuste a visibilidade dos produtos da loja.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          data-testid="products-create-link"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-admin-accent hover:bg-admin-accent-hover text-white font-semibold rounded-admin-button text-sm transition-all shadow-md shadow-admin-accent/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Novo Produto</span>
        </Link>
      </div>

      {/* Alert Notification Toast */}
      {notification && (
        <div
          data-testid="products-notification"
          className={`p-4 rounded-admin-card text-sm font-medium flex items-center justify-between transition-all ${
            notification.type === 'success'
              ? 'bg-status-success/10 text-status-success border border-status-success/30'
              : 'bg-status-danger/10 text-status-danger border border-status-danger/30'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-admin-surface-raised border border-admin-border-strong rounded-admin-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
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
              data-testid={`products-filter-${tab.id}`}
              className={`px-3.5 py-1.5 rounded-admin-button text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-admin-accent text-white shadow-sm'
                  : 'bg-admin-surface-hover text-admin-text-secondary hover:text-admin-text border border-admin-border-strong'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-80">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-admin-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              data-testid="products-search-input"
              type="text"
              placeholder="Buscar por nome ou slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-admin-bg border border-admin-border-strong focus:border-admin-accent text-admin-text placeholder-admin-text-muted pl-9 pr-3 py-2 rounded-admin-input text-sm focus:outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            data-testid="products-search-button"
            className="px-3.5 py-2 bg-admin-surface-hover hover:bg-admin-border text-admin-text-secondary border border-admin-border-strong rounded-admin-button text-xs font-semibold shrink-0 cursor-pointer"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Products Table */}
      <div data-testid="products-table-panel" className="bg-admin-surface-raised border border-admin-border-strong rounded-admin-panel shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-admin-text-secondary flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-admin-accent" />
            <span>Carregando produtos...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-admin-text-muted space-y-3">
            <Package className="w-12 h-12 text-admin-text-muted mx-auto" />
            <p className="font-medium text-admin-text">Nenhum produto encontrado</p>
            <p className="text-xs">Tente ajustar o filtro de status ou termo de busca.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-admin-border bg-admin-surface text-xs font-semibold uppercase text-admin-text-muted">
                  <th className="py-3.5 px-4">Produto</th>
                  <th className="py-3.5 px-4">Categoria</th>
                  <th className="py-3.5 px-4">Preço</th>
                  <th className="py-3.5 px-4">Variantes</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {products.map((product) => {
                  const primaryImg = product.images.find((i) => i.isPrimary)?.url || product.images[0]?.url;
                  const isBusy = actionLoadingId === product.id;

                  return (
                    <tr key={product.id} data-testid={`product-row-${product.id}`} className="hover:bg-admin-surface-hover transition-colors">
                      {/* Product Thumbnail & Details */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-admin-card bg-admin-bg border border-admin-border-strong overflow-hidden shrink-0 flex items-center justify-center relative">
                            {primaryImg ? (
                              <img src={primaryImg} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-6 h-6 text-admin-text-muted" />
                            )}
                            {product.isFeatured && (
                              <span className="absolute top-0.5 right-0.5 bg-status-warning text-black p-0.5 rounded-admin-badge shadow" title="Destaque">
                                <Star className="w-2.5 h-2.5 fill-black" />
                              </span>
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span data-testid={`product-name-${product.id}`} className="font-bold text-admin-text">{product.name}</span>
                              {product.isFeatured && (
                                <span className="px-1.5 py-0.5 bg-status-warning/20 text-status-warning text-[10px] font-semibold rounded-admin-badge uppercase">
                                  Destaque
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-admin-text-muted font-mono block">{product.slug}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-admin-input bg-admin-surface-hover border border-admin-border-strong text-xs font-medium text-admin-text-secondary">
                          {getCategoryName(product.categoryId)}
                        </span>
                      </td>

                      {/* Price */}
                      <td data-testid={`product-price-${product.id}`} className="py-4 px-4 font-bold text-admin-text">
                        {formatCentsToBRL(product.priceCents)}
                      </td>

                      {/* Variants Count */}
                      <td className="py-4 px-4 text-xs text-admin-text-secondary">
                        {product.variants.length > 0 ? (
                          <span>{product.variants.length} opções</span>
                        ) : (
                          <span className="text-admin-text-muted">Padrão</span>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4">
                        <span
                          data-testid={`product-status-${product.id}`}
                          className={`inline-flex items-center px-2.5 py-1 rounded-admin-badge text-xs font-semibold uppercase tracking-wider ${
                            product.status === 'published'
                              ? 'bg-status-success/15 text-status-success border border-status-success/30'
                              : product.status === 'draft'
                              ? 'bg-status-warning/15 text-status-warning border border-status-warning/30'
                              : 'bg-status-danger/15 text-status-danger border border-status-danger/30'
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
                            data-testid={`product-edit-${product.id}`}
                            className="p-2 bg-admin-surface-hover hover:bg-admin-border text-admin-accent border border-admin-border-strong rounded-admin-button text-xs font-medium transition-all"
                            title="Editar produto"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>

                          {/* Duplicate */}
                          <button
                            onClick={() => handleDuplicate(product.id)}
                            data-testid={`product-duplicate-${product.id}`}
                            disabled={isBusy}
                            className="p-2 bg-admin-surface-hover hover:bg-admin-border text-admin-text-secondary border border-admin-border-strong rounded-admin-button text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
                            title="Duplicar produto"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Publish / Unpublish Toggle */}
                          {product.status === 'published' ? (
                            <button
                              onClick={() => handleStatusChange(product.id, 'draft')}
                              data-testid={`product-unpublish-${product.id}`}
                              disabled={isBusy}
                              className="p-2 bg-status-warning/10 hover:bg-status-warning/15 text-status-warning border border-status-warning/30 rounded-admin-button text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
                              title="Despublicar (Mover para Rascunho)"
                            >
                              <EyeOff className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(product.id, 'published')}
                              data-testid={`product-publish-${product.id}`}
                              disabled={isBusy}
                              className="p-2 bg-status-success/10 hover:bg-status-success/15 text-status-success border border-status-success/30 rounded-admin-button text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
                              title="Publicar produto"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}

                          {/* Archive */}
                          {product.status !== 'archived' && (
                            <button
                              onClick={() => handleStatusChange(product.id, 'archived')}
                              data-testid={`product-archive-${product.id}`}
                              disabled={isBusy}
                              className="p-2 bg-status-danger/10 hover:bg-status-danger/15 text-status-danger border border-status-danger/30 rounded-admin-button text-xs font-medium transition-all cursor-pointer disabled:opacity-50"
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
