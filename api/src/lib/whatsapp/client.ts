import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { prisma } from '../prisma.js';
import { whatsAppRecipientId } from '../phone-e164.js';
import {
  isWhatsAppConfigured,
  whatsAppAccessToken,
  whatsAppGraphVersion,
  whatsAppPhoneNumberId,
} from './config.js';

export type WhatsAppSendResult = { sent: boolean; reason?: string; messageId?: string };

function graphUrl(path: string): string {
  return `https://graph.facebook.com/${whatsAppGraphVersion()}/${path}`;
}

async function postMessages(body: Record<string, unknown>): Promise<WhatsAppSendResult> {
  if (!isWhatsAppConfigured()) {
    return { sent: false, reason: 'WhatsApp not configured' };
  }

  const res = await fetch(graphUrl(`${whatsAppPhoneNumberId()}/messages`), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${whatsAppAccessToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      ...body,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    messages?: Array<{ id: string }>;
    error?: { message?: string };
  };

  if (!res.ok) {
    const reason = data.error?.message ?? `HTTP ${res.status}`;
    console.error('[whatsapp]', reason, data);
    return { sent: false, reason };
  }

  return { sent: true, messageId: data.messages?.[0]?.id };
}

export async function sendWhatsAppText(params: {
  toPhoneE164: string;
  body: string;
}): Promise<WhatsAppSendResult> {
  return postMessages({
    to: whatsAppRecipientId(params.toPhoneE164),
    type: 'text',
    text: { body: params.body },
  });
}

export async function sendWhatsAppTemplate(params: {
  toPhoneE164: string;
  templateName: string;
  languageCode?: string;
  bodyParameters: string[];
  idempotencyKey: string;
}): Promise<WhatsAppSendResult> {
  const existing = await prisma.whatsAppMessageLog.findUnique({
    where: { idempotencyKey: params.idempotencyKey },
  });
  if (existing?.status === 'sent') {
    return { sent: true, messageId: existing.waMessageId ?? undefined, reason: 'duplicate skipped' };
  }

  const components =
    params.bodyParameters.length > 0
      ? [
          {
            type: 'body',
            parameters: params.bodyParameters.map((text) => ({
              type: 'text',
              text: text.slice(0, 1024),
            })),
          },
        ]
      : undefined;

  const result = await postMessages({
    to: whatsAppRecipientId(params.toPhoneE164),
    type: 'template',
    template: {
      name: params.templateName,
      language: { code: params.languageCode ?? 'es' },
      ...(components ? { components } : {}),
    },
  });

  await prisma.whatsAppMessageLog.upsert({
    where: { idempotencyKey: params.idempotencyKey },
    create: {
      id: randomUUID(),
      idempotencyKey: params.idempotencyKey,
      toPhone: params.toPhoneE164,
      templateName: params.templateName,
      waMessageId: result.messageId ?? null,
      status: result.sent ? 'sent' : 'failed',
      error: result.reason ?? null,
    },
    update: {
      waMessageId: result.messageId ?? null,
      status: result.sent ? 'sent' : 'failed',
      error: result.reason ?? null,
    },
  });

  return result;
}

export function verifyWhatsAppWebhookSignature(
  rawBody: Buffer,
  signatureHeader: string | undefined,
): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !signatureHeader?.startsWith('sha256=')) return false;

  const expected = signatureHeader.slice('sha256='.length);
  const digest = createHmac('sha256', secret).update(rawBody).digest('hex');

  try {
    return timingSafeEqual(Buffer.from(expected, 'utf8'), Buffer.from(digest, 'utf8'));
  } catch {
    return false;
  }
}
