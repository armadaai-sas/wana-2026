'use client';

import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import ChangePasswordForm from '@/components/account/ChangePasswordForm';
import GuestBookingsList from '@/components/account/GuestBookingsList';

export default function AccountPage() {
  const { user, loading, logout } = useAuth();

  return (
    <>
      <Header />
      <main className="wana-container py-10">
        <div className="mx-auto max-w-2xl wana-card p-8">
          <h1 className="font-display text-2xl text-slate-900">Tu cuenta</h1>

          {loading ? (
            <p className="mt-4 text-slate-500">Cargando…</p>
          ) : !user ? (
            <div className="mt-6">
              <p className="text-slate-600">No has iniciado sesión.</p>
              <Link href="/auth/login" className="wana-btn-primary mt-4 inline-flex min-h-[44px]">
                Iniciar sesión
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Nombre</p>
                <p className="text-slate-900">{user.name ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</p>
                <p className="text-slate-900">{user.email}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Tipo</p>
                <p className="text-slate-900 capitalize">{user.role}</p>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                {user.role === 'host' && (
                  <Link href="/host" className="text-sm font-medium text-wana-forest hover:underline">
                    Gestionar propiedades →
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link href="/admin" className="text-sm font-medium text-wana-forest hover:underline">
                    Panel admin →
                  </Link>
                )}
              </div>
              {user.role !== 'admin' && <GuestBookingsList />}
              <ChangePasswordForm />
              <button type="button" onClick={logout} className="wana-btn-ghost mt-4 min-h-[44px]">
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
