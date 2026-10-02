import type { FastifyInstance } from 'fastify';
import {
  verifyWhatsAppWebhookSignature,
} from '../lib/whatsapp/client.js';
import {
  extractInboundMessages,
  handleInboundWhatsAppMessage,
  linkConversationToUser,
} from '../lib/whatsapp/bot.js';

declare module 'fastify' {
  interface FastifyRequest {
    rawBody?: Buffer;
  }
}

export async function whatsAppWebhookRoutes(app: FastifyInstance) {
  app.get('/webhooks/whatsapp', async (request, reply) => {
    const query = request.query as {
      'hub.mode'?: string;
      'hub.verify_token'?: string;
      'hub.challenge'?: string;
    };

    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];
    const expected = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

    if (mode === 'subscribe' && expected && token === expected && challenge) {
      return reply.status(200).send(challenge);
    }

    return reply.status(403).send({ error: 'Verification failed' });
  });

  app.post('/webhooks/whatsapp', {
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
    const signature = request.headers['x-hub-signature-256'] as string | undefined;
    const rawBody = request.rawBody;

    if (!rawBody) {
      return reply.status(400).send({ error: 'Missing raw body' });
    }

    if (process.env.WHATSAPP_APP_SECRET) {
      if (!verifyWhatsAppWebhookSignature(rawBody, signature)) {
        return reply.status(401).send({ error: 'Invalid signature' });
      }
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody.toString('utf8'));
    } catch {
      return reply.status(400).send({ error: 'Invalid JSON' });
    }

    const inbound = extractInboundMessages(payload);
    for (const msg of inbound) {
      void linkConversationToUser(msg.fromPhoneE164.replace(/^\+/, ''));
      void handleInboundWhatsAppMessage(msg).catch((err) => {
        request.log.error({ err, from: msg.fromPhoneE164 }, 'WhatsApp inbound handler failed');
      });
    }

    return reply.send({ received: true });
  });
}
