'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, KeyRound, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { signOutAdmin, updateAdminPassword, validateAdminPasswordReset } from '@/lib/auth';

export default function AdminResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg(null);

    const validationError = validateAdminPasswordReset(password, confirmation);
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setLoading(true);
    try {
      const result = await updateAdminPassword(password);
      if (result.error) {
        setErrorMsg(result.error);
        return;
      }

      await signOutAdmin();
      router.replace('/admin/login?password=updated');
      router.refresh();
    } catch {
      setErrorMsg('Não foi possível atualizar a senha. Solicite um novo link de recuperação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-admin-bg bg-[radial-gradient(ellipse_at_top,var(--admin-surface-hover)_0%,var(--admin-surface)_52%,var(--admin-bg)_100%)]">
      <div className="w-full max-w-md p-8 bg-admin-surface-raised border border-admin-border-strong rounded-admin-panel shadow-2xl backdrop-blur-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-admin-badge bg-admin-accent/10 border border-admin-accent/30 mb-4">
            <ShieldCheck className="w-7 h-7 text-admin-accent" />
          </div>
          <h1 className="text-2xl font-bold font-serif text-admin-text">Definir nova senha</h1>
          <p className="text-sm text-admin-text-secondary mt-2">
            Escolha uma senha exclusiva com pelo menos 8 caracteres.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="p-4 rounded-admin-card bg-status-danger/10 border border-status-danger/30 text-status-danger text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label htmlFor="new-password" className="block text-xs font-semibold uppercase tracking-wider text-admin-text-secondary mb-2">
              Nova senha
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-admin-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="new-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-admin-bg border border-admin-border-strong rounded-admin-input text-admin-text focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-xs font-semibold uppercase tracking-wider text-admin-text-secondary mb-2">
              Confirmar nova senha
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 text-admin-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="confirm-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-admin-bg border border-admin-border-strong rounded-admin-input text-admin-text focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-admin-accent to-admin-accent-hover text-white font-semibold rounded-admin-button shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            <span>{loading ? 'Atualizando...' : 'Atualizar senha'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
