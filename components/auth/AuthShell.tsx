import Image from 'next/image';
import Link from 'next/link';
import Logo from '@/components/Logo';

type AuthShellProps = {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  image?: string;
  imageAlt?: string;
};

const DEFAULT_IMAGE = '/properties/glamping-wana/05.webp';

export default function AuthShell({
  children,
  title,
  subtitle,
  image = DEFAULT_IMAGE,
  imageAlt = 'Glamping Waná — experiencia en naturaleza',
}: AuthShellProps) {
  return (
    <div className="wana-auth-page relative min-h-screen">
      <div className="wana-auth-bg" aria-hidden />

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        {/* Panel visual — desktop */}
        <aside className="relative hidden min-h-screen w-full flex-col justify-between overflow-hidden lg:flex lg:w-[44%] xl:w-[42%]">
          <Image
            src={image}
            alt={imageAlt}
            fill
            priority
            sizes="(min-width: 1024px) 44vw, 0"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-wana-midnight/92 via-wana-midnight/55 to-wana-accent-deep/35" />
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 80%, rgba(56,189,248,0.35) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(196,165,116,0.25) 0%, transparent 45%)',
            }}
            aria-hidden
          />

          <div className="relative z-10 p-10 xl:p-12">
            <Link href="/" className="inline-block">
              <Logo onDark />
            </Link>
          </div>

          <div className="relative z-10 p-10 xl:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-wana-gold-light">Waná Glamping</p>
            <h2 className="mt-4 max-w-md font-display text-3xl leading-tight text-white xl:text-4xl">
              {title}
            </h2>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-white/78">{subtitle}</p>
            <ul className="mt-8 space-y-3 text-sm text-white/72">
              <li className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-wana-gold-light text-xs">
                  ✓
                </span>
                Precio total antes de pagar
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-wana-gold-light text-xs">
                  ✓
                </span>
                Reservas seguras y confirmación al instante
              </li>
              <li className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-wana-gold-light text-xs">
                  ✓
                </span>
                Soporte en español
              </li>
            </ul>
          </div>
        </aside>

        {/* Formulario */}
        <div className="flex flex-1 flex-col">
          <div className="wana-container flex h-16 items-center justify-between lg:hidden">
            <Logo onDark />
            <Link
              href="/properties"
              className="text-sm font-medium text-white/75 transition hover:text-white"
            >
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
