'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import Logo from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';

const navLinks = [
  { href: '/properties', label: 'Explorar' },
  { href: '/host', label: 'Anfitrión' },
  { href: '/legal/faq', label: 'FAQ' },
];

export default function Header({ sticky = true }: { sticky?: boolean }) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    router.push('/');
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`wana-header z-50 ${sticky ? 'sticky top-0' : ''}`}>
      <div className="wana-container flex h-[4.25rem] items-center justify-between gap-3 sm:gap-4">
        <Logo />

        <nav className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-wana-sand text-wana-forest'
                    : 'text-wana-muted hover:bg-wana-sand/60 hover:text-wana-charcoal'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                pathname.startsWith('/admin')
                  ? 'bg-wana-sand text-wana-forest'
                  : 'text-wana-muted hover:bg-wana-sand/60'
              }`}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/properties"
            className="hidden sm:inline-flex wana-btn-primary !px-5 !py-2.5 text-sm"
          >
            Reservar
          </Link>

          <button
            type="button"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-wana-border bg-white/80 text-wana-charcoal transition hover:border-wana-gold md:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              )}
            </svg>
          </button>

          {!loading && user ? (
            <>
              <Link
                href="/account"
                className="hidden max-w-[9rem] truncate text-sm text-wana-muted sm:inline hover:text-wana-forest"
              >
                {user.name ?? user.email}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="wana-btn-ghost !px-4 !py-2 text-sm hidden sm:inline-flex"
              >
                Salir
              </button>
            </>
          ) : (
            <Link href="/auth/login" className="wana-btn-ghost !px-4 !py-2 text-sm hidden sm:inline-flex">
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-wana-border bg-wana-cream md:hidden">
          <nav className="wana-container flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`rounded-xl px-4 py-3 text-sm font-medium min-h-[44px] ${
                  pathname.startsWith(link.href)
                    ? 'bg-wana-sand text-wana-forest'
                    : 'text-wana-charcoal hover:bg-wana-sand/70'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-sm font-medium text-wana-charcoal min-h-[44px] hover:bg-wana-sand/70"
              >
                Admin
              </Link>
            )}
            <Link href="/properties" onClick={closeMenu} className="wana-btn-primary mt-2 justify-center">
              Reservar
            </Link>
            {!loading && user ? (
              <>
                <Link
                  href="/account"
                  onClick={closeMenu}
                  className="rounded-xl px-4 py-3 text-sm text-wana-charcoal min-h-[44px] hover:bg-wana-sand/70"
                >
                  Mi cuenta
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="wana-btn-ghost mt-1 justify-center min-h-[44px]"
                >
                  Salir
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={closeMenu}
                className="wana-btn-ghost mt-1 justify-center min-h-[44px]"
              >
                Iniciar sesión
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
