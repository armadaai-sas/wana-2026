import 'dotenv/config';
import { buildApp } from './app.js';
import { startPendingBookingExpiryJob } from './jobs/expire-pending-bookings.js';
import { startOtaCalendarSyncJob } from './jobs/sync-ota-calendars.js';

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? '0.0.0.0';

const app = await buildApp();

try {
  await app.listen({ port, host });
  startPendingBookingExpiryJob(app.log);
  startOtaCalendarSyncJob(app.log);
  console.log(`Waná API listening on http://${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
