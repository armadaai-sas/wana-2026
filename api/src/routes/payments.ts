import type { FastifyInstance, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { createProviderIntent, resolveProvider } from '../lib/payments/router.js';
import { confirmPaymentSuccess } from '../lib/payments/confirm-payment.js';
import { syncBoldPayment } from '../lib/payments/bold-provider.js';
import { syncStripePayment } from '../lib/payments/stripe-provider.js';

const intentSchema = z.object({
  booking_id: z.string().uuid(),
  provider: z.enum(['bold', 'stripe', 'auto']).default('auto'),
  idempotency_key: z.string().min(8).max(128),
  return_url: z.string().url(),
});

function getTotalFromFees(fees: unknown): number {
  if (!fees || typeof fees !== 'object') return 0;
  const f = fees as { total_charge_to_guest?: number };
  return Number(f.total_charge_to_guest ?? 0);
}

export async function paymentRoutes(app: FastifyInstance) {
  app.post('/payments/intent', async (request, reply) => {
    const body = intentSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid body', details: body.error.flatten() });
    }

    const { booking_id, provider: requested, idempotency_key, return_url } = body.data;

    const existing = await prisma.payment.findUnique({
      where: { idempotencyKey: idempotency_key },
    });

    if (existing) {
      if (existing.status === 'succeeded') {
        return reply.send({
          payment: existing,
          reused: true,
          already_paid: true,
        });
      }

      if (existing.metadata && typeof existing.metadata === 'object') {
        const meta = existing.metadata as Record<string, unknown>;
        return reply.send({
          payment: existing,
          reused: true,
          checkout_url: meta.checkout_url,
          client_secret: meta.client_secret,
          publishable_key: meta.publishable_key,
          provider: existing.provider,
          mode: meta.mode ?? 'live',
        });
      }
    }

    const booking = await prisma.booking.findUnique({
      where: { id: booking_id },
      include: { property: { select: { title: true, country: true } } },
    });

    if (!booking) {
      return reply.status(404).send({ error: 'Booking not found' });
    }

    if (booking.status !== 'pending_payment') {
      return reply.status(400).send({
        error: `Booking is not payable (status: ${booking.status})`,
      });
    }

    const amount = getTotalFromFees(booking.feesBreakdown);
    if (amount <= 0) {
      return reply.status(400).send({ error: 'Invalid booking amount' });
    }

    const currency = booking.property.country === 'CO' ? 'COP' : 'USD';
    const provider = resolveProvider(requested, currency, booking.property.country);

    let payment = existing;
    if (!payment) {
      payment = await prisma.payment.create({
        data: {
          bookingId: booking_id,
          provider,
          amount,
          currency,
          status: 'pending',
          idempotencyKey: idempotency_key,
        },
      });
    }

    try {
      const result = await createProviderIntent(
        provider,
        {
          bookingId: booking_id,
          amount,
          currency,
          idempotencyKey: idempotency_key,
          description: `Reserva Waná — ${booking.property.title}`,
          guestEmail: booking.guestEmail ?? '',
          guestName: booking.guestName ?? 'Huésped',
          returnUrl: return_url,
        },
        payment.id,
      );

      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          externalId: result.externalId ?? null,
          status: 'processing',
          metadata: {
            checkout_url: result.checkoutUrl,
            client_secret: result.clientSecret,
            publishable_key: result.publishableKey,
            mode: result.mode,
          },
        },
      });

      return reply.status(201).send({
        payment_id: payment.id,
        provider: result.provider,
        mode: result.mode,
        checkout_url: result.checkoutUrl,
        client_secret: result.clientSecret,
        publishable_key: result.publishableKey,
        amount,
        currency,
      });
    } catch (err) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'failed' },
      });
      return reply.status(502).send({
        error: err instanceof Error ? err.message : 'Payment provider error',
      });
    }
  });

  app.get('/payments/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            property: { select: { title: true, slug: true, city: true } },
          },
        },
      },
    });

    if (!payment) {
      return reply.status(404).send({ error: 'Payment not found' });
    }

    return { payment };
  });

  app.get('/payments/by-booking/:bookingId', async (request, reply) => {
    const { bookingId } = request.params as { bookingId: string };
    const payments = await prisma.payment.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    return { payments };
  });

  app.post('/payments/:id/sync', async (request, reply) => {
    const { id } = request.params as { id: string };

    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) {
      return reply.status(404).send({ error: 'Payment not found' });
    }

    if (payment.status === 'succeeded') {
      return { status: 'succeeded', booking_id: payment.bookingId };
    }

    if (!payment.externalId) {
      return reply.status(400).send({ error: 'Payment has no external reference' });
    }

    const sync =
      payment.provider === 'bold'
        ? await syncBoldPayment(payment.externalId)
        : await syncStripePayment(payment.externalId);

    if (sync.paid) {
      const result = await confirmPaymentSuccess({
        paymentId: payment.id,
        externalId: sync.externalId ?? payment.externalId,
        raw: sync.raw,
      });
      return { status: 'succeeded', booking_id: result.bookingId };
    }

    return { status: payment.status };
  });

  /** Dev/mock: complete payment without provider */
  app.post('/payments/:id/mock-complete', async (request, reply) => {
    if (process.env.PAYMENTS_MODE !== 'mock' && process.env.NODE_ENV === 'production') {
      return reply.status(403).send({ error: 'Mock payments disabled' });
    }

    const { id } = request.params as { id: string };
    const payment = await prisma.payment.findUnique({ where: { id } });

    if (!payment) {
      return reply.status(404).send({ error: 'Payment not found' });
    }

    const result = await confirmPaymentSuccess({
      paymentId: id,
      externalId: `mock_${id}`,
      raw: { mock: true },
    });

    return { status: 'succeeded', booking_id: result.bookingId };
  });
}

