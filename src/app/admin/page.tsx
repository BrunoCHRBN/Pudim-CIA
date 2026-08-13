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
      <div className="min-h-[60vh] flex items-center justify-center text-[#b8a698]">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#d9822b]" />
          <span>Carregando painel...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-8">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-[#241c16] via-[#1a1410] to-[#140e0b] border border-[#3d2f26] rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#d9822b]/15 border border-[#d9822b]/30 text-[#d9822b] text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Visão Geral
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#f4efe8]">
              Dashboard Administrativo
            </h1>
            <p className="text-sm text-[#b8a698] mt-1">
              Gerencie o catálogo de produtos, categorias e parâmetros operacionais do Pudim & CIA.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/admin/products/new"
              className="flex items-center gap-2 px-4 py-2.5 bg-[#d9822b] hover:bg-[#c2711e] text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-[#d9822b]/20"
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
        <div className="bg-[#1e1713] border border-[#3d2f26] p-6 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-[#d9822b]/40 transition-all">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#8c786a] font-bold">Produtos Publicados</p>
            <p className="text-3xl font-bold text-[#f4efe8] mt-2 flex items-baseline gap-2">
              {stats?.publishedProducts ?? 0}
              <span className="text-xs font-normal text-emerald-400">Ativos na loja</span>
            </p>
          </div>
          <div className="p-3.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
            <CheckCircle2 className="w-7 h-7" />
          </div>
        </div>

        {/* Draft Products */}
        <div className="bg-[#1e1713] border border-[#3d2f26] p-6 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-[#d9822b]/40 transition-all">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#8c786a] font-bold">Produtos em Rascunho</p>
            <p className="text-3xl font-bold text-[#f4efe8] mt-2 flex items-baseline gap-2">
              {stats?.draftProducts ?? 0}
              <span className="text-xs font-normal text-amber-400">Em preparação</span>
            </p>
          </div>
          <div className="p-3.5 bg-amber-500/10 rounded-2xl border border-amber-500/20 text-amber-400">
            <FileText className="w-7 h-7" />
          </div>
        </div>

        {/* Categories */}
        <div className="bg-[#1e1713] border border-[#3d2f26] p-6 rounded-2xl flex items-center justify-between shadow-lg relative overflow-hidden group hover:border-[#d9822b]/40 transition-all">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#8c786a] font-bold">Categorias Cadastradas</p>
            <p className="text-3xl font-bold text-[#f4efe8] mt-2 flex items-baseline gap-2">
              {stats?.totalCategories ?? 0}
              <span className="text-xs font-normal text-[#d9822b]">Seções ativas</span>
            </p>
          </div>
          <div className="p-3.5 bg-[#d9822b]/10 rounded-2xl border border-[#d9822b]/20 text-[#d9822b]">
            <FolderTree className="w-7 h-7" />
          </div>
        </div>
      </section>

      {/* Quick Navigation Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/products"
          className="bg-[#1a1410] border border-[#3d2f26] hover:border-[#d9822b]/60 p-5 rounded-2xl transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#241c16] border border-[#3d2f26] rounded-xl text-[#d9822b]">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-[#f4efe8] group-hover:text-[#d9822b] transition-colors">Gerenciar Produtos</h3>
              <p className="text-xs text-[#8c786a]">Criar, editar e alterar status</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-[#8c786a] group-hover:text-[#d9822b] group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/admin/categories"
          className="bg-[#1a1410] border border-[#3d2f26] hover:border-[#d9822b]/60 p-5 rounded-2xl transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#241c16] border border-[#3d2f26] rounded-xl text-[#d9822b]">
              <FolderTree className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-[#f4efe8] group-hover:text-[#d9822b] transition-colors">Gerenciar Categorias</h3>
              <p className="text-xs text-[#8c786a]">Organizar seções do cardápio</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-[#8c786a] group-hover:text-[#d9822b] group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/admin/settings"
          className="bg-[#1a1410] border border-[#3d2f26] hover:border-[#d9822b]/60 p-5 rounded-2xl transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#241c16] border border-[#3d2f26] rounded-xl text-[#d9822b]">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-[#f4efe8] group-hover:text-[#d9822b] transition-colors">Configurações da Loja</h3>
              <p className="text-xs text-[#8c786a]">PIX, WhatsApp e Taxas</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-[#8c786a] group-hover:text-[#d9822b] group-hover:translate-x-1 transition-all" />
        </Link>
      </section>

      {/* Recent Products Section */}
      <section className="bg-[#1e1713] border border-[#3d2f26] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#f4efe8]">Produtos Recentes</h2>
            <p className="text-xs text-[#8c786a]">Últimos itens cadastrados ou atualizados</p>
          </div>
          <Link
            href="/admin/products"
            className="text-xs font-semibold text-[#d9822b] hover:underline flex items-center gap-1"
          >
            Ver todos ({((stats?.publishedProducts ?? 0) + (stats?.draftProducts ?? 0) + (stats?.archivedProducts ?? 0))})
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentProducts.length === 0 ? (
          <div className="text-center py-8 text-[#8c786a] text-sm flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8 text-[#8c786a]" />
            Nenhum produto cadastrado até o momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#2d231c] text-xs font-semibold uppercase text-[#8c786a]">
                  <th className="py-3 px-4">Produto</th>
                  <th className="py-3 px-4">Preço</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d231c]">
                {recentProducts.map((product) => {
                  const primaryImg = product.images.find((i) => i.isPrimary)?.url || product.images[0]?.url;
                  return (
                    <tr key={product.id} className="hover:bg-[#241c16] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#241c16] border border-[#3d2f26] overflow-hidden shrink-0 flex items-center justify-center">
                            {primaryImg ? (
                              <img src={primaryImg} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-[#8c786a]" />
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-[#f4efe8] block">{product.name}</span>
                            <span className="text-xs text-[#8c786a]">{product.slug}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-[#e6dad0]">
                        {formatCentsToBRL(product.priceCents)}
                      </td>

                      <td className="py-3.5 px-4">
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

                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#241c16] hover:bg-[#2d231c] text-[#d9822b] border border-[#3d2f26] rounded-xl text-xs font-semibold transition-all"
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
