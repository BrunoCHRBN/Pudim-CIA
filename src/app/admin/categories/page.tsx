'use client';

import React, { useEffect, useState } from 'react';
import { fetchAdminCategories, createAdminCategory, updateAdminCategory, generateSlug } from '@/lib/admin';
import { Category } from '@/types/domain';
import { FolderTree, Plus, Edit2, CheckCircle2, XCircle, Loader2, AlertCircle, Save, X } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Category Form State
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newOrder, setNewOrder] = useState('1');
  const [newActive, setNewActive] = useState(true);

  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editOrder, setEditOrder] = useState('1');

  const loadCategories = async () => {
    setLoading(true);
    const data = await fetchAdminCategories();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showNotification('error', 'Informe o nome da categoria.');
      return;
    }

    setSaving(true);
    const res = await createAdminCategory({
      name: newName.trim(),
      slug: newSlug.trim() ? generateSlug(newSlug) : generateSlug(newName),
      displayOrder: parseInt(newOrder, 10) || 0,
      active: newActive,
    });
    setSaving(false);

    if (res.success) {
      showNotification('success', 'Categoria criada com sucesso!');
      setNewName('');
      setNewSlug('');
      setIsCreating(false);
      await loadCategories();
    } else {
      showNotification('error', res.error || 'Erro ao criar categoria.');
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditOrder(cat.displayOrder.toString());
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editName.trim()) return;

    setSaving(true);
    const res = await updateAdminCategory(editingId, {
      name: editName.trim(),
      slug: editSlug.trim() ? generateSlug(editSlug) : generateSlug(editName),
      displayOrder: parseInt(editOrder, 10) || 0,
    });
    setSaving(false);

    if (res.success) {
      showNotification('success', 'Categoria atualizada com sucesso!');
      setEditingId(null);
      await loadCategories();
    } else {
      showNotification('error', res.error || 'Erro ao atualizar categoria.');
    }
  };

  const handleToggleActive = async (cat: Category) => {
    setSaving(true);
    const res = await updateAdminCategory(cat.id, { active: !cat.active });
    setSaving(false);

    if (res.success) {
      showNotification('success', `Categoria ${!cat.active ? 'ativada' : 'desativada'} com sucesso!`);
      await loadCategories();
    } else {
      showNotification('error', res.error || 'Erro ao alterar status da categoria.');
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#f4efe8]">
            Gestão de Categorias
          </h1>
          <p className="text-sm text-[#b8a698]">
            Organize as categorias para os produtos da doceria.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#d9822b] hover:bg-[#c2711e] text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-[#d9822b]/20 cursor-pointer shrink-0"
        >
          {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isCreating ? 'Cancelar' : 'Nova Categoria'}</span>
        </button>
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

      {/* New Category Form Card */}
      {isCreating && (
        <form onSubmit={handleCreateSubmit} className="bg-[#1e1713] border border-[#d9822b]/40 p-6 rounded-2xl space-y-4 shadow-xl">
          <h2 className="text-lg font-serif font-bold text-[#f4efe8]">Cadastrar Nova Categoria</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-[#8c786a]">Nome *</label>
              <input
                type="text"
                required
                placeholder="Ex: Especialidades"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (!newSlug) setNewSlug(generateSlug(e.target.value));
                }}
                className="w-full bg-[#140e0b] border border-[#3d2f26] focus:border-[#d9822b] text-[#f4efe8] p-3 rounded-xl text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-[#8c786a]">Slug (URL)</label>
              <input
                type="text"
                placeholder="ex: especialidades"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                className="w-full bg-[#140e0b] border border-[#3d2f26] focus:border-[#d9822b] text-[#f4efe8] p-3 rounded-xl text-sm font-mono focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-[#8c786a]">Ordem de Exibição</label>
              <input
                type="number"
                value={newOrder}
                onChange={(e) => setNewOrder(e.target.value)}
                className="w-full bg-[#140e0b] border border-[#3d2f26] focus:border-[#d9822b] text-[#f4efe8] p-3 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-sm text-[#e6dad0] cursor-pointer">
              <input
                type="checkbox"
                checked={newActive}
                onChange={(e) => setNewActive(e.target.checked)}
                className="accent-[#d9822b]"
              />
              <span>Categoria Ativa no Cardápio</span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#d9822b] hover:bg-[#c2711e] text-white font-semibold rounded-xl text-sm cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Salvar Categoria</span>
            </button>
          </div>
        </form>
      )}

      {/* Categories Table */}
      <div className="bg-[#1e1713] border border-[#3d2f26] rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#b8a698] flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#d9822b]" />
            <span>Carregando categorias...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-[#8c786a] space-y-2">
            <FolderTree className="w-12 h-12 text-[#8c786a] mx-auto" />
            <p className="font-medium text-[#f4efe8]">Nenhuma categoria cadastrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#2d231c] bg-[#1a1410] text-xs font-semibold uppercase text-[#8c786a]">
                  <th className="py-3.5 px-4">Ordem</th>
                  <th className="py-3.5 px-4">Nome da Categoria</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d231c]">
                {categories.map((cat) => {
                  const isEditing = editingId === cat.id;

                  return (
                    <tr key={cat.id} className="hover:bg-[#241c16] transition-colors">
                      {isEditing ? (
                        <>
                          <td className="py-3.5 px-4">
                            <input
                              type="number"
                              value={editOrder}
                              onChange={(e) => setEditOrder(e.target.value)}
                              className="w-16 bg-[#140e0b] border border-[#3d2f26] p-1.5 rounded-lg text-xs"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full bg-[#140e0b] border border-[#3d2f26] p-1.5 rounded-lg text-xs"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <input
                              type="text"
                              value={editSlug}
                              onChange={(e) => setEditSlug(e.target.value)}
                              className="w-full bg-[#140e0b] border border-[#3d2f26] p-1.5 rounded-lg text-xs font-mono"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs text-[#8c786a]">Editando...</span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={handleEditSubmit}
                                disabled={saving}
                                className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                              >
                                Salvar
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1 bg-[#241c16] text-[#b8a698] rounded-lg text-xs"
                              >
                                Cancelar
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3.5 px-4 font-mono text-xs text-[#8c786a]">
                            #{cat.displayOrder}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-[#f4efe8]">
                            {cat.name}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-[#b8a698]">
                            {cat.slug}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                cat.active
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-red-500/15 text-red-400 border border-red-500/30'
                              }`}
                            >
                              {cat.active ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3" /> Ativa
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3" /> Inativa
                                </>
                              )}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => startEdit(cat)}
                                className="p-2 bg-[#241c16] hover:bg-[#2d231c] text-[#d9822b] border border-[#3d2f26] rounded-xl text-xs transition-all cursor-pointer"
                                title="Editar Categoria"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleToggleActive(cat)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                                  cat.active
                                    ? 'bg-red-950/30 text-red-300 border-red-800/40 hover:bg-red-900/40'
                                    : 'bg-emerald-950/30 text-emerald-300 border-emerald-800/40 hover:bg-emerald-900/40'
                                }`}
                              >
                                {cat.active ? 'Desativar' : 'Ativar'}
                              </button>
                            </div>
                          </td>
                        </>
                      )}
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
