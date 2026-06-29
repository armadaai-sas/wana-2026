import Header from '@/components/Header';
import AddPropertyForm from '@/components/host/AddPropertyForm';
import Link from 'next/link';

export default function AddPropertyPage() {
  return (
    <>
      <Header />
      <main className="wana-container py-8 lg:py-12">
        <Link href="/host" className="text-sm font-medium text-wana-forest hover:underline">
          ← Tus propiedades
        </Link>
        <header className="mt-4 mb-8">
          <p className="text-xs font-bold uppercase tracking-wider text-wana-forest">Anfitrión</p>
          <h1 className="mt-1 font-display text-3xl text-slate-900">Publicar espacio</h1>
          <p className="mt-2 text-slate-600">
            Crea tu propiedad en la plataforma y sube fotos o videos desde el siguiente paso.
          </p>
        </header>
        <div className="max-w-3xl">
          <AddPropertyForm />
        </div>
      </main>
    </>
  );
}
