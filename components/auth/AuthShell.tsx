import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/components/Logo';

type AuthShellProps = {
  children: React.ReactNode;
  /** split = login con panel visual; centered = registro fondo blanco */
  layout?: 'split' | 'centered';
  title?: string;
  subtitle?: string;
  image?: string;
  imageAlt?: string;
};

const DEFAULT_IMAGE = '/properties/glamping-wana/05.webp';

export default function AuthShell({
  children,
  layout = 'split',
  title = '',
  subtitle = '',
  image = DEFAULT_IMAGE,
  imageAlt = 'Glamping Waná — experiencia en naturaleza',
}: AuthShellProps) {
  if (layout === 'centered') {
    return (
      <div className="wana-auth-page wana-auth-page--centered relative min-h-screen">
        <div className="wana-auth-bg wana-auth-bg--centered" aria-hidden />

        <div className="relative z-10 flex min-h-screen flex-col">
          <header className="wana-auth-topbar">
            <div className="wana-container flex h-16 items-center justify-between">
              <Logo onDark={false} />
              <Link href="/auth/login" className="wana-link text-sm">
                Iniciar sesión
              </Link>
            </div>
          </header>

          <main className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6">
            <div className="wana-auth-card--centered w-full max-w-[420px]">{children}</div>
            <p className="mt-8 max-w-sm text-center text-xs leading-relaxed text-wana-muted">
              Al registrarte aceptas nuestros{' '}
              <Link href="/legal/terms" className="wana-link text-xs font-medium">
                términos
              </Link>{' '}
              y{' '}
              <Link href="/legal/privacy" className="wana-link text-xs font-medium">
                privacidad
              </Link>
              .
            </p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="wana-auth-page relative min-h-screen">
      <div className="wana-auth-bg" aria-hidden />

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        <aside className="relative hidden min-h-screen w-full flex-col justify-between overflow-hidden lg:flex lg:w-[44%] xl:w-[42%]">
          <Image
            src={image}
            alt={imageAlt}
            fill
            priority
            sizes="(min-width: 1024px) 44vw, 0"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-wana-black/92 via-wana-black/55 to-wana-black/85" />
          <div
            className="absolute inset-0 opacity-35"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 80%, rgba(212,175,122,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 45%)',
            }}
            aria-hidden
          />

          <div className="relative z-10 p-10 xl:p-12">
            <Link href="/" className="inline-block">
              <Logo onDark />
            </Link>
          </div>

          <div className="relative z-10 p-10 xl:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-wana-champagne-light">
              Waná Glamping
            </p>
            <h2 className="mt-4 max-w-md font-display text-3xl leading-tight text-white xl:text-4xl">
              {title}
            </h2>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-white/78">{subtitle}</p>
            <ul className="mt-8 space-y-3 text-sm text-white/72">
              <li className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-wana-champagne-light text-xs">
                  ✓
                </span>
                Precio total antes de pagar
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-wana-champagne-light text-xs">
                  ✓
                </span>
                Reservas seguras y confirmación al instante
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-wana-champagne-light text-xs">
                  ✓
                </span>
                Soporte en español
              </li>
            </ul>
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <div className="wana-container flex h-16 items-center justify-between lg:hidden">
            <Logo onDark />
            <Link href="/properties" className="text-sm font-medium text-white/75 transition hover:text-white">
              Explorar
            </Link>
          </div>

          <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:py-12">
            <div className="wana-auth-card w-full max-w-md">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
