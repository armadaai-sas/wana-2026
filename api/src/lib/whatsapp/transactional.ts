import { prisma } from '../prisma.js';
import { publicSiteUrl } from '../email.js';
import type { WanaFees } from '../fees.js';
import { templateName } from './config.js';
import { sendWhatsAppTemplate } from './client.js';

function skipWhatsAppForBooking(booking: {
  guestEmail: string | null;
  guestPhone: string | null;
  guestWhatsappOptIn: boolean;
}): boolean {
  if (!booking.guestPhone || !booking.guestWhatsappOptIn) return true;
  const email = booking.guestEmail?.trim().toLowerCase() ?? '';
  if (email.endsWith('@wana.local')) return true;
  return false;
}

function formatCop(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export async function sendWhatsAppBookingConfirmation(bookingId: string): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { property: { select: { title: true, slug: true } } },
  });
  if (!booking || skipWhatsAppForBooking(booking)) return;

  const fees = booking.feesBreakdown as WanaFees | null;
  const total = fees?.total_charge_to_guest ?? 0;
  const site = publicSiteUrl();
  const link = `${site}/checkout/${booking.id}/success?property=${booking.property.slug}`;

  await sendWhatsAppTemplate({
    toPhoneE164: booking.guestPhone!,
    templateName: templateName('booking_confirmation'),
    bodyParameters: [
      booking.guestName ?? 'Huésped',
      booking.property.title,
      booking.checkIn.toISOString().slice(0, 10),
      booking.checkOut.toISOString().slice(0, 10),
      formatCop(total),
      link,
    ],
    idempotencyKey: `wa:booking_confirmation:${bookingId}`,
  });
}

export async function sendWhatsAppBookingCancellation(params: {
  bookingId: string;
}): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: params.bookingId },
    include: { property: { select: { title: true } } },
  });
  if (!booking || skipWhatsAppForBooking(booking)) return;

  await sendWhatsAppTemplate({
    toPhoneE164: booking.guestPhone!,
    templateName: templateName('booking_cancellation'),
    bodyParameters: [
      booking.guestName ?? 'Huésped',
      booking.property.title,
      booking.checkIn.toISOString().slice(0, 10),
      booking.checkOut.toISOString().slice(0, 10),
    ],
    idempotencyKey: `wa:booking_cancellation:${params.bookingId}`,
  });
}

export async function sendWhatsAppCheckInReminder(bookingId: string): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { property: { select: { title: true, slug: true } } },
  });
  if (!booking || skipWhatsAppForBooking(booking)) return;
  if (booking.status !== 'confirmed') return;

  const site = publicSiteUrl();
  const link = `${site}/properties/${booking.property.slug}`;

  await sendWhatsAppTemplate({
    toPhoneE164: booking.guestPhone!,
    templateName: templateName('checkin_reminder'),
    bodyParameters: [
      booking.guestName ?? 'Huésped',
      booking.property.title,
      booking.checkIn.toISOString().slice(0, 10),
      link,
    ],
    idempotencyKey: `wa:checkin_reminder:${bookingId}`,
  });
}

export async function sendWhatsAppInvoiceReceipt(params: {
  bookingId: string;
  invoiceId?: string;
}): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: params.bookingId },
    include: { property: { select: { title: true } } },
  });
  if (!booking || skipWhatsAppForBooking(booking)) return;

  const fees = booking.feesBreakdown as WanaFees | null;
  const total = fees?.total_charge_to_guest ?? 0;
  const ref = params.invoiceId ?? booking.invoiceId ?? booking.id;
  const site = publicSiteUrl();
  const link = `${site}/account`;

  await sendWhatsAppTemplate({
    toPhoneE164: booking.guestPhone!,
    templateName: templateName('invoice_receipt'),
    bodyParameters: [
      booking.guestName ?? 'Huésped',
      formatCop(total),
      ref,
      link,
    ],
    idempotencyKey: `wa:invoice_receipt:${params.bookingId}:${ref}`,
  });
}

export async function sendWhatsAppHostNewBooking(bookingId: string): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      property: {
        select: {
          title: true,
          host: { select: { phoneE164: true, whatsappOptIn: true, name: true } },
        },
      },
    },
  });
  if (!booking) return;

  const host = booking.property.host;
  if (!host.phoneE164 || !host.whatsappOptIn) return;

  await sendWhatsAppTemplate({
    toPhoneE164: host.phoneE164,
    templateName: templateName('host_new_booking'),
    bodyParameters: [
      booking.property.title,
      booking.guestName ?? 'Huésped',
      booking.checkIn.toISOString().slice(0, 10),
      booking.checkOut.toISOString().slice(0, 10),
    ],
    idempotencyKey: `wa:host_new_booking:${bookingId}`,
  });
}
