'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DayPicker, type DateRange } from 'react-day-picker';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';

export default function SearchHero() {
  const router = useRouter();
  const [city, setCity] = useState('');
  const [guests, setGuests] = useState(2);
  const [range, setRange] = useState<DateRange | undefined>();
  const [showDates, setShowDates] = useState(false);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city.trim()) params.set('city', city.trim());
    if (guests > 0) params.set('guests', String(guests));
    if (range?.from) params.set('check_in', format(range.from, 'yyyy-MM-dd'));
    if (range?.to) params.set('check_out', format(range.to, 'yyyy-MM-dd'));
    const q = params.toString();
    router.push(`/properties${q ? `?${q}` : ''}`);
  };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-wana-forest text-white shadow-wana-lg">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1441974231535-c7937ff85e49?w=800&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-wana-forest/95 via-wana-forest/85 to-wana-forest-light/80" />

      <div className="relative px-6 py-14 sm:px-10 sm:py-20 lg:py-24">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/70">
          Glamping en Colombia
        </p>
        <h1 className="mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-5xl lg:text-6xl">
          Encuentra tu refugio entre el bosque y las estrellas
        </h1>
        <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">
          Domos, cabañas y espacios únicos con reserva instantánea y precios transparentes.
        </p>

        <div className="mt-8 max-w-3xl rounded-2xl border border-white/20 bg-white/10 p-2 backdrop-blur-md sm:p-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="flex-1 rounded-xl bg-white/95 px-4 py-3 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Ciudad o zona
              </span>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ej. Villa de Leyva"
                className="mt-0.5 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
            </label>
            <label className="rounded-xl bg-white/95 px-4 py-3 sm:w-28">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Huéspedes
              </span>
              <input
                type="number"
                min={1}
                max={20}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value) || 1)}
                className="mt-0.5 w-full bg-transparent text-sm text-slate-800 outline-none"
              />
            </label>
            <button
              type="button"
              onClick={() => setShowDates((s) => !s)}
              className="rounded-xl bg-white/95 px-4 py-3 text-left sm:w-40"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Fechas
              </span>
              <p className="text-sm text-slate-800">
                {range?.from && range?.to
                  ? `${format(range.from, 'd MMM', { locale: es })} – ${format(range.to, 'd MMM', { locale: es })}`
                  : 'Opcional'}
              </p>
            </button>
            <button
              type="button"
              onClick={handleSearch}
              className="wana-btn-primary !rounded-xl sm:!px-8 shrink-0 min-h-[44px] bg-white !text-wana-forest hover:!bg-wana-cream"
            >
              Buscar
            </button>
          </div>
          {showDates && (
            <div className="mt-3 rounded-xl bg-white/95 p-4">
              <DayPicker
                mode="range"
                selected={range}
                onSelect={setRange}
                disabled={{ before: new Date() }}
                numberOfMonths={1}
                locale={es}
                className="mx-auto"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
