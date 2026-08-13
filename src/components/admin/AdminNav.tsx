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

  // Hide nav on login page
  if (pathname === '/admin/login') return null;

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
    <header className="border-b border-[#2d231c] bg-[#1a1410] sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Links */}
          <div className="flex items-center gap-6 md:gap-8">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#d9822b]/15 border border-[#d9822b]/30 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 text-[#d9822b]" />
              </div>
              <div>
                <span className="font-serif font-bold text-base text-[#f4efe8] block leading-none">Pudim & CIA</span>
                <span className="text-[10px] text-[#8c786a] font-medium tracking-wider uppercase">Admin</span>
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
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#d9822b] text-white shadow-md shadow-[#d9822b]/20 font-semibold'
                        : 'text-[#b8a698] hover:text-[#f4efe8] hover:bg-[#241c16]'
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
              <div className="hidden sm:flex items-center gap-2 text-xs bg-[#241c16] border border-[#3d2f26] px-3 py-1.5 rounded-xl">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-medium text-[#e6dad0]">{profile.fullName || profile.role}</span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-[#d9822b]/20 text-[#d9822b] uppercase">
                  {profile.role}
                </span>
              </div>
            )}

            <button
              id="admin-logout-btn"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/30 hover:bg-red-900/40 text-red-300 border border-red-800/40 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* Mobile Nav Links Row */}
        <div className="flex md:hidden border-t border-[#2d231c] py-2 overflow-x-auto scrollbar-none gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-[#d9822b] text-white font-semibold'
                    : 'text-[#b8a698] hover:text-[#f4efe8] hover:bg-[#241c16]'
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
