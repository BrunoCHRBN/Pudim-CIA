'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Mail, ShieldCheck } from 'lucide-react';
import { requestAdminPasswordReset } from '@/lib/auth';

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const result = await requestAdminPasswordReset(email);
      if (result.error) {
        setErrorMsg(result.error);
        return;
      }

      setSent(true);
    } catch {
      setErrorMsg('Não foi possível enviar o e-mail de recuperação. Tente novamente em instantes.');
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
          <h1 className="text-2xl font-bold font-serif text-admin-text">Recuperar senha</h1>
          <p className="text-sm text-admin-text-secondary mt-2">
            Enviaremos um link seguro para o e-mail da conta administrativa.
          </p>
        </div>

        {sent ? (
          <div className="space-y-6">
            <div className="p-4 rounded-admin-card bg-status-success/10 border border-status-success/30 text-status-success text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <span>Se a conta estiver cadastrada, o link de recuperação chegará em alguns minutos.</span>
            </div>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="w-full py-3 px-4 border border-admin-border-strong text-admin-text rounded-admin-button hover:bg-admin-surface-hover transition-colors"
            >
              Enviar novamente
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="p-4 rounded-admin-card bg-status-danger/10 border border-status-danger/30 text-status-danger text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label htmlFor="recovery-email" className="block text-xs font-semibold uppercase tracking-wider text-admin-text-secondary mb-2">
                E-mail administrativo
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-admin-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="recovery-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seuemail@gmail.com"
                  className="w-full pl-11 pr-4 py-3 bg-admin-bg border border-admin-border-strong rounded-admin-input text-admin-text placeholder-admin-text-muted focus:outline-none focus:border-admin-accent focus:ring-1 focus:ring-admin-accent transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-admin-accent to-admin-accent-hover text-white font-semibold rounded-admin-button shadow-lg transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              <span>{loading ? 'Enviando...' : 'Enviar link de recuperação'}</span>
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-admin-border-strong/50 text-center">
          <Link href="/admin/login" className="inline-flex items-center gap-2 text-sm text-admin-accent hover:text-admin-accent-hover transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar para o login
          </Link>
        </div>
      </div>
    </div>
  );
}
