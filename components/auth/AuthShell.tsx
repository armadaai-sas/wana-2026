import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/components/Logo';

type AuthShellProps = {
  children: React.ReactNode;
  image?: string;
  imageAlt?: string;
  /** Link superior derecho (ej. login ↔ registro) */
  topLink?: { href: string; label: string };
};

const DEFAULT_IMAGE = '/properties/glamping-wana/04.webp';

export default function AuthShell({
  children,
  image = DEFAULT_IMAGE,
  imageAlt = 'Glamping Waná — experiencia en naturaleza',
  topLink,
}: AuthShellProps) {
  return (
    <div className="wana-auth-immersive relative min-h-screen overflow-hidden">
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="wana-auth-immersive-overlay" aria-hidden />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="wana-container flex h-16 shrink-0 items-center justify-between">
          <Logo onDark />
          {topLink ? (
            <Link
              href={topLink.href}
              className="text-sm font-medium text-white/85 transition hover:text-wana-champagne-light"
            >
              {topLink.label}
            </Link>
          ) : (
            <Link
              href="/properties"
              className="text-sm font-medium text-white/85 transition hover:text-wana-champagne-light"
            >
              Explorar
            </Link>
          )}
        </header>

        <main className="flex flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-10">
          <div className="wana-auth-form-card w-full max-w-[420px]">{children}</div>
          <p className="mt-6 max-w-sm text-center text-xs leading-relaxed text-white/75">
            Al continuar aceptas nuestros{' '}
            <Link href="/legal/terms" className="font-medium text-wana-champagne-light hover:underline">
              términos
            </Link>{' '}
            y{' '}
            <Link href="/legal/privacy" className="font-medium text-wana-champagne-light hover:underline">
              privacidad
            </Link>
            .
          </p>
        </main>
      </div>
    </div>
  );
}
