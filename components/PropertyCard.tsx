import Link from 'next/link';
import Image from 'next/image';

type Property = {
  id: string;
  slug?: string;
  title?: string | null;
  location?: string | null;
  city?: string | null;
  description?: string | null;
  price_per_night?: number | null;
  media_url?: string | null;
  cover_image?: string | null;
  rating?: number | null;
  review_count?: number;
};

function formatPrice(amount: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PropertyCard({ property }: { property: Property }) {
  const href = property.slug ? `/properties/${property.slug}` : '/properties';
  const image = property.cover_image ?? property.media_url;
  const location = property.city ?? property.location;
  const isFeatured = property.rating != null && property.rating >= 4.5;

  return (
    <Link href={href} className="group block">
      <article className="animate-fade-in">
        <div className="relative overflow-hidden rounded-2xl bg-wana-sand aspect-[4/3] shadow-card transition duration-300 group-hover:shadow-wana-lg">
          {image ? (
            <>
              <Image
                src={image}
                alt={property.title ?? 'Propiedad'}
                width={640}
                height={480}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-80 transition group-hover:opacity-100"
                aria-hidden
              />
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Sin imagen
            </div>
          )}

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {isFeatured && (
              <span className="rounded-lg bg-wana-forest/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                Destacado
              </span>
            )}
            {property.rating != null && (
              <span className="flex items-center gap-1 rounded-lg bg-white/95 px-2 py-1 text-xs font-semibold text-slate-800 shadow-sm">
                <span className="text-wana-forest">★</span> {property.rating}
              </span>
            )}
          </div>

          {property.price_per_night != null && (
            <div className="absolute bottom-3 left-3 right-3">
              <p className="text-sm font-semibold text-white drop-shadow-md">
                {formatPrice(property.price_per_night)}
                <span className="font-normal text-white/90"> / noche</span>
              </p>
            </div>
          )}
        </div>

        <div className="mt-3 space-y-1 px-0.5">
          <h3 className="font-semibold text-slate-900 line-clamp-1 transition group-hover:text-wana-forest">
            {property.title ?? 'Propiedad sin título'}
          </h3>
          <p className="text-sm text-slate-500 line-clamp-1">{location ?? 'Colombia'}</p>
          {property.review_count != null && property.review_count > 0 && (
            <p className="text-xs text-slate-400">{property.review_count} reseñas</p>
          )}
        </div>
      </article>
    </Link>
  );
}
