'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  fetchAdminProductById,
  fetchAdminCategories,
  updateAdminProduct,
  duplicateAdminProduct,
  uploadProductImage,
  generateSlug,
} from '@/lib/admin';
import { Category, ProductStatus } from '@/types/domain';
import {
  ArrowLeft,
  Save,
  Copy,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface VariantForm {
  name: string;
  sku: string;
  priceAdjustment: string;
  isAvailable: boolean;
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<ProductStatus>('draft');
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [variants, setVariants] = useState<VariantForm[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [cats, prod] = await Promise.all([
        fetchAdminCategories(),
        fetchAdminProductById(id),
      ]);

      setCategories(cats);

      if (!prod) {
        setError('Produto não encontrado.');
        setLoading(false);
        return;
      }

      setName(prod.name);
      setSlug(prod.slug);
      setShortDescription(prod.shortDescription || '');
      setDescription(prod.description || '');
      setPrice((prod.priceCents / 100).toFixed(2));
      setCategoryId(prod.categoryId);
      setStatus(prod.status);
      setIsFeatured(prod.isFeatured);

      const primaryImg = prod.images.find((i) => i.isPrimary)?.url || prod.images[0]?.url || '';
      setImageUrl(primaryImg);

      setVariants(
        prod.variants.map((v) => ({
          name: v.name,
          sku: v.sku || '',
          priceAdjustment: (v.priceAdjustmentCents / 100).toFixed(2),
          isAvailable: v.isAvailable,
        }))
      );

      setLoading(false);
    }

    loadData();
  }, [id]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);
    const res = await uploadProductImage(file);
    setUploadingImage(false);

    if (res.success && res.url) {
      setImageUrl(res.url);
      showNotification('success', 'Imagem enviada com sucesso!');
    } else {
      setError(res.error || 'Falha ao realizar upload da imagem.');
    }
  };

  const handleAddVariant = () => {
    setVariants([...variants, { name: '', sku: '', priceAdjustment: '0.00', isAvailable: true }]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, idx) => idx !== index));
  };

  const handleVariantChange = (index: number, field: keyof VariantForm, value: string | boolean) => {
    const updated = [...variants];
    const item = updated[index];
    if (!item) return;
    updated[index] = { ...item, [field]: value };
    setVariants(updated);
  };

  const handleDuplicate = async () => {
    setSaving(true);
    const res = await duplicateAdminProduct(id);
    setSaving(false);

    const dupProduct = res.data || res.newProduct;
    if (res.success && dupProduct) {
      showNotification('success', 'Produto duplicado com sucesso!');
      router.push(`/admin/products/${dupProduct.id}`);
    } else {
      setError(res.error || 'Erro ao duplicar produto.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome do produto é obrigatório.');
      return;
    }

    const numericPrice = parseFloat(price.replace(',', '.'));
    if (isNaN(numericPrice) || numericPrice < 0) {
      setError('Informe um preço válido.');
      return;
    }

    setSaving(true);
    setError(null);

    const priceCents = Math.round(numericPrice * 100);
    const formattedVariants = variants
      .filter((v) => v.name.trim() !== '')
      .map((v) => ({
        name: v.name.trim(),
        sku: v.sku.trim() || undefined,
        priceAdjustmentCents: Math.round((parseFloat(v.priceAdjustment.replace(',', '.')) || 0) * 100),
        isAvailable: v.isAvailable,
      }));

    const result = await updateAdminProduct(id, {
      name: name.trim(),
      slug: slug.trim() ? generateSlug(slug) : generateSlug(name),
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      priceCents,
      categoryId,
      status,
      isFeatured,
      imageUrl: imageUrl.trim() || undefined,
      variants: formattedVariants,
    });

    setSaving(false);

    if (result.success) {
      showNotification('success', 'Produto atualizado com sucesso!');
    } else {
      setError(result.error || 'Erro ao atualizar produto.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-[#b8a698]">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-[#d9822b]" />
          <span>Carregando dados do produto...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-6 md:p-8 space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/products"
            className="p-2.5 bg-[#1e1713] hover:bg-[#241c16] text-[#e6dad0] border border-[#3d2f26] rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#f4efe8]">
              Editar Produto
            </h1>
            <p className="text-xs text-[#8c786a] font-mono mt-0.5">ID: {id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDuplicate}
            disabled={saving}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#241c16] hover:bg-[#2d231c] text-[#e6dad0] border border-[#3d2f26] rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            <Copy className="w-4 h-4 text-[#d9822b]" />
            <span>Duplicar</span>
          </button>
        </div>
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

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 text-red-300 border border-red-800/50 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <section className="bg-[#1e1713] border border-[#3d2f26] p-6 rounded-2xl space-y-4 shadow-xl">
          <h2 className="text-lg font-serif font-bold text-[#f4efe8] border-b border-[#2d231c] pb-3">
            Informações Básicas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-[#8c786a]">Nome do Produto *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#140e0b] border border-[#3d2f26] focus:border-[#d9822b] text-[#f4efe8] p-3 rounded-xl text-sm focus:outline-none"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-[#8c786a]">Slug (URL)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-[#140e0b] border border-[#3d2f26] focus:border-[#d9822b] text-[#f4efe8] p-3 rounded-xl text-sm font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Preço */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-[#8c786a]">Preço (R$) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#8c786a] font-bold">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-[#140e0b] border border-[#3d2f26] focus:border-[#d9822b] text-[#f4efe8] pl-10 pr-3 py-3 rounded-xl text-sm font-bold focus:outline-none"
                />
              </div>
            </div>

            {/* Categoria */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-[#8c786a]">Categoria *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-[#140e0b] border border-[#3d2f26] focus:border-[#d9822b] text-[#f4efe8] p-3 rounded-xl text-sm focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-[#8c786a]">Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="w-full bg-[#140e0b] border border-[#3d2f26] focus:border-[#d9822b] text-[#f4efe8] p-3 rounded-xl text-sm font-semibold focus:outline-none"
              >
                <option value="published">Publicado</option>
                <option value="draft">Rascunho</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>
          </div>

          {/* Featured Checkbox */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded accent-[#d9822b] cursor-pointer"
            />
            <label htmlFor="isFeatured" className="text-sm font-medium text-[#e6dad0] cursor-pointer">
              Marcar como produto em destaque na página inicial
            </label>
          </div>
        </section>

        {/* Section 2: Descriptions */}
        <section className="bg-[#1e1713] border border-[#3d2f26] p-6 rounded-2xl space-y-4 shadow-xl">
          <h2 className="text-lg font-serif font-bold text-[#f4efe8] border-b border-[#2d231c] pb-3">
            Descrições
          </h2>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-[#8c786a]">Descrição Curta</label>
            <input
              type="text"
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full bg-[#140e0b] border border-[#3d2f26] focus:border-[#d9822b] text-[#f4efe8] p-3 rounded-xl text-sm focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-[#8c786a]">Descrição Completa</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#140e0b] border border-[#3d2f26] focus:border-[#d9822b] text-[#f4efe8] p-3 rounded-xl text-sm focus:outline-none resize-none"
            />
          </div>
        </section>

        {/* Section 3: Image Upload */}
        <section className="bg-[#1e1713] border border-[#3d2f26] p-6 rounded-2xl space-y-4 shadow-xl">
          <h2 className="text-lg font-serif font-bold text-[#f4efe8] border-b border-[#2d231c] pb-3 flex items-center justify-between">
            <span>Imagem do Produto</span>
            <span className="text-xs font-normal text-[#8c786a]">Supabase Storage</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-[#8c786a]">Upload de Arquivo</label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#3d2f26] hover:border-[#d9822b] rounded-2xl p-4 cursor-pointer bg-[#140e0b] transition-all text-center">
                  {uploadingImage ? (
                    <div className="flex items-center gap-2 text-[#d9822b] py-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-xs font-semibold">Enviando para Supabase Storage...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-[#d9822b] mb-1" />
                      <span className="text-xs font-semibold text-[#f4efe8]">Clique para alterar imagem</span>
                      <span className="text-[10px] text-[#8c786a]">PNG, JPG, WEBP até 5MB</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-[#8c786a]">Ou URL Externa</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-[#140e0b] border border-[#3d2f26] focus:border-[#d9822b] text-[#f4efe8] p-3 rounded-xl text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-[#8c786a]">Pré-visualização</label>
              <div className="h-44 rounded-2xl bg-[#140e0b] border border-[#3d2f26] overflow-hidden flex items-center justify-center relative">
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-[#8c786a] space-y-1">
                    <ImageIcon className="w-8 h-8 mx-auto opacity-50" />
                    <p className="text-xs">Nenhuma imagem selecionada</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Product Variants */}
        <section className="bg-[#1e1713] border border-[#3d2f26] p-6 rounded-2xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#2d231c] pb-3">
            <div>
              <h2 className="text-lg font-serif font-bold text-[#f4efe8]">Variantes do Produto</h2>
              <p className="text-xs text-[#8c786a]">Sabores, tamanhos ou opções adicionais</p>
            </div>

            <button
              type="button"
              onClick={handleAddVariant}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#241c16] hover:bg-[#2d231c] text-[#d9822b] border border-[#3d2f26] rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Variante</span>
            </button>
          </div>

          {variants.length === 0 ? (
            <p className="text-xs text-[#8c786a] italic text-center py-4">
              Nenhuma variante cadastrada.
            </p>
          ) : (
            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div key={idx} className="bg-[#140e0b] border border-[#3d2f26] p-4 rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Nome"
                    value={v.name}
                    onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                    className="bg-[#1e1713] border border-[#3d2f26] focus:border-[#d9822b] text-[#f4efe8] p-2.5 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="SKU"
                    value={v.sku}
                    onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                    className="bg-[#1e1713] border border-[#3d2f26] focus:border-[#d9822b] text-[#f4efe8] p-2.5 rounded-lg text-xs font-mono"
                  />
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#8c786a]">+R$</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={v.priceAdjustment}
                      onChange={(e) => handleVariantChange(idx, 'priceAdjustment', e.target.value)}
                      className="bg-[#1e1713] border border-[#3d2f26] focus:border-[#d9822b] text-[#f4efe8] pl-10 pr-2.5 py-2.5 rounded-lg text-xs w-full"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs text-[#e6dad0] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={v.isAvailable}
                        onChange={(e) => handleVariantChange(idx, 'isAvailable', e.target.checked)}
                        className="accent-[#d9822b]"
                      />
                      <span>Disponível</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="p-1.5 text-red-400 hover:bg-red-950/40 rounded-lg transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link
            href="/admin/products"
            className="px-5 py-3 bg-[#1e1713] hover:bg-[#241c16] text-[#e6dad0] border border-[#3d2f26] rounded-xl text-sm font-semibold transition-all"
          >
            Voltar
          </Link>

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
                <span>Salvar Alterações</span>
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
