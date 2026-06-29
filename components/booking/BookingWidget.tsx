'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DayPicker, type DateRange } from 'react-day-picker';
import { format, addDays, parseISO, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { wanaApi, type BookingQuote } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import 'react-day-picker/dist/style.css';

interface BookingWidgetProps {
  propertyId: string;
  slug: string;
  pricePerNight: number;
  maxGuests: number;
  currency?: string;
}

function toDateString(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

function formatMoney(amount: number, currency = 'COP') {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
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
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-700">Huéspedes</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-600 disabled:opacity-30"
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-semibold">{value}</span>
        <button
          type="button"
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-600 disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function BookingWidget({
  propertyId,
  slug,
  pricePerNight,
  maxGuests,
  currency = 'COP',
}: BookingWidgetProps) {
  const [range, setRange] = useState<DateRange | undefined>();
  const [guests, setGuests] = useState(1);
  const [quote, setQuote] = useState<BookingQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [blockedRanges, setBlockedRanges] = useState<Array<{ start: string; end: string }>>([]);
  const [showCalendar, setShowCalendar] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const loginRedirect = `${pathname}?book=1`;

  useEffect(() => {
    wanaApi.getAvailability(propertyId)
      .then((data) => setBlockedRanges(data.blocked_ranges))
      .catch(() => setBlockedRanges([]));
  }, [propertyId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('book') === '1') {
      setShowCalendar(true);
      setMobileOpen(true);
    }
  }, []);

  const disabledDays = useMemo(() => {
    const days: Date[] = [];
    for (const block of blockedRanges) {
      try {
        const start = parseISO(block.start);
        const end = parseISO(block.end);
        days.push(...eachDayOfInterval({ start, end: addDays(end, -1) }));
      } catch {
        /* skip */
      }
    }
    return days;
  }, [blockedRanges]);

  const fetchQuote = useCallback(async () => {
    if (!range?.from || !range?.to) {
      setQuote(null);
      return;
    }
    setQuoteLoading(true);
    try {
      const result = await wanaApi.quoteBooking({
        property_id: propertyId,
        check_in: toDateString(range.from),
        check_out: toDateString(range.to),
        guests,
      });
      setQuote(result);
    } catch (err) {
      setQuote(null);
      toast.error(err instanceof Error ? err.message : 'No se pudo calcular el precio');
    } finally {
      setQuoteLoading(false);
    }
  }, [propertyId, range, guests]);

  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  const handleReserve = async () => {
    if (!range?.from || !range?.to || !quote?.available) return;

    if (!user) {
      toast.error('Inicia sesión para reservar');
      window.location.href = `/auth/login?redirect=${encodeURIComponent(loginRedirect)}`;
      return;
    }

    setBookingLoading(true);
    try {
      const { booking, reused } = await wanaApi.createBooking({
        property_id: propertyId,
        check_in: toDateString(range.from),
        check_out: toDateString(range.to),
        guests,
        idempotency_key: crypto.randomUUID(),
      });

      const bookingId = (booking as { id: string }).id;
      toast.success(reused ? 'Reserva existente' : '¡Listo! Continúa al pago');
      window.location.href = `/checkout/${bookingId}?property=${slug}`;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al reservar');
    } finally {
      setBookingLoading(false);
    }
  };

  const nights = quote?.nights ?? 0;
  const canReserve = quote?.available && nights > 0 && !quoteLoading && !bookingLoading;
  const totalDisplay =
    quote?.available && quote.fees
      ? formatMoney(quote.fees.total_charge_to_guest, currency)
      : formatMoney(pricePerNight, currency);

  const widgetBody = (
    <div className="wana-card p-6 shadow-card lg:shadow-wana-lg">
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-semibold text-slate-900">{formatMoney(pricePerNight, currency)}</span>
        <span className="text-slate-500">/ noche</span>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-300">
        <button
          type="button"
          onClick={() => setShowCalendar((s) => !s)}
          className="grid w-full grid-cols-2 border-b border-slate-300 text-left"
        >
          <div className="border-r border-slate-300 p-3 hover:bg-slate-50">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Entrada</p>
            <p className="text-sm text-slate-800">
              {range?.from ? format(range.from, 'd MMM', { locale: es }) : 'Agregar'}
            </p>
          </div>
          <div className="p-3 hover:bg-slate-50">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Salida</p>
            <p className="text-sm text-slate-800">
              {range?.to ? format(range.to, 'd MMM', { locale: es }) : 'Agregar'}
            </p>
          </div>
        </button>
        <div className="p-3 hover:bg-slate-50">
          <GuestStepper value={guests} min={1} max={maxGuests} onChange={setGuests} />
        </div>
      </div>

      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="wana-calendar mt-4 flex justify-center rounded-xl bg-wana-sand/50 p-2">
              <DayPicker
                mode="range"
                selected={range}
                onSelect={setRange}
                disabled={[{ before: new Date() }, ...disabledDays]}
                numberOfMonths={1}
                locale={es}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {quote && !quote.available && (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Estas fechas no están disponibles. Prueba otro rango.
        </p>
      )}

      {quote?.available && nights > 0 && (
        <div className="mt-5 space-y-2.5 text-sm">
          <div className="flex justify-between text-slate-700">
            <span className="underline decoration-slate-300">
              {formatMoney(quote.fees.price_per_night, currency)} × {nights} noches
            </span>
            <span>{formatMoney(quote.fees.subtotal, currency)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Impuestos y servicio</span>
            <span>
              {formatMoney(
                quote.fees.inc_tax + quote.fees.parafiscal_tax + quote.fees.wana_commission,
                currency,
              )}
            </span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-3 font-semibold text-slate-900">
            <span>Total</span>
            <span>{formatMoney(quote.fees.total_charge_to_guest, currency)}</span>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleReserve}
        disabled={!canReserve || authLoading}
        className="wana-btn-primary mt-6 w-full !rounded-xl !py-3.5"
      >
        {!user ? 'Inicia sesión para reservar' : bookingLoading ? 'Reservando…' : quoteLoading ? 'Calculando…' : 'Reservar'}
      </button>
      <p className="mt-3 text-center text-xs text-slate-500">No se hará ningún cobro por ahora</p>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block lg:sticky lg:top-24 lg:self-start">{widgetBody}</div>

      {/* Mobile bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-lg lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-slate-900">{totalDisplay}</p>
            <p className="text-xs text-slate-500">
              {nights > 0 ? `${nights} noches` : 'Selecciona fechas'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="wana-btn-primary !rounded-xl !px-6"
          >
            Reservar
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 max-h-[92vh] overflow-y-auto rounded-t-3xl bg-wana-cream p-4 pb-8"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">Tu estadía</h3>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full bg-slate-100 px-3 py-1 text-sm"
                >
                  Cerrar
                </button>
              </div>
              {widgetBody}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
