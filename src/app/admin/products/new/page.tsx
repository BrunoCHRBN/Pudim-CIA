'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchAdminCategories, createAdminProduct, uploadProductImage, generateSlug } from '@/lib/admin';
import { Category, ProductStatus } from '@/types/domain';
import { ArrowLeft, Save, Upload, Plus, Trash2, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';

interface VariantForm {
  name: string;
  sku: string;
  priceAdjustment: string; // e.g. "0.00" or "2.50"
  isAvailable: boolean;
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(''); // e.g. "17.00"
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<ProductStatus>('published');
  const [isFeatured, setIsFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [variants, setVariants] = useState<VariantForm[]>([]);

  useEffect(() => {
    async function loadCategories() {
      const cats = await fetchAdminCategories();
      setCategories(cats);
      if (cats.length > 0 && cats[0]) {
        setCategoryId(cats[0].id);
      }
      setLoadingCats(false);
    }
    loadCategories();
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(val));
    }
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

    if (!categoryId) {
      setError('Selecione uma categoria.');
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

    const result = await createAdminProduct({
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
      router.push('/admin/products');
      router.refresh();
    } else {
      setError(result.error || 'Erro ao criar produto.');
    }
  };

  return (
    <main data-testid="admin-new-product-page" className="max-w-4xl mx-auto p-6 md:p-8 space-y-6">
      {/* Back Button & Title */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          data-testid="new-product-back-link"
          className="p-2.5 bg-admin-surface-raised hover:bg-admin-surface-hover text-admin-text-secondary border border-admin-border-strong rounded-admin-button transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-admin-text">
            Novo Produto
          </h1>
          <p className="text-sm text-admin-text-secondary">Preencha as informações para cadastrar no catálogo.</p>
        </div>
      </div>

      {error && (
        <div data-testid="new-product-error-alert" className="p-4 rounded-admin-card bg-status-danger/10 text-status-danger border border-status-danger/30 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form data-testid="new-product-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <section className="bg-admin-surface-raised border border-admin-border-strong p-6 rounded-admin-panel space-y-4 shadow-xl">
          <h2 className="text-lg font-serif font-bold text-admin-text border-b border-admin-border pb-3">
            Informações Básicas
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nome */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-admin-text-muted">Nome do Produto *</label>
              <input
                data-testid="new-product-name-input"
                type="text"
                required
                placeholder="Ex: Pudim Clássico de Leite Condensado"
                value={name}
                onChange={handleNameChange}
                className="w-full bg-admin-bg border border-admin-border-strong focus:border-admin-accent text-admin-text p-3 rounded-admin-input text-sm focus:outline-none"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-admin-text-muted">Slug (URL)</label>
              <input
                data-testid="new-product-slug-input"
                type="text"
                placeholder="ex: pudim-classico"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full bg-admin-bg border border-admin-border-strong focus:border-admin-accent text-admin-text p-3 rounded-admin-input text-sm font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Preço */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-admin-text-muted">Preço (R$) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-admin-text-muted font-bold">R$</span>
                <input
                  data-testid="new-product-price-input"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="17.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-admin-bg border border-admin-border-strong focus:border-admin-accent text-admin-text pl-10 pr-3 py-3 rounded-admin-input text-sm font-bold focus:outline-none"
                />
              </div>
            </div>

            {/* Categoria */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-admin-text-muted">Categoria *</label>
              <select
                data-testid="new-product-category-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={loadingCats}
                className="w-full bg-admin-bg border border-admin-border-strong focus:border-admin-accent text-admin-text p-3 rounded-admin-input text-sm focus:outline-none"
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
              <label className="text-xs font-semibold uppercase text-admin-text-muted">Status Inicial *</label>
              <select
                data-testid="new-product-status-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="w-full bg-admin-bg border border-admin-border-strong focus:border-admin-accent text-admin-text p-3 rounded-admin-input text-sm font-semibold focus:outline-none"
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
              data-testid="new-product-featured-checkbox"
              type="checkbox"
              id="isFeatured"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="w-4 h-4 rounded-admin-input accent-admin-accent cursor-pointer"
            />
            <label htmlFor="isFeatured" className="text-sm font-medium text-admin-text-secondary cursor-pointer">
              Marcar como produto em destaque na página inicial
            </label>
          </div>
        </section>

        {/* Section 2: Descriptions */}
        <section className="bg-admin-surface-raised border border-admin-border-strong p-6 rounded-admin-panel space-y-4 shadow-xl">
          <h2 className="text-lg font-serif font-bold text-admin-text border-b border-admin-border pb-3">
            Descrições
          </h2>

          {/* Descrição Curta */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-admin-text-muted">Descrição Curta</label>
            <input
              data-testid="new-product-short-description-input"
              type="text"
              placeholder="Ex: Textura ultra aveludada com calda de caramelo brilhante."
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full bg-admin-bg border border-admin-border-strong focus:border-admin-accent text-admin-text p-3 rounded-admin-input text-sm focus:outline-none"
            />
          </div>

          {/* Descrição Completa */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-admin-text-muted">Descrição Completa</label>
            <textarea
              data-testid="new-product-description-textarea"
              rows={4}
              placeholder="Descreva detalhes como ingredientes, peso, sugestão de consumo..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-admin-bg border border-admin-border-strong focus:border-admin-accent text-admin-text p-3 rounded-admin-input text-sm focus:outline-none resize-none"
            />
          </div>
        </section>

        {/* Section 3: Image Upload */}
        <section className="bg-admin-surface-raised border border-admin-border-strong p-6 rounded-admin-panel space-y-4 shadow-xl">
          <h2 className="text-lg font-serif font-bold text-admin-text border-b border-admin-border pb-3 flex items-center justify-between">
            <span>Imagem do Produto</span>
            <span className="text-xs font-normal text-admin-text-muted">Supabase Storage</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Upload File or URL Input */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-admin-text-muted">Upload de Arquivo</label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-admin-border-strong hover:border-admin-accent rounded-admin-panel p-4 cursor-pointer bg-admin-bg transition-all text-center">
                  {uploadingImage ? (
                    <div className="flex items-center gap-2 text-admin-accent py-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-xs font-semibold">Enviando para Supabase Storage...</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-admin-accent mb-1" />
                      <span className="text-xs font-semibold text-admin-text">Clique para selecionar imagem</span>
                      <span className="text-[10px] text-admin-text-muted">PNG, JPG, WEBP até 5MB</span>
                    </>
                  )}
                  <input
                    data-testid="new-product-image-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-admin-text-muted">Ou URL Externa</label>
                <input
                  data-testid="new-product-image-url-input"
                  type="url"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-admin-bg border border-admin-border-strong focus:border-admin-accent text-admin-text p-3 rounded-admin-input text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Preview Box */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-admin-text-muted">Pré-visualização</label>
              <div className="h-44 rounded-admin-panel bg-admin-bg border border-admin-border-strong overflow-hidden flex items-center justify-center relative">
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-admin-text-muted space-y-1">
                    <ImageIcon className="w-8 h-8 mx-auto opacity-50" />
                    <p className="text-xs">Nenhuma imagem selecionada</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Product Variants */}
        <section className="bg-admin-surface-raised border border-admin-border-strong p-6 rounded-admin-panel space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-admin-border pb-3">
            <div>
              <h2 className="text-lg font-serif font-bold text-admin-text">Variantes do Produto</h2>
              <p className="text-xs text-admin-text-muted">Sabores, tamanhos ou opções adicionais</p>
            </div>

            <button
              type="button"
              onClick={handleAddVariant}
              data-testid="new-product-add-variant-button"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-admin-surface-hover hover:bg-admin-border text-admin-accent border border-admin-border-strong rounded-admin-button text-xs font-semibold transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Variante</span>
            </button>
          </div>

          {variants.length === 0 ? (
            <p className="text-xs text-admin-text-muted italic text-center py-4">
              Nenhuma variante cadastrada. O produto será oferecido apenas em sua versão padrão.
            </p>
          ) : (
            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div key={idx} className="bg-admin-bg border border-admin-border-strong p-4 rounded-admin-card grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
                  <input
                    data-testid={`new-product-variant-name-${idx}`}
                    type="text"
                    placeholder="Nome (ex: Ninho com Nutella)"
                    value={v.name}
                    onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                    className="bg-admin-surface-raised border border-admin-border-strong focus:border-admin-accent text-admin-text p-2.5 rounded-admin-input text-xs"
                  />
                  <input
                    data-testid={`new-product-variant-sku-${idx}`}
                    type="text"
                    placeholder="SKU (opcional)"
                    value={v.sku}
                    onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                    className="bg-admin-surface-raised border border-admin-border-strong focus:border-admin-accent text-admin-text p-2.5 rounded-admin-input text-xs font-mono"
                  />
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-admin-text-muted">+R$</span>
                    <input
                      data-testid={`new-product-variant-price-${idx}`}
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={v.priceAdjustment}
                      onChange={(e) => handleVariantChange(idx, 'priceAdjustment', e.target.value)}
                      className="bg-admin-surface-raised border border-admin-border-strong focus:border-admin-accent text-admin-text pl-10 pr-2.5 py-2.5 rounded-admin-input text-xs w-full"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs text-admin-text-secondary cursor-pointer">
                      <input
                        data-testid={`new-product-variant-available-${idx}`}
                        type="checkbox"
                        checked={v.isAvailable}
                        onChange={(e) => handleVariantChange(idx, 'isAvailable', e.target.checked)}
                        className="accent-admin-accent"
                      />
                      <span>Disponível</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      data-testid={`new-product-remove-variant-${idx}`}
                      className="p-1.5 text-status-danger hover:bg-status-danger/10 rounded-admin-button transition-all cursor-pointer"
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
            data-testid="new-product-cancel-link"
            className="px-5 py-3 bg-admin-surface-raised hover:bg-admin-surface-hover text-admin-text-secondary border border-admin-border-strong rounded-admin-button text-sm font-semibold transition-all"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={saving}
            data-testid="new-product-submit-button"
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
                <span>Salvar Produto</span>
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
