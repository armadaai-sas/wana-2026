import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-20 bg-wana-forest-deep text-white">
      <div className="wana-container py-14 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <p className="font-display text-2xl text-white">Waná</p>
            <div className="wana-divider-gold mt-4" />
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Colección curada de glamping y refugios en Colombia. Naturaleza, confort y experiencias
              que se sienten exclusivas.
            </p>
          </div>
          <div>
            <p className="wana-eyebrow !text-wana-gold-light">Explorar</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              <li>
                <Link href="/properties" className="transition hover:text-wana-gold-light">
                  Colección
                </Link>
              </li>
              <li>
                <Link href="/legal/faq" className="transition hover:text-wana-gold-light">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="wana-eyebrow !text-wana-gold-light">Anfitriones</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              <li>
                <Link href="/host/add-property" className="transition hover:text-wana-gold-light">
                  Publicar espacio
                </Link>
              </li>
              <li>
                <Link href="/host" className="transition hover:text-wana-gold-light">
                  Panel anfitrión
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="wana-eyebrow !text-wana-gold-light">Legal</p>
            <ul className="mt-4 space-y-2.5 text-sm text-white/75">
              <li>
                <Link href="/legal/privacy" className="transition hover:text-wana-gold-light">
                  Privacidad
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="transition hover:text-wana-gold-light">
                  Términos
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} Glamping Waná. Todos los derechos reservados.
          </p>
          <p className="text-xs tracking-wide text-wana-gold-light/80">Colombia · Glamping curado</p>
        </div>
      </div>
    </footer>
  );
}
