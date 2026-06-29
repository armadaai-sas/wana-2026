import Link from 'next/link';
import Header from '@/components/Header';
import SearchHero from '@/components/search/SearchHero';
import PropertyCard from '@/components/PropertyCard';
import { wanaApi } from '@/lib/api-client';
import ExperiencePillars from '@/components/home/ExperiencePillars';

export const revalidate = 60;

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof wanaApi.listProperties>>['data'] = [];
  try {
    const res = await wanaApi.listProperties({ limit: 4 });
    featured = res.data;
  } catch {
    featured = [];
  }

  return (
    <>
      <Header />
      <main>
        <div className="wana-container py-6 lg:py-8">
          <SearchHero />
        </div>

        {featured.length > 0 && (
          <section className="wana-container py-10 lg:py-14">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl text-slate-900 sm:text-3xl">
                  Destacados esta semana
                </h2>
                <p className="mt-2 text-slate-600">Espacios con mejor valoración de huéspedes</p>
              </div>
              <Link
                href="/properties"
                className="hidden text-sm font-semibold text-wana-forest hover:underline sm:inline"
              >
                Ver todos →
              </Link>
            </div>
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={{
                    id: p.id,
                    slug: p.slug,
                    title: p.title,
                    city: p.city,
                    price_per_night: p.price_per_night,
                    cover_image: p.cover_image,
                    rating: p.rating,
                    review_count: p.review_count,
                  }}
                />
              ))}
            </div>
          </section>
        )}

        <ExperiencePillars />

        <section className="wana-container pb-16">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-wana-forest via-wana-forest to-wana-forest-light p-8 text-center text-white sm:p-12 shadow-wana-lg">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" aria-hidden />
            <div className="relative">
              <h2 className="font-display text-2xl sm:text-3xl">¿Listo para desconectar?</h2>
              <p className="mt-3 max-w-lg mx-auto text-white/85">
                Reserva con precios claros. Pago seguro y confirmación al instante en staging demo.
              </p>
              <Link
                href="/properties"
                className="mt-6 inline-flex min-h-[44px] items-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-wana-forest transition hover:bg-wana-cream"
              >
                Explorar espacios
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
