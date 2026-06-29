'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import Logo from '@/components/Logo';
import { useAuth } from '@/hooks/useAuth';

/** Cada enlace va a un destino distinto — sin duplicar /properties */
const navLinks = [
  { href: '/properties', label: 'Colección', match: (p: string) => p === '/properties' || (p.startsWith('/properties') && !p.includes('glamping-wana')) },
  { href: '/properties/glamping-wana', label: 'Glamping Waná', match: (p: string) => p.startsWith('/properties/glamping-wana') },
  { href: '/host/add-property', label: 'Publicar', match: (p: string) => p.startsWith('/host/add-property') },
  { href: '/legal/faq', label: 'FAQ', match: (p: string) => p.startsWith('/legal/faq') },
] as const;

const BOOK_URL = '/properties/glamping-wana';

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

  const isHome = pathname === '/';
  const bookHref = isHome ? '/#buscar' : BOOK_URL;

  return (
    <header className={`wana-header z-50 ${sticky ? 'sticky top-0' : ''}`}>
      <div className="wana-container flex h-[4.25rem] items-center justify-between gap-3 sm:gap-4">
        <Logo onDark />

        <nav className="hidden items-center gap-0.5 md:flex">
          {navLinks.map((link) => {
            const active = link.match(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`wana-header-nav-link ${active ? 'wana-header-nav-link-active' : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
          {user?.role === 'host' && (
            <Link
              href="/host"
              className={`wana-header-nav-link ${pathname.startsWith('/host') && !pathname.startsWith('/host/add-property') ? 'wana-header-nav-link-active' : ''}`}
            >
              Mi panel
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className={`wana-header-nav-link ${pathname.startsWith('/admin') ? 'wana-header-nav-link-active' : ''}`}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={bookHref}
            className="hidden sm:inline-flex wana-btn-primary !px-5 !py-2.5 text-sm text-white"
          >
            {isHome ? 'Buscar fechas' : 'Reservar ahora'}
          </Link>

          <button
            type="button"
            className="wana-header-menu-btn md:hidden"
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
              <Link href="/account" className="wana-header-account hidden sm:inline">
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
            <Link
              href="/auth/login"
              className="wana-btn-ghost !px-4 !py-2 text-sm hidden sm:inline-flex"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="wana-header-mobile-panel md:hidden">
          <nav className="wana-container flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`rounded-xl px-4 py-3 text-sm font-medium min-h-[44px] ${
                  link.match(pathname)
                    ? 'bg-white/10 text-white'
                    : 'text-white/85 hover:bg-white/8 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user?.role === 'host' && (
              <Link
                href="/host"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-sm font-medium text-white/85 min-h-[44px] hover:bg-white/8"
              >
                Mi panel
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-sm font-medium text-white/85 min-h-[44px] hover:bg-white/8"
              >
                Admin
              </Link>
            )}
            <Link
              href={bookHref}
              onClick={closeMenu}
              className="wana-btn-primary mt-2 justify-center text-white"
            >
              {isHome ? 'Buscar fechas' : 'Reservar ahora'}
            </Link>
            {!loading && user ? (
              <>
                <Link
                  href="/account"
                  onClick={closeMenu}
                  className="rounded-xl px-4 py-3 text-sm text-white/85 min-h-[44px] hover:bg-white/8"
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
