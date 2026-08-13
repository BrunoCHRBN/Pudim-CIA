'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { signOutAdmin } from '@/lib/auth';
import { LayoutDashboard, Package, FolderTree, Settings, LogOut, ShieldCheck, UserCheck } from 'lucide-react';
import { Profile } from '@/types/domain';

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setProfile({
            id: data.id,
            fullName: data.full_name,
            role: data.role,
            active: data.active,
            phone: data.phone,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
          });
        }
      }
    }
    loadUser();
  }, []);

  const publicAuthPaths = [
    '/admin/login',
    '/admin/forgot-password',
    '/admin/reset-password',
  ];

  // Authentication and recovery screens must not expose private navigation.
  if (publicAuthPaths.includes(pathname)) return null;

  const handleLogout = async () => {
    await signOutAdmin();
    router.push('/admin/login');
    router.refresh();
  };

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Produtos', icon: Package },
    { href: '/admin/categories', label: 'Categorias', icon: FolderTree },
    { href: '/admin/settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <header data-testid="admin-navigation" className="border-b border-admin-border bg-admin-surface sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Links */}
          <div className="flex items-center gap-6 md:gap-8">
            <Link href="/admin" data-testid="admin-brand-link" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-admin-card bg-admin-accent/15 border border-admin-accent/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 text-admin-accent" />
              </div>
              <div>
                <span className="font-serif font-bold text-base text-admin-text block leading-none">Pudim & CIA</span>
                <span className="text-[10px] text-admin-text-muted font-medium tracking-wider uppercase">Admin</span>
              </div>
            </Link>

            {/* Desktop Nav Items */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-testid={`admin-nav-desktop-${item.href === '/admin' ? 'dashboard' : item.href.split('/').pop()}`}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-admin-button text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-admin-accent text-white shadow-md shadow-admin-accent/20 font-semibold'
                        : 'text-admin-text-secondary hover:text-admin-text hover:bg-admin-surface-hover'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            {profile && (
              <div data-testid="admin-user-profile" className="hidden sm:flex items-center gap-2 text-xs bg-admin-surface-hover border border-admin-border-strong px-3 py-1.5 rounded-admin-card">
                <UserCheck className="w-3.5 h-3.5 text-status-success" />
                <span className="font-medium text-admin-text-secondary">{profile.fullName || profile.role}</span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded-admin-badge bg-admin-accent/20 text-admin-accent uppercase">
                  {profile.role}
                </span>
              </div>
            )}

            <button
              id="admin-logout-btn"
              data-testid="admin-logout-button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-status-danger/10 hover:bg-status-danger/15 text-status-danger border border-status-danger/30 rounded-admin-button text-xs sm:text-sm font-medium transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav Links Row */}
        <div className="flex md:hidden border-t border-admin-border py-2 overflow-x-auto scrollbar-none gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={`admin-nav-mobile-${item.href === '/admin' ? 'dashboard' : item.href.split('/').pop()}`}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-admin-button text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-admin-accent text-white font-semibold'
                    : 'text-admin-text-secondary hover:text-admin-text hover:bg-admin-surface-hover'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
