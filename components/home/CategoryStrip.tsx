'use client';

import { useRouter } from 'next/navigation';

const CATEGORIES = [
  { label: 'Colección', city: '', icon: '✦' },
  { label: 'Domos', city: 'Sutatausa', icon: '◉' },
  { label: 'Sutatausa', city: 'Sutatausa', icon: '◎' },
  { label: 'Cucunubá', city: 'Cucunubá', icon: '◇' },
  { label: 'Sabana', city: 'Sabana', icon: '△' },
  { label: 'Glamping Waná', slug: 'glamping-wana', icon: '♥' },
] as const;

export default function CategoryStrip({ activeCity }: { activeCity?: string }) {
  const router = useRouter();

  const navigate = (item: typeof CATEGORIES[number]) => {
    if ('slug' in item && item.slug) {
      router.push(`/properties/${item.slug}`);
      return;
    }
    const params = new URLSearchParams();
    const city = 'city' in item ? item.city : '';
    if (city) params.set('city', city);
    router.push(`/properties${params.toString() ? `?${params}` : ''}`);
  };

  return (
    <section className="border-b border-wana-border/60 bg-wana-cream/80 backdrop-blur-sm">
      <div className="wana-container py-4">
        <div className="flex items-center gap-3">
          <span className="hidden shrink-0 text-[10px] font-bold uppercase tracking-[0.2em] text-wana-muted sm:inline">
            Explorar
          </span>
          <div className="flex flex-1 gap-2 overflow-x-auto pb-1 scrollbar-hide [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((item) => {
              const isActive =
                'slug' in item
                  ? false
                  : ('city' in item && activeCity === item.city) || (!activeCity && 'city' in item && !item.city);
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => navigate(item)}
                  className={`wana-category-chip shrink-0 ${isActive ? 'wana-category-chip-active' : ''}`}
                >
                  <span className="text-wana-gold" aria-hidden>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
