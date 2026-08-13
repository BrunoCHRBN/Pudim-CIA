import { describe, expect, it } from 'vitest';
import { validateAdminPasswordReset } from '../src/lib/auth';
import { getSafeAuthRedirectPath } from '../src/lib/auth-redirect';

describe('admin password recovery', () => {
  it('requires at least eight characters', () => {
    expect(validateAdminPasswordReset('short', 'short')).toBe(
      'A nova senha deve ter pelo menos 8 caracteres.'
    );
  });

  it('requires matching passwords', () => {
    expect(validateAdminPasswordReset('secure-pass', 'different-pass')).toBe(
      'As senhas informadas não coincidem.'
    );
  });

  it('accepts a valid matching password', () => {
    expect(validateAdminPasswordReset('secure-pass', 'secure-pass')).toBeNull();
  });

  it('allows only local callback destinations', () => {
    expect(getSafeAuthRedirectPath('/admin/reset-password')).toBe('/admin/reset-password');
    expect(getSafeAuthRedirectPath('https://attacker.example')).toBe('/admin');
    expect(getSafeAuthRedirectPath('//attacker.example')).toBe('/admin');
    expect(getSafeAuthRedirectPath('/\\attacker.example')).toBe('/admin');
  });
});
