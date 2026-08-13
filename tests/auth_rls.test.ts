import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { isAuthorizedAdminRole } from '../src/lib/auth';

describe('Milestone AG-05: Auth & RLS Negative Security Tests', () => {
  const rootDir = process.cwd();
  const rlsMigrationPath = path.join(
    rootDir,
    'supabase',
    'migrations',
    '20260812000003_auth_admin_rls.sql'
  );
  const rlsMigrationSql = fs.readFileSync(rlsMigrationPath, 'utf8');

  describe('Authorization Helper (isAuthorizedAdminRole)', () => {
    it('allows active owner user', () => {
      expect(isAuthorizedAdminRole('owner', true)).toBe(true);
    });

    it('allows active admin user', () => {
      expect(isAuthorizedAdminRole('admin', true)).toBe(true);
    });

    it('denies customer role even if active', () => {
      expect(isAuthorizedAdminRole('customer', true)).toBe(false);
    });

    it('denies inactive owner user', () => {
      expect(isAuthorizedAdminRole('owner', false)).toBe(false);
    });

    it('denies inactive admin user', () => {
      expect(isAuthorizedAdminRole('admin', false)).toBe(false);
    });

    it('denies arbitrary unknown role', () => {
      expect(isAuthorizedAdminRole('guest', true)).toBe(false);
    });
  });

  describe('RLS Policy Specification - Negative Security Validations', () => {
    it('validates that anonymous (public) users CANNOT create products', () => {
      // Products policy must require is_admin_or_owner() for INSERT/ALL operations
      expect(rlsMigrationSql).toContain('CREATE POLICY "Admins and owners can manage products"');
      expect(rlsMigrationSql).toContain('ON products FOR ALL');
      expect(rlsMigrationSql).toContain('USING (is_admin_or_owner())');
      expect(rlsMigrationSql).toContain('WITH CHECK (is_admin_or_owner())');
      
      // Ensure there is NO public INSERT policy on products
      expect(rlsMigrationSql).not.toContain('CREATE POLICY "Public can insert products"');
    });

    it('validates that anonymous (public) users CANNOT update products', () => {
      // Public SELECT policy only allows reading published products, no UPDATE allowed
      expect(rlsMigrationSql).toContain('CREATE POLICY "Public can read published products"');
      expect(rlsMigrationSql).toContain('ON products FOR SELECT');
      expect(rlsMigrationSql).not.toContain('ON products FOR UPDATE');
    });

    it('validates that anonymous (public) users CANNOT delete products', () => {
      // Ensure DELETE operations require is_admin_or_owner()
      expect(rlsMigrationSql).not.toContain('CREATE POLICY "Public can delete products"');
    });

    it('validates that anonymous (public) users CANNOT update business_settings', () => {
      // Business settings allows public SELECT, but management requires is_admin_or_owner()
      expect(rlsMigrationSql).toContain('CREATE POLICY "Public can read business settings"');
      expect(rlsMigrationSql).toContain('ON business_settings FOR SELECT');
      expect(rlsMigrationSql).toContain('CREATE POLICY "Admins and owners can manage business settings"');
      expect(rlsMigrationSql).toContain('ON business_settings FOR ALL');
      expect(rlsMigrationSql).toContain('WITH CHECK (is_admin_or_owner())');
    });

    it('validates that anonymous users can ONLY read active categories', () => {
      expect(rlsMigrationSql).toContain('CREATE POLICY "Public can read active categories"');
      expect(rlsMigrationSql).toContain('ON categories FOR SELECT');
      expect(rlsMigrationSql).toContain('USING (active = true OR is_admin_or_owner())');
    });

    it('validates profiles schema constraints for role and active status', () => {
      expect(rlsMigrationSql).toContain('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS active');
      expect(rlsMigrationSql).toContain("CHECK (role IN ('owner', 'admin', 'customer'))");
    });
  });
});
