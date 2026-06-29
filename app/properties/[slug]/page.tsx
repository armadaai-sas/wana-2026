import Header from '@/components/Header';
import PropertyGallery from '@/components/booking/PropertyGallery';
import BookingWidget from '@/components/booking/BookingWidget';
import PropertyReviews from '@/components/booking/PropertyReviews';
import PropertyJsonLd from '@/components/analytics/PropertyJsonLd';
import PropertyViewTracker from '@/components/analytics/PropertyViewTracker';
import ExclusiveBadge from '@/components/ExclusiveBadge';
import { wanaApi } from '@/lib/api-client';
import { notFound } from 'next/navigation';

type PageProps = {
  params: Promise<{ slug: string }>;
};

const AMENITY_LABELS: Record<string, string> = {
  wifi: 'WiFi',
  fogata: 'Fogata',
  vista: 'Vista panorámica',
  estacionamiento: 'Estacionamiento',
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  try {
    const property = await wanaApi.getProperty(slug);
    const description = property.description?.slice(0, 160) ?? 'Reserva en Waná';
    return {
      title: property.title,
      description,
      openGraph: {
        title: property.title,
        description,
        images: property.cover_image ? [{ url: property.cover_image }] : undefined,
      },
    };
  } catch {
    return { title: 'Propiedad | Waná' };
  }
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params;

  let property: Awaited<ReturnType<typeof wanaApi.getProperty>>;
  try {
    property = await wanaApi.getProperty(slug);
  } catch {
    notFound();
  }

  const media = (property.media as Array<Record<string, unknown>>) ?? [];
  const amenities = Array.isArray(property.amenities) ? property.amenities : [];
  const reviews = (property as { reviews?: Array<{ id: string; rating: number; comment?: string | null }> }).reviews ?? [];

  return (
    <>
      <PropertyJsonLd property={property} />
      <PropertyViewTracker
        property={{
          id: property.id,
          slug: property.slug,
          title: property.title,
          price_per_night: property.price_per_night,
        }}
      />
      <Header />
      <main className="pb-24 lg:pb-12">
        <div className="wana-container py-6 lg:py-8">
          <header className="mb-5 animate-slide-up">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <ExclusiveBadge />
              {property.rating != null && property.rating >= 4.5 && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 border border-amber-100">
                  Huéspedes lo recomiendan
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl text-slate-900 sm:text-3xl lg:text-4xl">
              {property.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
              {property.rating != null && (
                <span className="flex items-center gap-1 font-medium text-slate-800">
                  <span className="text-wana-forest">★</span> {property.rating}
                  <span className="text-slate-400">({property.review_count})</span>
                </span>
              )}
              {property.city && (
                <span className="underline decoration-slate-300">{property.city}, {property.country}</span>
              )}
              <span>· {property.max_guests} huéspedes max.</span>
            </div>
          </header>

          <div className="mb-8 animate-fade-in">
            <PropertyGallery media={media as never} title={property.title} />
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:items-start">
            <div className="space-y-10 min-w-0">
              <section>
                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-gradient-to-br from-wana-sand/80 to-white p-5 shadow-sm">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-wana-forest font-display text-xl text-white shadow-sm">
                    W
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Anfitrión Waná verificado</p>
                    <p className="text-sm text-slate-500">Experiencia glamping curada · respuesta rápida</p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="wana-section-title">Sobre este espacio</h2>
                <p className="mt-4 leading-relaxed text-slate-700">
                  {property.description ?? 'Sin descripción.'}
                </p>
              </section>

              {amenities.length > 0 && (
                <section className="border-t border-slate-200 pt-8">
                  <h2 className="wana-section-title">Lo que ofrece este lugar</h2>
                  <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                    {amenities.map((item: string) => (
                      <li key={item} className="flex items-center gap-3 text-slate-700">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-wana-sand text-wana-forest text-sm">
                          ✓
                        </span>
                        {AMENITY_LABELS[item] ?? item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <PropertyReviews
                reviews={reviews}
                rating={property.rating}
                reviewCount={property.review_count}
              />
            </div>

            <aside>
              <BookingWidget
                propertyId={property.id}
                slug={property.slug}
                pricePerNight={property.price_per_night}
                maxGuests={property.max_guests}
              />
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
