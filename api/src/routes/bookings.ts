import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { isPropertyAvailable } from '../lib/availability.js';
import { calculateWanaFees, nightsBetween } from '../lib/fees.js';
import { assertTransition } from '../lib/booking-state.js';
import { authenticate } from '../plugins/auth.js';

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const quoteSchema = z.object({
  property_id: z.string().uuid(),
  check_in: dateString,
  check_out: dateString,
  guests: z.number().int().positive().default(1),
});

const createBookingSchema = quoteSchema.extend({
  guest_email: z.string().email().optional(),
  guest_name: z.string().min(1).optional(),
  idempotency_key: z.string().min(8).max(128),
});

function parseDateUTC(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

export async function bookingRoutes(app: FastifyInstance) {
  app.post('/bookings/quote', async (request, reply) => {
    const body = quoteSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid body', details: body.error.flatten() });
    }

    const { property_id, check_in, check_out, guests } = body.data;
    const checkIn = parseDateUTC(check_in);
    const checkOut = parseDateUTC(check_out);

    if (checkOut <= checkIn) {
      return reply.status(400).send({ error: 'check_out must be after check_in' });
    }

    const property = await prisma.property.findUnique({ where: { id: property_id } });
    if (!property || property.status !== 'published') {
      return reply.status(404).send({ error: 'Property not found' });
    }

    if (guests > property.maxGuests) {
      return reply.status(400).send({ error: `Max guests is ${property.maxGuests}` });
    }

    const nights = nightsBetween(checkIn, checkOut);
    const available = await isPropertyAvailable(property_id, checkIn, checkOut);

    const fees = calculateWanaFees(Number(property.pricePerNight), nights);

    return {
      property_id,
      check_in,
      check_out,
      guests,
      nights,
      available,
      fees,
      currency: property.country === 'CO' ? 'COP' : 'USD',
    };
  });

  app.post('/bookings', { preHandler: authenticate }, async (request, reply) => {
    const body = createBookingSchema.safeParse(request.body);
    if (!body.success) {
      return reply.status(400).send({ error: 'Invalid body', details: body.error.flatten() });
    }

    const data = body.data;
    const guestId = request.auth!.sub;
    const guestEmail = data.guest_email ?? request.auth!.email;
    const guestName = data.guest_name ?? guestEmail.split('@')[0];
    const checkIn = parseDateUTC(data.check_in);
    const checkOut = parseDateUTC(data.check_out);

    if (checkOut <= checkIn) {
      return reply.status(400).send({ error: 'check_out must be after check_in' });
    }

    const existing = await prisma.booking.findUnique({
      where: { idempotencyKey: data.idempotency_key },
    });
    if (existing) {
      return reply.status(200).send({ booking: existing, reused: true });
    }

    const property = await prisma.property.findUnique({ where: { id: data.property_id } });
    if (!property || property.status !== 'published') {
      return reply.status(404).send({ error: 'Property not found' });
    }

    if (data.guests > property.maxGuests) {
      return reply.status(400).send({ error: `Max guests is ${property.maxGuests}` });
    }

    const nights = nightsBetween(checkIn, checkOut);
    const fees = calculateWanaFees(Number(property.pricePerNight), nights);

    try {
      const booking = await prisma.$transaction(async (tx) => {
        const overlap = await tx.availabilityBlock.findFirst({
          where: {
            propertyId: data.property_id,
            startDate: { lt: checkOut },
            endDate: { gt: checkIn },
          },
        });

        if (overlap) {
          throw new Error('DATES_NOT_AVAILABLE');
        }

        const created = await tx.booking.create({
          data: {
            propertyId: data.property_id,
            guestId,
            checkIn,
            checkOut,
            guests: data.guests,
            status: 'pending_payment',
            feesBreakdown: fees as object,
            idempotencyKey: data.idempotency_key,
            guestEmail,
            guestName,
          },
        });

        await tx.availabilityBlock.create({
          data: {
            propertyId: data.property_id,
            startDate: checkIn,
            endDate: checkOut,
            source: 'booking',
            bookingId: created.id,
          },
        });

        await tx.bookingEvent.create({
          data: {
            bookingId: created.id,
            fromStatus: 'draft',
            toStatus: 'pending_payment',
            metadata: { source: 'api' },
          },
        });

        return created;
      });

      return reply.status(201).send({ booking, reused: false });
    } catch (err) {
      if (err instanceof Error && err.message === 'DATES_NOT_AVAILABLE') {
        return reply.status(409).send({ error: 'Dates are no longer available' });
      }
      throw err;
    }
  });

  app.get('/bookings/me', { preHandler: authenticate }, async (request) => {
    const bookings = await prisma.booking.findMany({
      where: { guestId: request.auth!.sub },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        property: { select: { id: true, slug: true, title: true, city: true } },
      },
    });

    return {
      data: bookings.map((b) => ({
        id: b.id,
        status: b.status,
        check_in: b.checkIn.toISOString().slice(0, 10),
        check_out: b.checkOut.toISOString().slice(0, 10),
        guests: b.guests,
        property_title: b.property.title,
        property_slug: b.property.slug,
        property_city: b.property.city,
        created_at: b.createdAt.toISOString(),
        total: (b.feesBreakdown as { total_charge_to_guest?: number } | null)?.total_charge_to_guest,
      })),
    };
  });

  app.get('/bookings/:id', async (request, reply) => {
    const { id } = request.params as { id: string };

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        property: {
          select: { id: true, slug: true, title: true, city: true },
        },
        payments: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });

    if (!booking) {
      return reply.status(404).send({ error: 'Booking not found' });
    }

    return { booking };
  });

  app.post('/bookings/:id/cancel', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return reply.status(404).send({ error: 'Booking not found' });
    }

    if (booking.guestId !== request.auth!.sub && request.auth!.role !== 'admin') {
      return reply.status(403).send({ error: 'Not authorized' });
    }

    try {
      assertTransition(booking.status, 'cancelled');
    } catch {
      return reply.status(400).send({ error: `Cannot cancel booking in status ${booking.status}` });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id },
        data: { status: 'cancelled' },
      });

      await tx.availabilityBlock.deleteMany({ where: { bookingId: id } });
      await tx.bookingEvent.create({
        data: {
          bookingId: id,
          fromStatus: booking.status,
          toStatus: 'cancelled',
        },
      });

      return b;
    });

    return { booking: updated };
  });
}
