'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInAdmin } from '@/lib/auth';
import { Lock, Mail, AlertCircle, ShieldCheck, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'unauthorized') {
      setErrorMsg('Acesso não autorizado. Sua conta não possui privilégios de administrador ativo.');
    } else if (errorParam === 'recovery') {
      setErrorMsg('O link de recuperação é inválido ou expirou. Solicite um novo link.');
    }

    if (searchParams.get('password') === 'updated') {
      setSuccessMsg('Senha atualizada. Entre novamente com a nova senha.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor, informe seu e-mail e senha.');
      return;
    }

    setLoading(true);

    try {
      const res = await signInAdmin(email.trim(), password);

      if (res.error) {
        setErrorMsg(res.error);
        setLoading(false);
        return;
      }

      const redirectPath = searchParams.get('redirect') || '/admin';
      router.push(redirectPath);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao realizar login.';
      setErrorMsg(message);
      setLoading(false);
    }
  };

  return (
    <div data-testid="admin-login-card" className="w-full max-w-md p-8 bg-admin-surface-raised border border-admin-border-strong rounded-admin-panel shadow-2xl backdrop-blur-md">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-admin-badge bg-admin-accent/10 border border-admin-accent/30 mb-4">
          <ShieldCheck className="w-7 h-7 text-admin-accent" />
        </div>
        <h1 data-testid="admin-login-title" className="text-2xl font-bold font-serif text-admin-text">Pudim & CIA</h1>
        <p className="text-sm text-admin-text-secondary mt-1">Autenticação Administrativa</p>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div
          id="login-error-alert"
          data-testid="admin-login-error-alert"
          className="mb-6 p-4 rounded-admin-card bg-status-danger/10 border border-status-danger/30 text-status-danger text-sm flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-status-danger shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 rounded-admin-card bg-status-success/10 border border-status-success/30 text-status-success text-sm flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="admin-email-input" className="block text-xs font-semibold uppercase tracking-wider text-admin-text-secondary mb-2">
            E-mail Administrativo
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-admin-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="admin-email-input"
              data-testid="admin-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@pudimecia.com.br"
              className="w-full pl-11 pr-4 py-3 bg-admin-bg border border-admin-border-strong rounded-admin-input text-admin-text placeholder-admin-text-muted focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-all text-sm"
            />
          </div>
          <div className="mt-2 text-right">
            <Link
              href="/admin/forgot-password"
              className="text-xs font-medium text-admin-accent hover:text-admin-accent-hover transition-colors"
            >
              Esqueci minha senha
            </Link>
          </div>
        </div>

        <div>
          <label htmlFor="admin-password-input" className="block text-xs font-semibold uppercase tracking-wider text-admin-text-secondary mb-2">
            Senha
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-admin-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="admin-password-input"
              data-testid="admin-password-input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-11 pr-4 py-3 bg-admin-bg border border-admin-border-strong rounded-admin-input text-admin-text placeholder-admin-text-muted focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-all text-sm"
            />
          </div>
        </div>

        <button
          id="admin-login-submit-btn"
          data-testid="admin-login-submit-button"
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-admin-accent to-admin-accent-hover hover:from-admin-accent hover:to-admin-accent-hover text-white font-semibold rounded-admin-button shadow-lg hover:shadow-orange-950/40 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Autenticando...</span>
            </>
          ) : (
            <>
              <span>Entrar no Painel</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer Info */}
      <div className="mt-8 pt-6 border-t border-admin-border-strong/50 text-center">
        <p className="text-xs text-admin-text-muted">
          Área restrita a colaboradores autorizados (Owner / Admin).
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div
      data-testid="admin-login-page"
      className="min-h-screen flex items-center justify-center p-4 bg-admin-bg bg-[radial-gradient(ellipse_at_top,var(--admin-surface-hover)_0%,var(--admin-surface)_52%,var(--admin-bg)_100%)]"
    >
      <Suspense fallback={
        <div className="text-admin-text-secondary flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-admin-accent" />
          <span>Carregando portal...</span>
        </div>
      }>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
