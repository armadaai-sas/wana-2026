import Link from 'next/link';
import Header from '@/components/Header';

export default function PropertyNotFound() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Header />
        <section className="rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold">Propiedad no encontrada</h1>
          <p className="mt-3 text-slate-600">La propiedad que buscas no existe o no está publicada.</p>
          <Link
            href="/properties"
            className="mt-6 inline-block rounded-xl bg-[#1B4332] px-6 py-3 font-semibold text-white"
          >
            Ver propiedades
          </Link>
        </section>
      </div>
    </main>
  );
}
