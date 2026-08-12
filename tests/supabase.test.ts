import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Supabase Migrations & Seed Verification', () => {
  const rootDir = process.cwd();
  const initialSchemaPath = path.join(
    rootDir,
    'supabase',
    'migrations',
    '20260812000001_initial_schema.sql'
  );
  const rlsPath = path.join(
    rootDir,
    'supabase',
    'migrations',
    '20260812000002_rls_policies.sql'
  );
  const seedPath = path.join(rootDir, 'supabase', 'seed.sql');

  it('contains initial_schema.sql defining all 6 required tables', () => {
    expect(fs.existsSync(initialSchemaPath)).toBe(true);
    const sql = fs.readFileSync(initialSchemaPath, 'utf8');

    expect(sql).toContain('CREATE TABLE IF NOT EXISTS profiles');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS categories');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS products');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS product_variants');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS product_images');
    expect(sql).toContain('CREATE TABLE IF NOT EXISTS business_settings');

    // Foreign Keys & Constraints
    expect(sql).toContain('REFERENCES auth.users(id)');
    expect(sql).toContain('REFERENCES categories(id)');
    expect(sql).toContain('REFERENCES products(id)');
    expect(sql).toContain('CHECK (price_cents >= 0)');
    expect(sql).toContain("CHECK (status IN ('draft', 'published', 'archived'))");
  });

  it('contains rls_policies.sql enabling RLS on all 6 tables', () => {
    expect(fs.existsSync(rlsPath)).toBe(true);
    const sql = fs.readFileSync(rlsPath, 'utf8');

    expect(sql).toContain('ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE categories ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE products ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;');
    expect(sql).toContain('ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;');

    // Policies
    expect(sql).toContain('Public can read published products');
    expect(sql).toContain('is_admin()');
  });

  it('contains seed.sql populating exact catalog and business settings', () => {
    expect(fs.existsSync(seedPath)).toBe(true);
    const sql = fs.readFileSync(seedPath, 'utf8');

    expect(sql).toContain('Pudim Clássico');
    expect(sql).toContain('Cones Trufados');
    expect(sql).toContain('Caixa de Trufas Gourmet');
    expect(sql).toContain('Tradicional de Leite Moça');
    expect(sql).toContain('Ninho com Nutella');
    expect(sql).toContain('Pudim & CIA');
    expect(sql).toContain('5516991359739');
  });
});
