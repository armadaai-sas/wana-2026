import Header from '@/components/Header';
import CheckoutClient from '@/components/checkout/CheckoutClient';
import { wanaApi } from '@/lib/api-client';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ bookingId: string }>;
  searchParams: Promise<{ property?: string }>;
}) {
  const { bookingId } = await params;
  const { property: propertySlug } = await searchParams;

  let booking: Awaited<ReturnType<typeof wanaApi.getBooking>>['booking'];
  try {
    const res = await wanaApi.getBooking(bookingId);
    booking = res.booking;
  } catch {
    notFound();
  }

  if (booking.status === 'confirmed') {
    redirect(`/checkout/${bookingId}/success${propertySlug ? `?property=${propertySlug}` : ''}`);
  }

  if (booking.status !== 'pending_payment') {
    return (
      <>
        <Header sticky={false} />
        <main className="wana-container py-14">
          <div className="wana-card mx-auto max-w-md p-8 text-center">
            <p className="text-slate-600">Esta reserva no está disponible para pago ({booking.status}).</p>
            <Link href="/properties" className="wana-btn-primary mt-6 inline-flex">
              Ver propiedades
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header sticky={false} />
      <main className="wana-container py-8 lg:py-12">
        <header className="mb-8">
          <p className="text-xs font-bold uppercase tracking-wider text-wana-forest">Checkout</p>
          <h1 className="mt-1 font-display text-3xl text-slate-900">Confirma y paga</h1>
        </header>
        <CheckoutClient booking={booking as never} propertySlug={propertySlug} />
      </main>
    </>
  );
}
