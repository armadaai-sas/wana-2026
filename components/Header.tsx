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
    <header
      className={`z-50 border-b border-slate-200/80 bg-wana-cream/90 backdrop-blur-md ${
        sticky ? 'sticky top-0' : ''
      }`}
    >
      <div className="wana-container flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-white hover:text-slate-900 ${
                pathname.startsWith(link.href) ? 'text-wana-forest' : 'text-slate-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className={`rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-white ${
                pathname.startsWith('/admin') ? 'text-wana-forest' : 'text-slate-600'
              }`}
            >
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 md:hidden"
            aria-expanded={menuOpen}
            aria-label="Abrir menú"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="text-lg leading-none">{menuOpen ? '✕' : '☰'}</span>
          </button>

          {!loading && user ? (
            <>
              <Link
                href="/account"
                className="hidden max-w-[140px] truncate text-sm text-slate-700 sm:inline"
              >
                {user.name ?? user.email}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="wana-btn-ghost !rounded-full !px-4 !py-2 text-sm hidden sm:inline-flex"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="wana-btn-ghost !rounded-full !px-4 !py-2 text-sm hidden sm:inline-flex"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <nav className="wana-container flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={`rounded-lg px-4 py-3 text-sm font-medium min-h-[44px] ${
                  pathname.startsWith(link.href)
                    ? 'bg-wana-sand text-wana-forest'
                    : 'text-slate-700 hover:bg-wana-sand'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                onClick={closeMenu}
                className="rounded-lg px-4 py-3 text-sm font-medium text-slate-700 min-h-[44px] hover:bg-wana-sand"
              >
                Admin
              </Link>
            )}
            {!loading && user ? (
              <>
                <Link
                  href="/account"
                  onClick={closeMenu}
                  className="rounded-lg px-4 py-3 text-sm text-slate-700 min-h-[44px] hover:bg-wana-sand"
                >
                  Mi cuenta
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg px-4 py-3 text-left text-sm text-slate-700 min-h-[44px] hover:bg-wana-sand"
                >
                  Salir
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={closeMenu}
                className="wana-btn-primary mt-2 justify-center"
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
