import Header from '@/components/Header';
import PropertyCard from '@/components/PropertyCard';
import { wanaApi } from '@/lib/api-client';

export const revalidate = 60;

type SearchParams = {
  city?: string;
  guests?: string;
  check_in?: string;
  check_out?: string;
};

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const city = sp.city?.trim() || undefined;
  const guests = sp.guests ? Number(sp.guests) : undefined;
  const checkIn = sp.check_in;
  const checkOut = sp.check_out;

  let properties: Awaited<ReturnType<typeof wanaApi.listProperties>>['data'] = [];
  let error: string | null = null;

  try {
    const { data } = await wanaApi.listProperties({
      limit: 24,
      city,
      guests: guests && guests > 0 ? guests : undefined,
    });
    properties = data;
  } catch (e) {
    error = e instanceof Error ? e.message : 'No se pudo conectar con la API';
  }

  const fromApi = !error;
  const hasFilters = city || guests || checkIn || checkOut;

  return (
    <>
      <Header />
      <main className="pb-16">
        <div className="border-b border-wana-border/60 bg-wana-sand/25">
          <div className="wana-container py-10 lg:py-14">
            <header className="max-w-2xl">
              <p className="wana-eyebrow">Colección</p>
              <h1 className="mt-3 font-display text-3xl text-wana-charcoal sm:text-4xl lg:text-5xl">
                Espacios únicos en Colombia
              </h1>
              <div className="wana-divider-gold mt-5" />
              <p className="mt-5 text-wana-muted leading-relaxed">
                Selecciona fechas en cada propiedad para ver el precio total antes de reservar.
              </p>
              {hasFilters && (
                <p className="mt-5 rounded-2xl border border-wana-border bg-wana-cream px-5 py-4 text-sm text-wana-charcoal">
                  Filtros:
                  {city && <span className="ml-1 font-medium">{city}</span>}
                  {guests && <span className="ml-2">· {guests} huéspedes</span>}
                  {checkIn && checkOut && (
                    <span className="ml-2">· {checkIn} → {checkOut}</span>
                  )}
                  {checkIn && checkOut && (
                    <span className="block mt-1 text-wana-muted">
                      Las fechas se aplican al reservar en cada propiedad.
                    </span>
                  )}
                </p>
              )}
              {fromApi && (
                <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-wana-gold/30 bg-white px-4 py-1.5 text-xs font-medium text-wana-forest">
                  <span className="h-1.5 w-1.5 rounded-full bg-wana-gold" />
                  Disponibilidad en tiempo real
                </span>
              )}
            </header>
          </div>
        </div>

        <div className="wana-container py-10 lg:py-12">

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
              Error cargando propiedades: {error}
            </div>
          ) : properties.length === 0 ? (
            <div className="rounded-2xl border border-wana-border bg-wana-cream/50 p-12 text-center">
              <p className="text-wana-muted">
                {hasFilters
                  ? 'No hay propiedades con esos filtros.'
                  : 'No hay propiedades publicadas.'}
              </p>
              {hasFilters && (
                <a href="/properties" className="mt-4 inline-flex text-sm font-medium text-wana-forest hover:underline">
                  Ver todas →
                </a>
              )}
            </div>
          ) : (
            <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={{
                    id: property.id,
                    slug: property.slug,
                    title: property.title,
                    city: property.city,
                    price_per_night: property.price_per_night,
                    cover_image: property.cover_image,
                    rating: property.rating,
                    review_count: property.review_count,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
