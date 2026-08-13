'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAdminStats, fetchAdminProducts, AdminStats } from '@/lib/admin';
import { Product } from '@/types/domain';
import { formatCentsToBRL } from '@/lib/formatters';
import { Package, FolderTree, CheckCircle2, FileText, Plus, Settings, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      try {
        const [sData, pData] = await Promise.all([
          fetchAdminStats(),
          fetchAdminProducts('all'),
        ]);
        if (!active) return;
        setStats(sData);
        setRecentProducts(pData.slice(0, 5));
      } catch {
        if (!active) return;
        setStats({ publishedProducts: 0, draftProducts: 0, archivedProducts: 0, totalCategories: 0 });
        setRecentProducts([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-admin-text-secondary">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-admin-accent" />
          <span>Carregando painel...</span>
        </div>
      </div>
    );
  }

  return (
    <main data-testid="admin-dashboard-page" className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-admin-surface-hover via-admin-surface to-admin-bg border border-admin-border-strong rounded-admin-panel p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-admin-badge bg-admin-accent/15 border border-admin-accent/30 text-admin-accent text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Visão Geral
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-admin-text">
              Dashboard Administrativo
            </h1>
            <p className="text-sm text-admin-text-secondary mt-1">
              Gerencie o catálogo de produtos, categorias e parâmetros operacionais do Pudim & CIA.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/admin/products/new"
              data-testid="dashboard-new-product-link"
              className="flex items-center gap-2 px-4 py-2.5 bg-admin-accent hover:bg-admin-accent-hover text-white rounded-admin-button text-sm font-semibold transition-all shadow-md shadow-admin-accent/20"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Produto</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Primary Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Published Products */}
        <div className="bg-admin-surface-raised border border-admin-border-strong p-6 rounded-admin-panel flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-admin-accent/40 transition-all">
          <div>
            <p className="text-xs uppercase tracking-wider text-admin-text-muted font-bold">Produtos Publicados</p>
            <p className="text-3xl font-bold text-admin-text mt-2 flex items-baseline gap-2">
              <span data-testid="dashboard-published-products-count">{stats?.publishedProducts ?? 0}</span>
              <span className="text-xs font-normal text-status-success">Ativos na loja</span>
            </p>
          </div>
          <div className="p-3.5 bg-status-success/10 rounded-admin-panel border border-status-success/20 text-status-success">
            <CheckCircle2 className="w-7 h-7" />
          </div>
        </div>

        {/* Draft Products */}
        <div className="bg-admin-surface-raised border border-admin-border-strong p-6 rounded-admin-panel flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-admin-accent/40 transition-all">
          <div>
            <p className="text-xs uppercase tracking-wider text-admin-text-muted font-bold">Produtos em Rascunho</p>
            <p className="text-3xl font-bold text-admin-text mt-2 flex items-baseline gap-2">
              <span data-testid="dashboard-draft-products-count">{stats?.draftProducts ?? 0}</span>
              <span className="text-xs font-normal text-status-warning">Em preparação</span>
            </p>
          </div>
          <div className="p-3.5 bg-status-warning/10 rounded-admin-panel border border-status-warning/20 text-status-warning">
            <FileText className="w-7 h-7" />
          </div>
        </div>

        {/* Categories */}
        <div className="bg-admin-surface-raised border border-admin-border-strong p-6 rounded-admin-panel flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-admin-accent/40 transition-all">
          <div>
            <p className="text-xs uppercase tracking-wider text-admin-text-muted font-bold">Categorias Cadastradas</p>
            <p className="text-3xl font-bold text-admin-text mt-2 flex items-baseline gap-2">
              <span data-testid="dashboard-categories-count">{stats?.totalCategories ?? 0}</span>
              <span className="text-xs font-normal text-admin-accent">Seções ativas</span>
            </p>
          </div>
          <div className="p-3.5 bg-admin-accent/10 rounded-admin-panel border border-admin-accent/20 text-admin-accent">
            <FolderTree className="w-7 h-7" />
          </div>
        </div>
      </section>

      {/* Quick Navigation Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/products"
          data-testid="dashboard-products-link"
          className="bg-admin-surface border border-admin-border-strong hover:border-admin-accent/60 p-5 rounded-admin-panel transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-admin-surface-hover border border-admin-border-strong rounded-admin-card text-admin-accent">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-admin-text group-hover:text-admin-accent transition-colors">Gerenciar Produtos</h3>
              <p className="text-xs text-admin-text-muted">Criar, editar e alterar status</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-admin-text-muted group-hover:text-admin-accent group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/admin/categories"
          data-testid="dashboard-categories-link"
          className="bg-admin-surface border border-admin-border-strong hover:border-admin-accent/60 p-5 rounded-admin-panel transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-admin-surface-hover border border-admin-border-strong rounded-admin-card text-admin-accent">
              <FolderTree className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-admin-text group-hover:text-admin-accent transition-colors">Gerenciar Categorias</h3>
              <p className="text-xs text-admin-text-muted">Organizar seções do cardápio</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-admin-text-muted group-hover:text-admin-accent group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/admin/settings"
          data-testid="dashboard-settings-link"
          className="bg-admin-surface border border-admin-border-strong hover:border-admin-accent/60 p-5 rounded-admin-panel transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-admin-surface-hover border border-admin-border-strong rounded-admin-card text-admin-accent">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-admin-text group-hover:text-admin-accent transition-colors">Configurações da Loja</h3>
              <p className="text-xs text-admin-text-muted">PIX, WhatsApp e Taxas</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-admin-text-muted group-hover:text-admin-accent group-hover:translate-x-1 transition-all" />
        </Link>
      </section>

      {/* Recent Products Section */}
      <section data-testid="dashboard-recent-products" className="bg-admin-surface-raised border border-admin-border-strong rounded-admin-panel p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif font-bold text-admin-text">Produtos Recentes</h2>
            <p className="text-xs text-admin-text-muted">Últimos itens cadastrados ou atualizados</p>
          </div>
          <Link
            href="/admin/products"
            data-testid="dashboard-view-all-products-link"
            className="text-xs font-semibold text-admin-accent hover:underline flex items-center gap-1"
          >
            Ver todos ({((stats?.publishedProducts ?? 0) + (stats?.draftProducts ?? 0) + (stats?.archivedProducts ?? 0))})
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentProducts.length === 0 ? (
          <div className="text-center py-8 text-admin-text-muted text-sm flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8 text-admin-text-muted" />
            Nenhum produto cadastrado até o momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-admin-border text-xs font-semibold uppercase text-admin-text-muted">
                  <th className="py-3 px-4">Produto</th>
                  <th className="py-3 px-4">Preço</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {recentProducts.map((product) => {
                  const primaryImg = product.images.find((i) => i.isPrimary)?.url || product.images[0]?.url;
                  return (
                    <tr key={product.id} className="hover:bg-admin-surface-hover transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-admin-input bg-admin-surface-hover border border-admin-border-strong overflow-hidden shrink-0 flex items-center justify-center">
                            {primaryImg ? (
                              <img src={primaryImg} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-admin-text-muted" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-admin-text block">{product.name}</span>
                            <span className="text-xs text-admin-text-muted">{product.slug}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-admin-text-secondary">
                        {formatCentsToBRL(product.priceCents)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
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

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/products/${product.id}`}
                          data-testid={`dashboard-edit-product-${product.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-admin-surface-hover hover:bg-admin-border text-admin-accent border border-admin-border-strong rounded-admin-button text-xs font-semibold transition-all"
                        >
                          Editar
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
