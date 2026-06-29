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
      <main className="wana-container py-10 lg:py-12">
        <div className="mx-auto max-w-2xl p-6 sm:p-8 wana-card-premium">
          <p className="wana-eyebrow">Perfil</p>
          <h1 className="mt-2 font-display text-2xl text-wana-charcoal sm:text-3xl">Tu cuenta</h1>

          {loading ? (
            <p className="mt-6 text-wana-muted">Cargando…</p>
          ) : !user ? (
            <div className="mt-6">
              <p className="text-wana-muted">No has iniciado sesión.</p>
              <Link href="/auth/login" className="wana-btn-primary mt-4 inline-flex min-h-[48px]">
                Iniciar sesión
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-wana-border bg-wana-cream/50 p-4">
                  <p className="wana-label">Nombre</p>
                  <p className="mt-1 font-medium text-wana-charcoal">{user.name ?? '—'}</p>
                </div>
                <div className="rounded-xl border border-wana-border bg-wana-cream/50 p-4">
                  <p className="wana-label">Email</p>
                  <p className="mt-1 font-medium text-wana-charcoal">{user.email}</p>
                </div>
                <div className="rounded-xl border border-wana-border bg-wana-cream/50 p-4 sm:col-span-2">
                  <p className="wana-label">Tipo de cuenta</p>
                  <p className="mt-1 font-medium capitalize text-wana-charcoal">{user.role}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                {user.role === 'host' && (
                  <Link href="/host" className="text-sm font-semibold text-wana-forest hover:text-wana-gold">
                    Gestionar propiedades →
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link href="/admin" className="text-sm font-semibold text-wana-forest hover:text-wana-gold">
                    Panel admin →
                  </Link>
                )}
              </div>
              {user.role !== 'admin' && <GuestBookingsList />}
              <ChangePasswordForm />
              <button type="button" onClick={logout} className="wana-btn-ghost min-h-[48px]">
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
