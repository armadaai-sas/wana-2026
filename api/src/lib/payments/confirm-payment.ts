import { prisma } from '../prisma.js';
import { assertTransition } from '../booking-state.js';
import { onBookingConfirmed } from '../marketing.js';

export async function confirmPaymentSuccess(params: {
  paymentId: string;
  externalId: string;
  raw?: unknown;
}): Promise<{ bookingId: string; alreadyProcessed: boolean }> {
  const { paymentId, externalId, raw } = params;

  const result = await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({ where: { id: paymentId } });
    if (!payment) {
      throw new Error('PAYMENT_NOT_FOUND');
    }

    if (payment.status === 'succeeded') {
      return { bookingId: payment.bookingId, alreadyProcessed: true, newlyConfirmed: false };
    }

    const booking = await tx.booking.findUnique({ where: { id: payment.bookingId } });
    if (!booking) {
      throw new Error('BOOKING_NOT_FOUND');
    }

    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: 'succeeded',
        externalId,
        metadata: raw ? (raw as object) : undefined,
      },
    });

    await tx.paymentAttempt.create({
      data: {
        paymentId,
        status: 'succeeded',
        raw: raw ? (raw as object) : undefined,
      },
    });

    const newlyConfirmed = booking.status === 'pending_payment';

    if (newlyConfirmed) {
      assertTransition(booking.status, 'confirmed');
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: 'confirmed' },
      });
      await tx.bookingEvent.create({
        data: {
          bookingId: booking.id,
          fromStatus: 'pending_payment',
          toStatus: 'confirmed',
          metadata: { paymentId, externalId },
        },
      });
    }

    return { bookingId: booking.id, alreadyProcessed: false, newlyConfirmed };
  });

  if (!result.alreadyProcessed && result.newlyConfirmed) {
    void onBookingConfirmed(result.bookingId);
  }

  return { bookingId: result.bookingId, alreadyProcessed: result.alreadyProcessed };
}

export async function markPaymentFailed(paymentId: string, error: string, raw?: unknown) {
  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data: { status: 'failed' },
    });
    await tx.paymentAttempt.create({
      data: {
        paymentId,
        status: 'failed',
        error,
        raw: raw ? (raw as object) : undefined,
      },
    });
  });
}
