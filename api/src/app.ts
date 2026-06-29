import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { healthRoutes } from './routes/health.js';
import { propertyRoutes } from './routes/properties.js';
import { bookingRoutes } from './routes/bookings.js';
import { paymentRoutes, webhookRoutes } from './routes/payments.js';
import { mediaRoutes } from './routes/media.js';
import { authRoutes } from './routes/auth.js';
import { adminRoutes } from './routes/admin.js';
import { hostRoutes } from './routes/host.js';

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:3000'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.register(multipart, {
    limits: {
      fileSize: 80 * 1024 * 1024,
      files: 1,
    },
  });

  await app.register(healthRoutes);
  await app.register(propertyRoutes, { prefix: '/api/v1' });
  await app.register(bookingRoutes, { prefix: '/api/v1' });
  await app.register(paymentRoutes, { prefix: '/api/v1' });
  await app.register(webhookRoutes, { prefix: '/api/v1' });
  await app.register(mediaRoutes, { prefix: '/api/v1' });
  await app.register(authRoutes, { prefix: '/api/v1' });
  await app.register(hostRoutes, { prefix: '/api/v1' });
  await app.register(adminRoutes, { prefix: '/api/v1' });

  return app;
}
