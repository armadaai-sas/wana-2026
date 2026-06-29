import Link from 'next/link';
import Header from '@/components/Header';
import SearchHero from '@/components/search/SearchHero';
import PropertyCard from '@/components/PropertyCard';
import { wanaApi } from '@/lib/api-client';
import ExperiencePillars from '@/components/home/ExperiencePillars';
import TrustStrip from '@/components/home/TrustStrip';
import CategoryStrip from '@/components/home/CategoryStrip';
import CinematicBand from '@/components/home/CinematicBand';

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
        <SearchHero />
        <CategoryStrip />

        <TrustStrip />

        {featured.length > 0 && (
          <section id="coleccion" className="relative py-14 lg:py-20">
            <div className="absolute inset-0 opacity-[0.04]" aria-hidden>
              <div
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: 'url(/properties/glamping-wana/04.webp)' }}
              />
            </div>
            <div className="wana-container relative">
              <div className="mb-10 flex items-end justify-between gap-4">
                <div>
                  <p className="wana-eyebrow">Selección</p>
                  <h2 className="mt-3 font-display text-2xl text-wana-charcoal sm:text-3xl lg:text-4xl">
                    Destacados esta semana
                  </h2>
                  <p className="mt-3 text-wana-muted">Espacios con la mejor valoración de huéspedes</p>
                </div>
                <Link
                  href="/properties"
                  className="hidden text-sm font-semibold text-wana-forest hover:text-wana-gold sm:inline-flex sm:items-center sm:gap-1"
                >
                  Ver colección <span aria-hidden>→</span>
                </Link>
              </div>
              <Link href="/properties" className="wana-btn-ghost mt-4 text-sm sm:hidden">
                Ver colección
              </Link>
              <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
                {featured.map((p) => (
                  <PropertyCard
                    key={p.id}
                    property={{
                      id: p.id,
                      slug: p.slug,
                      title: p.title,
                      city: p.city,
                      country: p.country,
                      price_per_night: p.price_per_night,
                      cover_image: p.cover_image,
                      rating: p.rating,
                      review_count: p.review_count,
                    }}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        <CinematicBand image="/properties/glamping-wana/05.webp" alt="Montañas de Sutatausa" overlay="forest">
          <div className="wana-container py-16 sm:py-20 text-center text-white">
            <p className="wana-eyebrow !text-wana-gold-light">Sabana de Bogotá</p>
            <h2 className="mt-4 font-display text-2xl sm:text-3xl lg:text-4xl max-w-2xl mx-auto">
              Amaneceres en la montaña, noches bajo las estrellas
            </h2>
            <p className="mt-4 max-w-lg mx-auto text-white/80 leading-relaxed">
              Glamping Waná en Sutatausa y Cucunubá — silencio, naturaleza y confort a poca distancia
              de la ciudad.
            </p>
            <Link
              href="/properties/glamping-wana"
              className="mt-8 inline-flex min-h-[48px] items-center rounded-full bg-white px-8 py-3 text-sm font-semibold text-wana-forest shadow-lg transition hover:bg-wana-gold-light"
            >
              Ver Glamping Waná
            </Link>
          </div>
        </CinematicBand>

        <ExperiencePillars />

        <section className="wana-container pb-20">
          <CinematicBand
            image="/properties/glamping-wana/03.webp"
            alt="Experiencia glamping"
            overlay="dark"
            className="rounded-[1.75rem] shadow-wana-lg ring-1 ring-wana-gold/20"
          >
            <div className="px-8 py-14 text-center text-white sm:px-14 sm:py-16">
              <p className="wana-eyebrow !text-wana-gold-light">Tu próximo escape</p>
              <h2 className="mt-4 font-display text-2xl sm:text-3xl lg:text-4xl">
                ¿Listo para desconectar?
              </h2>
              <p className="mt-4 max-w-lg mx-auto text-white/80 leading-relaxed">
                Reserva con precios claros. Pago seguro y confirmación al instante.
              </p>
              <Link
                href="/properties"
                className="mt-8 inline-flex min-h-[48px] items-center rounded-full border border-white/30 bg-white/10 px-8 py-3 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Ver toda la colección
              </Link>
            </div>
          </CinematicBand>
        </section>
      </main>
    </>
  );
}
