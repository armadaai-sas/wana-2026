import Link from 'next/link';
import Header from '@/components/Header';
import HostDashboard from '@/components/host/HostDashboard';

export default function HostPage() {
  return (
    <>
      <Header />
      <main className="wana-container py-8 lg:py-12">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-wana-forest">Anfitrión</p>
            <h1 className="mt-1 font-display text-3xl text-slate-900">Tus propiedades</h1>
            <p className="mt-2 text-slate-600">Administra fotos y videos de cada espacio.</p>
          </div>
          <Link href="/host/add-property" className="wana-btn-primary inline-flex min-h-[44px] shrink-0">
            + Publicar espacio
          </Link>
        </header>
        <HostDashboard />
      </main>
    </>
  );
}
