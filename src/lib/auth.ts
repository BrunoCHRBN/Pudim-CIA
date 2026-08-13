import { createClient } from './supabase/client';
import { Profile, UserRole } from '@/types/domain';

export interface AuthResult {
  error?: string;
  success?: boolean;
  profile?: Profile;
}

export function validateAdminPasswordReset(password: string, confirmation: string): string | null {
  if (password.length < 8) {
    return 'A nova senha deve ter pelo menos 8 caracteres.';
  }

  if (password !== confirmation) {
    return 'As senhas informadas não coincidem.';
  }

  return null;
}

export async function requestAdminPasswordReset(email: string): Promise<AuthResult> {
  const supabase = createClient();
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const siteUrl = (configuredSiteUrl || window.location.origin).replace(/\/$/, '');
  const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent('/admin/reset-password')}`;

  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo,
  });

  if (error) {
    return { error: 'Não foi possível enviar o e-mail de recuperação. Tente novamente em instantes.' };
  }

  return { success: true };
}

export async function updateAdminPassword(password: string): Promise<AuthResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: 'Não foi possível atualizar a senha. Solicite um novo link de recuperação.' };
  }

  return { success: true };
}

export async function signInAdmin(email: string, password: string): Promise<AuthResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  // Dev-only fallback: bypass Supabase when not configured (never runs in production)
  if (
    process.env.NODE_ENV !== 'production' &&
    (!supabaseUrl || supabaseUrl.includes('placeholder.supabase.co'))
  ) {
    if (email.trim() && password.trim()) {
      if (typeof document !== 'undefined') {
        document.cookie = 'admin_session_active=true; path=/; max-age=86400';
      }
      return {
        success: true,
        profile: {
          id: 'mock-admin-id',
          fullName: 'Administrador Demo',
          role: 'owner',
          active: true,
          phone: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }
    return { error: 'Por favor, informe seu e-mail e senha.' };
  }

  const supabase = createClient();

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError || !authData.user) {
    return {
      error: authError?.message || 'Falha ao autenticar. Verifique suas credenciais.',
    };
  }

  // Fetch user profile from Supabase
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (profileError || !profileData) {
    await supabase.auth.signOut();
    return {
      error: 'Perfil de usuário não encontrado. Entre em contato com o suporte.',
    };
  }

  const role: UserRole = profileData.role;
  const active: boolean = profileData.active ?? true;

  const isAuthorized = (role === 'owner' || role === 'admin') && active;

  if (!isAuthorized) {
    await supabase.auth.signOut();
    return {
      error: 'Acesso negado. Apenas administradores e proprietários ativos possuem permissão.',
    };
  }

  const profile: Profile = {
    id: profileData.id,
    fullName: profileData.full_name,
    role: profileData.role,
    active: profileData.active,
    phone: profileData.phone,
    createdAt: profileData.created_at,
    updatedAt: profileData.updated_at,
  };

  if (typeof document !== 'undefined') {
    document.cookie = 'admin_session_active=true; path=/; max-age=86400';
  }

  return {
    success: true,
    profile,
  };
}

export async function signOutAdmin(): Promise<{ error?: string }> {
  if (typeof document !== 'undefined') {
    document.cookie = 'admin_session_active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
  const supabase = createClient();
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { error: error.message };
  } catch {
    // Ignore error in fallback mode
  }
  return {};
}

export function isAuthorizedAdminRole(role: string, active: boolean): boolean {
  return (role === 'owner' || role === 'admin') && active === true;
}
