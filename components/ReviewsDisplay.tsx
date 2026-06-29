// components/ReviewsDisplay.tsx
type Review = {
  id: string;
  comment?: string | null;
  author_name?: string | null;
  source?: string | null;
  rating?: number | null;
};

export default function ReviewsDisplay({ reviews }: { reviews: Review[] }) {
  return (
    <section className="wana-card p-8 lg:p-10">
      <h2 className="font-display text-2xl text-slate-900 sm:text-3xl">
        Lo que dicen nuestros huéspedes
      </h2>
      <p className="mt-2 text-slate-600">Experiencias reales en espacios Waná</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.length === 0 ? (
          <p className="text-slate-500">Próximamente más reseñas.</p>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="rounded-2xl border border-slate-100 bg-wana-sand/40 p-5 transition hover:shadow-sm"
            >
              {typeof review.rating === 'number' && (
                <p className="text-sm font-semibold text-wana-forest">★ {review.rating}</p>
              )}
              <p className="mt-2 text-slate-800 leading-relaxed">
                &ldquo;{review.comment ?? 'Sin comentario'}&rdquo;
              </p>
              <p className="mt-4 text-xs font-medium text-slate-500">
                {review.author_name ?? 'Huésped verificado'}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
