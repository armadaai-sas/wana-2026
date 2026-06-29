'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { DayPicker, type DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import SearchDropdown from '@/components/ui/SearchDropdown';
import 'react-day-picker/dist/style.css';

const HERO_COVER = '/properties/glamping-wana/01-cover.jpeg';
/** WebP slides — much lighter than full JPG for carousel */
const HERO_SLIDES = [
  '/properties/glamping-wana/02.webp',
  '/properties/glamping-wana/04.webp',
  '/properties/glamping-wana/05.webp',
  '/properties/glamping-wana/06.webp',
];

const LOCATIONS = [
  { label: 'Cualquier lugar en Colombia', value: '', detail: 'Toda la colección Waná' },
  { label: 'Sutatausa', value: 'Sutatausa', detail: 'Sabana, montañas y domos' },
  { label: 'Cucunubá', value: 'Cucunubá', detail: 'Paisaje rural y cielo abierto' },
  { label: 'Cundinamarca', value: 'Cundinamarca', detail: 'Cerca de Bogotá' },
  { label: 'Sabana de Bogotá', value: 'Sabana', detail: 'Escapadas de fin de semana' },
];

type Panel = 'location' | 'guests' | 'dates' | null;

function Chevron({ open }: { open?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={`shrink-0 text-wana-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      aria-hidden
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function GuestStepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className="wana-stepper-btn"
        aria-label="Menos huéspedes"
      >
        −
      </button>
      <span className="min-w-[2ch] text-center text-lg font-semibold text-wana-charcoal">{value}</span>
      <button
        type="button"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="wana-stepper-btn"
        aria-label="Más huéspedes"
      >
        +
      </button>
    </div>
  );
}

export default function SearchHero() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [cityLabel, setCityLabel] = useState('Cualquier lugar');
  const [guests, setGuests] = useState(2);
  const [range, setRange] = useState<DateRange | undefined>();
  const [panel, setPanel] = useState<Panel>(null);
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideshowReady, setSlideshowReady] = useState(false);

  const closePanel = useCallback(() => setPanel(null), []);

  const togglePanel = (p: Panel) => setPanel((cur) => (cur === p ? null : p));

  // Defer heavy carousel until after first paint
  useEffect(() => {
    const start = () => setSlideshowReady(true);
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const id = window.requestIdleCallback(start, { timeout: 1200 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(start, 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!slideshowReady || HERO_SLIDES.length === 0) return;
    const id = setInterval(() => {
      setSlideIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, 8000);
    return () => clearInterval(id);
  }, [slideshowReady]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city.trim()) params.set('city', city.trim());
    if (guests > 0) params.set('guests', String(guests));
    if (range?.from) params.set('check_in', format(range.from, 'yyyy-MM-dd'));
    if (range?.to) params.set('check_out', format(range.to, 'yyyy-MM-dd'));
    const q = params.toString();
    router.push(`/properties${q ? `?${q}` : ''}`);
  };

  const dateLabel =
    range?.from && range?.to
      ? `${format(range.from, 'd MMM', { locale: es })} – ${format(range.to, 'd MMM', { locale: es })}`
      : 'Agregar fechas';

  const guestsLabel = guests === 1 ? '1 huésped' : `${guests} huéspedes`;

  return (
    <section className="relative min-h-[88vh] lg:min-h-[92vh] flex flex-col justify-end overflow-hidden">
      {/* Cinematic background — instant cover, lazy carousel */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${HERO_COVER})` }}
          aria-hidden
        />
        {slideshowReady &&
          HERO_SLIDES.map((src, i) => (
            <div
              key={src}
              className={`absolute inset-0 transition-opacity duration-[2s] ease-in-out ${
                i === slideIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="100vw"
                quality={75}
                className="object-cover scale-105 animate-hero-kenburns"
              />
            </div>
          ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-wana-forest-deep/55 to-wana-forest-deep/92" />
        <div className="absolute inset-0 bg-gradient-to-r from-wana-forest-deep/70 via-transparent to-black/25" />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 70% 30%, rgba(196,165,116,0.6) 0%, transparent 50%)',
          }}
          aria-hidden
        />
      </div>

      {/* Content */}
      <div className="relative wana-container pb-10 pt-28 sm:pb-14 sm:pt-32 lg:pb-20">
        <div className="max-w-3xl animate-slide-up">
          <p className="wana-eyebrow !text-wana-gold-light">Colección exclusiva · Sabana de Bogotá</p>
          <h1 className="mt-4 font-display text-[2.35rem] leading-[1.06] text-white sm:text-5xl lg:text-[3.75rem] lg:leading-[1.05]">
            Glamping entre montañas y estrellas
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/82 sm:text-lg">
            Domos, cabañas y refugios curados en Sutatausa, Cucunubá y la sabana — experiencias
            íntimas con el cielo como techo.
          </p>
        </div>

        {/* Luxury search bar */}
        <div className="mt-10 lg:mt-12 max-w-4xl animate-slide-up" style={{ animationDelay: '80ms' }}>
          <div className="wana-search-luxury">
            <div className="grid gap-1 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:gap-0 sm:divide-x sm:divide-wana-border/80">
              {/* Location */}
              <div className="relative sm:col-span-1">
                <button
                  type="button"
                  onClick={() => togglePanel('location')}
                  className={`wana-search-field w-full ${panel === 'location' ? 'wana-search-field-active' : ''}`}
                >
                  <span className="wana-search-label">Destino</span>
                  <span className="wana-search-value">{cityLabel}</span>
                  <Chevron open={panel === 'location'} />
                </button>
                <SearchDropdown open={panel === 'location'} onClose={closePanel} className="w-full min-w-[280px] sm:w-[320px]">
                  <p className="wana-dropdown-title">¿Dónde quieres ir?</p>
                  <ul className="mt-2 space-y-1">
                    {LOCATIONS.map((loc) => (
                      <li key={loc.value || 'all'}>
                        <button
                          type="button"
                          onClick={() => {
                            setCity(loc.value);
                            setCityLabel(loc.label.replace(' en Colombia', ''));
                            closePanel();
                          }}
                          className={`wana-dropdown-option ${city === loc.value ? 'wana-dropdown-option-active' : ''}`}
                        >
                          <span className="font-semibold text-wana-charcoal">{loc.label}</span>
                          <span className="text-xs text-wana-muted">{loc.detail}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </SearchDropdown>
              </div>

              {/* Dates */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => togglePanel('dates')}
                  className={`wana-search-field w-full ${panel === 'dates' ? 'wana-search-field-active' : ''}`}
                >
                  <span className="wana-search-label">Fechas</span>
                  <span className="wana-search-value">{dateLabel}</span>
                  <Chevron open={panel === 'dates'} />
                </button>
                <SearchDropdown
                  open={panel === 'dates'}
                  onClose={closePanel}
                  align="center"
                  className="w-[min(100vw-2rem,340px)] sm:w-[360px]"
                >
                  <p className="wana-dropdown-title">Selecciona tu estadía</p>
                  <DayPicker
                    mode="range"
                    selected={range}
                    onSelect={(r) => {
                      setRange(r);
                      if (r?.from && r?.to) closePanel();
                    }}
                    disabled={{ before: new Date() }}
                    numberOfMonths={1}
                    locale={es}
                    className="mx-auto mt-3 wana-calendar"
                  />
                  {range?.from && !range?.to && (
                    <p className="mt-2 text-center text-xs text-wana-muted">Selecciona la fecha de salida</p>
                  )}
                  <div className="mt-3 flex gap-2 border-t border-wana-border pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setRange(undefined);
                        closePanel();
                      }}
                      className="wana-btn-ghost flex-1 !py-2 text-sm min-h-[44px]"
                    >
                      Limpiar
                    </button>
                    <button
                      type="button"
                      onClick={closePanel}
                      className="wana-btn-primary flex-1 !py-2 text-sm min-h-[44px]"
                    >
                      Listo
                    </button>
                  </div>
                </SearchDropdown>
              </div>

              {/* Guests */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => togglePanel('guests')}
                  className={`wana-search-field w-full ${panel === 'guests' ? 'wana-search-field-active' : ''}`}
                >
                  <span className="wana-search-label">Huéspedes</span>
                  <span className="wana-search-value">{guestsLabel}</span>
                  <Chevron open={panel === 'guests'} />
                </button>
                <SearchDropdown
                  open={panel === 'guests'}
                  onClose={closePanel}
                  align="right"
                  className="w-[min(100vw-2rem,280px)]"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-wana-charcoal">Huéspedes</p>
                      <p className="text-xs text-wana-muted">Máximo 20 por reserva</p>
                    </div>
                    <GuestStepper value={guests} min={1} max={20} onChange={setGuests} />
                  </div>
                  <button
                    type="button"
                    onClick={closePanel}
                    className="wana-btn-primary mt-4 w-full min-h-[44px] text-sm"
                  >
                    Listo
                  </button>
                </SearchDropdown>
              </div>

              {/* Search CTA */}
              <div className="p-2 sm:p-3 sm:pl-2">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="wana-btn-primary w-full min-h-[52px] !rounded-xl sm:!rounded-2xl sm:!px-6 shadow-lg"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                      <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Buscar
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="mt-10 flex justify-center sm:justify-start animate-fade-in" style={{ animationDelay: '400ms' }}>
          <a
            href="#coleccion"
            className="group flex flex-col items-center gap-2 text-white/70 transition hover:text-white"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.25em]">Descubre</span>
            <span className="flex h-10 w-6 items-start justify-center rounded-full border border-white/35 p-1 transition group-hover:border-wana-gold-light">
              <span className="h-2 w-1 rounded-full bg-wana-gold-light animate-scroll-hint" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