declare module 'fastify' {
  interface FastifyRequest {
    rawBody?: Buffer;
  }
}

export async function webhookRoutes(app: FastifyInstance) {
  app.post('/webhooks/bold', async (request, reply) => {
    const signature = request.headers['x-bold-signature'] as string | undefined;
    const payload = request.body as Record<string, unknown>;

    const { verifyBoldWebhook, parseBoldWebhook } = await import('../lib/payments/bold-provider.js');

    if (!verifyBoldWebhook(payload, signature)) {
      return reply.status(401).send({ error: 'Invalid webhook signature' });
    }

    const parsed = parseBoldWebhook(payload);
    if (parsed.status !== 'PAID') {
      return reply.send({ received: true, skipped: true });
    }

    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { idempotencyKey: parsed.reference },
          { externalId: parsed.paymentLink },
        ],
      },
    });

    if (!payment) {
      return reply.status(404).send({ error: 'Payment not found for webhook' });
    }

    await confirmPaymentSuccess({
      paymentId: payment.id,
      externalId: parsed.transactionId ?? parsed.paymentLink ?? payment.externalId ?? payment.id,
      raw: payload,
    });

    return reply.send({ received: true });
  });

  app.post('/webhooks/stripe', {
    preParsing: async (request, _reply, payload) => {
      const chunks: Buffer[] = [];
      for await (const chunk of payload) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      const raw = Buffer.concat(chunks);
      request.rawBody = raw;
      const { Readable } = await import('node:stream');
      return Readable.from(raw);
    },
  }, async (request, reply) => {
    const signature = request.headers['stripe-signature'] as string | undefined;
    const rawBody = request.rawBody;

    if (!rawBody) {
      return reply.status(400).send({ error: 'Missing raw body' });
    }

    try {
      const { constructStripeEvent } = await import('../lib/payments/stripe-provider.js');
      const event = constructStripeEvent(rawBody, signature);

      if (event.type === 'payment_intent.succeeded') {
        const intent = event.data.object as { id: string; metadata?: { payment_id?: string } };
        const paymentId = intent.metadata?.payment_id;

        const payment = paymentId
          ? await prisma.payment.findUnique({ where: { id: paymentId } })
          : await prisma.payment.findFirst({ where: { externalId: intent.id } });

        if (payment) {
          await confirmPaymentSuccess({
            paymentId: payment.id,
            externalId: intent.id,
            raw: { event: event.type },
          });
        }
      }

      return reply.send({ received: true });
    } catch (err) {
      request.log.error(err);
      return reply.status(400).send({
        error: err instanceof Error ? err.message : 'Webhook error',
      });
    }
  });
}
