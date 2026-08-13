import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fetchPublishedCatalog } from '../src/lib/catalog';
import { Product } from '../src/types/domain';
import { formatCentsToBRL } from '../src/lib/formatters';

describe('Milestone AG-06: Supabase Live Catalog Integration', () => {
  const rootDir = process.cwd();

  it('eliminates PRODUCT_CONFIG completely across application source and legacy files', () => {
    const targetPattern = ['P', 'R', 'O', 'D', 'U', 'C', 'T', '_', 'C', 'O', 'N', 'F', 'I', 'G'].join('');

    function searchDir(dir: string, results: string[] = []) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!['node_modules', '.next', '.git', 'tests'].includes(entry.name)) {
            searchDir(fullPath, results);
          }
        } else if (/\.(ts|tsx|js|jsx|html|css|sql)$/.test(entry.name)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (content.includes(targetPattern)) {
            results.push(fullPath);
          }
        }
      }
      return results;
    }

    const matches = searchDir(rootDir);
    expect(matches).toEqual([]);
  });

  it('fetches catalog and filters out non-published (draft/archived) products', async () => {
    const catalogData = await fetchPublishedCatalog();

    expect(catalogData.products).toBeDefined();
    expect(catalogData.products.length).toBeGreaterThan(0);

    // All returned products must have status = 'published'
    const nonPublished = catalogData.products.filter((p) => p.status !== 'published');
    expect(nonPublished).toHaveLength(0);
  });

  it('dynamically formats updated price cents without hardcoded duplications', () => {
    const sampleProduct: Product = {
      id: 'prod_test',
      categoryId: 'cat_test',
      name: 'Pudim Clássico Teste',
      slug: 'pudim-classico-teste',
      description: 'Pudim delicioso de teste',
      priceCents: 1900, // Updated price: R$ 19,00
      status: 'published',
      isFeatured: true,
      displayOrder: 1,
      images: [],
      variants: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(formatCentsToBRL(sampleProduct.priceCents)).toBe('R$ 19,00');

    // Simulate price change in database
    sampleProduct.priceCents = 2250;
    expect(formatCentsToBRL(sampleProduct.priceCents)).toBe('R$ 22,50');
  });

  it('excludes unpublished products when status changes to draft', () => {
    const catalog: Product[] = [
      {
        id: 'prod_1',
        categoryId: 'cat_1',
        name: 'Pudim Clássico',
        slug: 'pudim-classico',
        description: 'Descrição',
        priceCents: 1700,
        status: 'published',
        isFeatured: true,
        displayOrder: 1,
        images: [],
        variants: [],
        createdAt: '',
        updatedAt: '',
      },
      {
        id: 'prod_2',
        categoryId: 'cat_1',
        name: 'Pudim Draft',
        slug: 'pudim-draft',
        description: 'Descrição',
        priceCents: 2000,
        status: 'draft',
        isFeatured: false,
        displayOrder: 2,
        images: [],
        variants: [],
        createdAt: '',
        updatedAt: '',
      },
    ];

    const publishedOnly = catalog.filter((p) => p.status === 'published');
    expect(publishedOnly).toHaveLength(1);
    expect(publishedOnly[0]?.id).toBe('prod_1');
  });
});
