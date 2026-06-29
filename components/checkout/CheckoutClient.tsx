'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { analytics } from '@/lib/analytics';
import toast from 'react-hot-toast';
import { wanaApi, type BookingDetail } from '@/lib/api-client';
import { formatCop, formatDateRange } from '@/lib/format';
import StripePaymentForm from './StripePaymentForm';

interface CheckoutClientProps {
  booking: BookingDetail;
  propertySlug?: string;
}

export default function CheckoutClient({ booking, propertySlug }: CheckoutClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<'bold' | 'stripe' | 'mock' | null>(null);
  const [stripeSession, setStripeSession] = useState<{
    paymentId: string;
    clientSecret: string;
    publishableKey: string;
    mode: string;
  } | null>(null);

  const fees = booking.feesBreakdown;
  const total = fees?.total_charge_to_guest ?? 0;

  useEffect(() => {
    analytics.beginCheckout(booking.id, total);
  }, [booking.id, total]);
  const checkIn = typeof booking.checkIn === 'string' ? booking.checkIn : String(booking.checkIn);
  const checkOut = typeof booking.checkOut === 'string' ? booking.checkOut : String(booking.checkOut);

  const goSuccess = () => {
    router.push(`/checkout/${booking.id}/success${propertySlug ? `?property=${propertySlug}` : ''}`);
  };

  if (booking.status === 'confirmed') {
    return (
      <div className="wana-card p-8 text-center">
        <p className="text-2xl">✓</p>
        <h2 className="mt-2 font-display text-2xl text-slate-900">Reserva confirmada</h2>
        <button type="button" onClick={goSuccess} className="wana-btn-primary mt-6">
          Ver confirmación
        </button>
      </div>
    );
  }

  const createIntent = async (provider: 'bold' | 'stripe') => {
    setLoading(provider);
    try {
      const returnUrl = `${window.location.origin}/checkout/${booking.id}/success`;
      const result = await wanaApi.createPaymentIntent({
        booking_id: booking.id,
        provider,
        idempotency_key: `pay_${booking.id}_${provider}`,
        return_url: returnUrl,
      });

      if (result.already_paid) {
        toast.success('Esta reserva ya está pagada');
        goSuccess();
        return;
      }

      if (provider === 'bold') {
        if (result.mode === 'mock') {
          await wanaApi.mockCompletePayment(result.payment_id);
          toast.success('Pago simulado (Bold)');
          goSuccess();
          return;
        }
        if (result.checkout_url) {
          window.location.href = result.checkout_url;
          return;
        }
      }

      if (provider === 'stripe' && result.client_secret) {
        if (result.mode === 'mock' || result.client_secret.startsWith('mock_secret_')) {
          setStripeSession({
            paymentId: result.payment_id,
            clientSecret: result.client_secret,
            publishableKey: result.publishable_key ?? 'pk_test_mock',
            mode: 'mock',
          });
        } else if (result.publishable_key) {
          setStripeSession({
            paymentId: result.payment_id,
            clientSecret: result.client_secret,
            publishableKey: result.publishable_key,
            mode: 'live',
          });
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al iniciar pago');
    } finally {
      setLoading(null);
    }
  };

  const handleMockStripePay = async () => {
    if (!stripeSession) return;
    setLoading('mock');
    try {
      await wanaApi.mockCompletePayment(stripeSession.paymentId);
      toast.success('Pago simulado (Stripe)');
      goSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
      <div className="space-y-6">
        <section className="wana-card p-6">
          <h2 className="wana-section-title">Tu viaje</h2>
          <div className="mt-4 flex gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-wana-sand font-display text-2xl text-wana-forest">
              W
            </div>
            <div>
              <p className="font-semibold text-slate-900">{booking.property.title}</p>
              <p className="text-sm text-slate-500">{booking.property.city ?? 'Colombia'}</p>
              <p className="mt-2 text-sm text-slate-600">
                {formatDateRange(checkIn.slice(0, 10), checkOut.slice(0, 10))}
              </p>
              <p className="text-sm text-slate-600">{booking.guests} huésped{booking.guests > 1 ? 'es' : ''}</p>
            </div>
          </div>
        </section>

        <section className="wana-card p-6">
          <h2 className="wana-section-title">Método de pago</h2>
          <p className="mt-2 text-sm text-slate-600">
            Elige cómo quieres pagar tu estadía.
          </p>

          {!stripeSession && (
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => createIntent('bold')}
                disabled={loading !== null}
                className="flex w-full items-center justify-between rounded-2xl border-2 border-wana-forest bg-wana-forest/5 px-5 py-4 transition hover:bg-wana-forest/10 disabled:opacity-50"
              >
                <div className="text-left">
                  <span className="font-semibold text-slate-900">Bold</span>
                  <p className="text-xs text-slate-500">Tarjetas, PSE, Nequi, Bancolombia</p>
                </div>
                <span className="rounded-full bg-wana-forest px-2 py-0.5 text-xs font-medium text-white">
                  COP
                </span>
              </button>

              <button
                type="button"
                onClick={() => createIntent('stripe')}
                disabled={loading !== null}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 transition hover:border-slate-300 hover:shadow-sm disabled:opacity-50"
              >
                <div className="text-left">
                  <span className="font-semibold text-slate-900">Stripe</span>
                  <p className="text-xs text-slate-500">Tarjetas internacionales</p>
                </div>
                <span className="text-xs text-slate-500">USD</span>
              </button>

              {loading && (
                <p className="text-center text-sm text-slate-500">Preparando pago…</p>
              )}
            </div>
          )}

          {stripeSession && stripeSession.mode === 'mock' && (
            <div className="mt-6 rounded-xl border border-dashed border-amber-300 bg-amber-50 p-4">
              <p className="text-sm text-amber-900">
                Modo desarrollo — Stripe no configurado
              </p>
              <button
                type="button"
                onClick={handleMockStripePay}
                disabled={loading === 'mock'}
                className="wana-btn-primary mt-4 w-full"
              >
                Simular pago exitoso
              </button>
            </div>
          )}

          {stripeSession && stripeSession.mode === 'live' && (
            <StripePaymentForm
              clientSecret={stripeSession.clientSecret}
              publishableKey={stripeSession.publishableKey}
              onSuccess={goSuccess}
            />
          )}
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="wana-card p-6 shadow-card">
          <h3 className="font-semibold text-slate-900">Desglose</h3>
          {fees && (
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-700">
                <span>{formatCop(fees.price_per_night)} × {fees.nights} noches</span>
                <span>{formatCop(fees.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Impuestos y servicio</span>
                <span>
                  {formatCop(fees.inc_tax + fees.parafiscal_tax + fees.wana_commission)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 font-bold text-slate-900">
                <span>Total (COP)</span>
                <span>{formatCop(total)}</span>
              </div>
            </div>
          )}
          <p className="mt-4 text-xs text-slate-500">
            Stripe cobra en USD equivalente. Bold cobra en pesos colombianos.
          </p>
        </div>
      </aside>
    </div>
  );
}
