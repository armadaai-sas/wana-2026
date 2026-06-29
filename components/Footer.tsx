import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <div className="wana-container py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-lg text-slate-900">Waná</p>
            <p className="mt-2 text-sm text-slate-600">
              Glamping y refugios únicos en Colombia. Reserva con confianza.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Explorar</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/properties" className="hover:text-wana-forest">Propiedades</Link></li>
              <li><Link href="/legal/faq" className="hover:text-wana-forest">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Anfitriones</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/host/add-property" className="hover:text-wana-forest">Publicar espacio</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Legal</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><Link href="/legal/privacy" className="hover:text-wana-forest">Privacidad</Link></li>
              <li><Link href="/legal/terms" className="hover:text-wana-forest">Términos</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-slate-100 pt-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Glamping Waná. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
