export default function PropertyJsonLd({
  property,
}: {
  property: {
    slug: string;
    title: string;
    description: string | null;
    price_per_night: number;
    city: string | null;
    country?: string;
    cover_image: string | null;
    rating: number | null;
    review_count: number;
  };
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://wana.co';
  const url = `${siteUrl}/properties/${property.slug}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: property.title,
    description: property.description ?? undefined,
    url,
    image: property.cover_image ?? undefined,
    priceRange: `COP ${property.price_per_night}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: property.city ?? 'Colombia',
      addressCountry: property.country ?? 'CO',
    },
    aggregateRating:
      property.rating != null && property.review_count > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: property.rating,
            reviewCount: property.review_count,
          }
        : undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
