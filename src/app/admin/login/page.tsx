'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInAdmin } from '@/lib/auth';
import { Lock, Mail, AlertCircle, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'unauthorized') {
      setErrorMsg('Acesso não autorizado. Sua conta não possui privilégios de administrador ativo.');
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
    <div className="w-full max-w-md p-8 bg-[#1e1713] border border-[#3d2f26] rounded-2xl shadow-2xl backdrop-blur-md">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#d9822b]/10 border border-[#d9822b]/30 mb-4">
          <ShieldCheck className="w-7 h-7 text-[#d9822b]" />
        </div>
        <h1 className="text-2xl font-bold font-serif text-[#f4efe8]">Pudim & CIA</h1>
        <p className="text-sm text-[#b8a698] mt-1">Autenticação Administrativa</p>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div
          id="login-error-alert"
          className="mb-6 p-4 rounded-xl bg-red-900/20 border border-red-500/30 text-red-200 text-sm flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-[#b8a698] mb-2">
            E-mail Administrativo
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 text-[#8c786a] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="admin-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@pudimecia.com.br"
              className="w-full pl-11 pr-4 py-3 bg-[#140e0b] border border-[#3d2f26] rounded-xl text-[#f4efe8] placeholder-[#6e5d50] focus:outline-none focus:border-[#d9822b] focus:ring-1 focus:ring-[#d9822b] transition-all text-sm"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password font-semibold" className="block text-xs font-semibold uppercase tracking-wider text-[#b8a698] mb-2">
            Senha
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 text-[#8c786a] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="admin-password-input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-11 pr-4 py-3 bg-[#140e0b] border border-[#3d2f26] rounded-xl text-[#f4efe8] placeholder-[#6e5d50] focus:outline-none focus:border-[#d9822b] focus:ring-1 focus:ring-[#d9822b] transition-all text-sm"
            />
          </div>
        </div>

        <button
          id="admin-login-submit-btn"
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-[#d9822b] to-[#b36317] hover:from-[#e58e35] hover:to-[#c46f1f] text-white font-semibold rounded-xl shadow-lg hover:shadow-orange-950/40 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
      <div className="mt-8 pt-6 border-t border-[#3d2f26]/50 text-center">
        <p className="text-xs text-[#8c786a]">
          Área restrita a colaboradores autorizados (Owner / Admin).
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2a1d15] via-[#140d0a] to-[#090604]">
      <Suspense fallback={
        <div className="text-[#b8a698] flex items-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#d9822b]" />
          <span>Carregando portal...</span>
        </div>
      }>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
