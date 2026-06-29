import Header from '@/components/Header';
import MediaUploader from '@/components/host/MediaUploader';
import Link from 'next/link';

export default async function HostPropertyMediaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <Header />
      <main className="wana-container py-8 lg:py-12">
        <Link href="/host" className="text-sm font-medium text-wana-forest hover:underline">
          ← Tus propiedades
        </Link>
        <header className="mt-4 mb-8">
          <h1 className="font-display text-3xl text-slate-900">Fotos y videos</h1>
          <p className="mt-2 text-slate-600">Sube imágenes y videos para tu propiedad.</p>
        </header>
        <MediaUploader propertyId={id} />
      </main>
    </>
  );
}
