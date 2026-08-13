import type { Metadata } from 'next';
import React from 'react';
import AdminNav from '@/components/admin/AdminNav';

export const metadata: Metadata = {
  title: 'Painel Administrativo | Pudim & CIA',
  description: 'Gestão de catálogo, pedidos e configurações do Pudim & CIA.',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-admin-bg text-admin-text flex flex-col font-sans selection:bg-admin-accent selection:text-white">
      <AdminNav />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
