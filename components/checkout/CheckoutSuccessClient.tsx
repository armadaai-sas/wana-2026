'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { wanaApi } from '@/lib/api-client';
import { analytics } from '@/lib/analytics';

export default function CheckoutSuccessClient({
  bookingId,
  propertySlug,
  paymentId,
  isMock,
}: {
  bookingId: string;
  propertySlug?: string;
  paymentId?: string;
  isMock?: boolean;
}) {
  const [status, setStatus] = useState<'loading' | 'confirmed' | 'pending'>('loading');
  const purchaseTracked = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      try {
        if (isMock && paymentId) {
          await wanaApi.mockCompletePayment(paymentId);
        }

        const { booking } = await wanaApi.getBooking(bookingId);

        if (booking.status !== 'confirmed') {
          const pending = booking.payments?.find(
            (p) => p.status !== 'succeeded' && p.externalId,
          );
          const toSync = paymentId ?? pending?.id;
          if (toSync) {
            await wanaApi.syncPayment(toSync);
          }
        }

        const refreshed = await wanaApi.getBooking(bookingId);
        if (!cancelled) {
          const confirmed = refreshed.booking.status === 'confirmed';
          setStatus(confirmed ? 'confirmed' : 'pending');
          if (confirmed && !purchaseTracked.current) {
            purchaseTracked.current = true;
            const fees = refreshed.booking.feesBreakdown;
            analytics.purchase(bookingId, fees?.total_charge_to_guest ?? 0);
          }
        }
      } catch {
        if (!cancelled) setStatus('pending');
      }
    }

    sync();
    const interval = setInterval(sync, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [bookingId, paymentId, isMock]);

  return (
    <div className="mx-auto max-w-lg text-center">
      <div
        className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl ${
          status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-wana-sand text-wana-forest'
        }`}
      >
        {status === 'loading' ? '…' : status === 'confirmed' ? '✓' : '⏳'}
      </div>

      <h1 className="mt-6 font-display text-3xl text-wana-charcoal">
        {status === 'confirmed'
          ? '¡Reserva confirmada!'
          : status === 'loading'
            ? 'Verificando pago…'
            : 'Pago en proceso'}
      </h1>

      <p className="mt-3 text-wana-muted">
        {status === 'confirmed'
          ? 'Te enviaremos los detalles a tu correo. ¡Nos vemos pronto!'
          : 'Estamos confirmando tu pago. Esta página se actualizará automáticamente.'}
      </p>

      <div className="mt-10 flex flex-col gap-3 text-sm">
        {propertySlug && (
          <Link href={`/properties/${propertySlug}`} className="font-medium text-wana-forest hover:underline">
            Volver a la propiedad
          </Link>
        )}
        <Link href="/properties" className="text-wana-muted hover:text-wana-forest">
          Explorar más espacios
        </Link>
      </div>
    </div>
  );
}
