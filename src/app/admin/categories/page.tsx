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
    <main data-testid="admin-categories-page" className="max-w-6xl mx-auto p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-admin-text">
            Gestão de Categorias
          </h1>
          <p className="text-sm text-admin-text-secondary">
            Organize as categorias para os produtos da doceria.
          </p>
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          data-testid="categories-create-toggle-button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-admin-accent hover:bg-admin-accent-hover text-white font-semibold rounded-admin-button text-sm transition-all shadow-md shadow-admin-accent/20 cursor-pointer shrink-0"
        >
          {isCreating ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{isCreating ? 'Cancelar' : 'Nova Categoria'}</span>
        </button>
      </div>

      {notification && (
        <div
          data-testid="categories-notification"
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

      {/* New Category Form Card */}
      {isCreating && (
        <form data-testid="category-create-form" onSubmit={handleCreateSubmit} className="bg-admin-surface-raised border border-admin-accent/40 p-6 rounded-admin-panel space-y-4 shadow-xl">
          <h2 className="text-lg font-serif font-bold text-admin-text">Cadastrar Nova Categoria</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-admin-text-muted">Nome *</label>
              <input
                data-testid="category-create-name-input"
                type="text"
                required
                placeholder="Ex: Especialidades"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (!newSlug) setNewSlug(generateSlug(e.target.value));
                }}
                className="w-full bg-admin-bg border border-admin-border-strong focus:border-admin-accent text-admin-text p-3 rounded-admin-input text-sm focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-admin-text-muted">Slug (URL)</label>
              <input
                data-testid="category-create-slug-input"
                type="text"
                placeholder="ex: especialidades"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                className="w-full bg-admin-bg border border-admin-border-strong focus:border-admin-accent text-admin-text p-3 rounded-admin-input text-sm font-mono focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-admin-text-muted">Ordem de Exibição</label>
              <input
                data-testid="category-create-order-input"
                type="number"
                value={newOrder}
                onChange={(e) => setNewOrder(e.target.value)}
                className="w-full bg-admin-bg border border-admin-border-strong focus:border-admin-accent text-admin-text p-3 rounded-admin-input text-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 text-sm text-admin-text-secondary cursor-pointer">
              <input
                data-testid="category-create-active-checkbox"
                type="checkbox"
                checked={newActive}
                onChange={(e) => setNewActive(e.target.checked)}
                className="accent-admin-accent"
              />
              <span>Categoria Ativa no Cardápio</span>
            </label>

            <button
              type="submit"
              data-testid="category-create-submit-button"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-admin-accent hover:bg-admin-accent-hover text-white font-semibold rounded-admin-button text-sm cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Salvar Categoria</span>
            </button>
          </div>
        </form>
      )}

      {/* Categories Table */}
      <div data-testid="categories-table-panel" className="bg-admin-surface-raised border border-admin-border-strong rounded-admin-panel shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-admin-text-secondary flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-admin-accent" />
            <span>Carregando categorias...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-admin-text-muted space-y-2">
            <FolderTree className="w-12 h-12 text-admin-text-muted mx-auto" />
            <p className="font-medium text-admin-text">Nenhuma categoria cadastrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-admin-border bg-admin-surface text-xs font-semibold uppercase text-admin-text-muted">
                  <th className="py-3.5 px-4">Ordem</th>
                  <th className="py-3.5 px-4">Nome da Categoria</th>
                  <th className="py-3.5 px-4">Slug</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {categories.map((cat) => {
                  const isEditing = editingId === cat.id;

                  return (
                    <tr key={cat.id} data-testid={`category-row-${cat.id}`} className="hover:bg-admin-surface-hover transition-colors">
                      {isEditing ? (
                        <>
                          <td className="py-3.5 px-4">
                            <input
                              data-testid={`category-edit-order-${cat.id}`}
                              type="number"
                              value={editOrder}
                              onChange={(e) => setEditOrder(e.target.value)}
                              className="w-16 bg-admin-bg border border-admin-border-strong p-1.5 rounded-admin-input text-xs"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <input
                              data-testid={`category-edit-name-${cat.id}`}
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full bg-admin-bg border border-admin-border-strong p-1.5 rounded-admin-input text-xs"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <input
                              data-testid={`category-edit-slug-${cat.id}`}
                              type="text"
                              value={editSlug}
                              onChange={(e) => setEditSlug(e.target.value)}
                              className="w-full bg-admin-bg border border-admin-border-strong p-1.5 rounded-admin-input text-xs font-mono"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-xs text-admin-text-muted">Editando...</span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={handleEditSubmit}
                                data-testid={`category-edit-save-${cat.id}`}
                                disabled={saving}
                                className="px-3 py-1 bg-status-success hover:bg-status-success/80 text-white rounded-admin-button text-xs font-semibold"
                              >
                                Salvar
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                data-testid={`category-edit-cancel-${cat.id}`}
                                className="px-3 py-1 bg-admin-surface-hover text-admin-text-secondary rounded-admin-button text-xs"
                              >
                                Cancelar
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3.5 px-4 font-mono text-xs text-admin-text-muted">
                            #{cat.displayOrder}
                          </td>
                          <td data-testid={`category-name-${cat.id}`} className="py-3.5 px-4 font-bold text-admin-text">
                            {cat.name}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-xs text-admin-text-secondary">
                            {cat.slug}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              data-testid={`category-status-${cat.id}`}
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-admin-badge text-xs font-semibold ${
                                cat.active
                                  ? 'bg-status-success/15 text-status-success border border-status-success/30'
                                  : 'bg-status-danger/15 text-status-danger border border-status-danger/30'
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
                                data-testid={`category-edit-${cat.id}`}
                                className="p-2 bg-admin-surface-hover hover:bg-admin-border text-admin-accent border border-admin-border-strong rounded-admin-button text-xs transition-all cursor-pointer"
                                title="Editar Categoria"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleToggleActive(cat)}
                                data-testid={`category-toggle-status-${cat.id}`}
                                className={`px-3 py-1.5 rounded-admin-button text-xs font-semibold transition-all cursor-pointer border ${
                                  cat.active
                                    ? 'bg-status-danger/10 text-status-danger border-status-danger/30 hover:bg-status-danger/15'
                                    : 'bg-status-success/10 text-status-success border-status-success/30 hover:bg-status-success/15'
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
