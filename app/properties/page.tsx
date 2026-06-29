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
        <div className="wana-container py-8 lg:py-10">
          <header className="mb-10 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-wana-forest">Explorar</p>
            <h1 className="mt-2 font-display text-3xl text-slate-900 sm:text-4xl">
              Espacios únicos en Colombia
            </h1>
            <p className="mt-3 text-slate-600">
              Selecciona fechas en cada propiedad para ver el precio total antes de reservar.
            </p>
            {hasFilters && (
              <p className="mt-4 rounded-xl bg-wana-sand px-4 py-3 text-sm text-slate-700">
                Filtros:
                {city && <span className="ml-1 font-medium">{city}</span>}
                {guests && <span className="ml-2">· {guests} huéspedes</span>}
                {checkIn && checkOut && (
                  <span className="ml-2">· {checkIn} → {checkOut}</span>
                )}
                {checkIn && checkOut && (
                  <span className="block mt-1 text-slate-500">
                    Las fechas se aplican al reservar en cada propiedad.
                  </span>
                )}
              </p>
            )}
            {fromApi && (
              <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Disponibilidad en tiempo real
              </span>
            )}
          </header>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
              Error cargando propiedades: {error}
            </div>
          ) : properties.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
              <p className="text-slate-600">
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
