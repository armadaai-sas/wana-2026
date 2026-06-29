type Review = {
  id: string;
  rating: number;
  comment?: string | null;
  created_at?: string;
};

export default function PropertyReviews({
  reviews,
  rating,
  reviewCount,
}: {
  reviews: Review[];
  rating: number | null;
  reviewCount: number;
}) {
  if (reviewCount === 0 && reviews.length === 0) return null;

  return (
    <section className="border-t border-slate-200 pt-8">
      <div className="flex items-center gap-2">
        <span className="text-wana-forest text-xl">★</span>
        <h2 className="wana-section-title">
          {rating != null ? `${rating}` : '—'}
          <span className="font-normal text-slate-500"> · {reviewCount} reseñas</span>
        </h2>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {reviews.slice(0, 4).map((review) => (
          <div key={review.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-slate-900">Huésped verificado</span>
              <span className="text-wana-forest">★ {review.rating}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-700 line-clamp-4">
              {review.comment ?? 'Sin comentario.'}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
