import { prisma } from '../prisma.js';
import { publicSiteUrl } from '../email.js';
import { sendEmail } from '../email.js';
import { normalizePhoneE164 } from '../phone-e164.js';
import { sendWhatsAppText } from './client.js';
import { BOT_MAIN_MENU, FAQ_CANCEL_POLICY, FAQ_HOUSE_RULES } from './faq-content.js';

export interface InboundWhatsAppMessage {
  fromPhoneE164: string;
  text: string;
  messageId?: string;
}

function normalizeInboundText(text: string): string {
  return text.trim().toLowerCase();
}

async function getOrCreateConversation(phoneE164: string) {
  return prisma.whatsAppConversation.upsert({
    where: { phoneE164 },
    create: { phoneE164 },
    update: {},
  });
}

async function notifyHumanHandoff(phoneE164: string, lastMessage: string): Promise<void> {
  const to = process.env.WHATSAPP_HANDOFF_EMAIL ?? process.env.RESEND_FROM;
  if (!to || !process.env.RESEND_API_KEY) {
    console.warn('[whatsapp:handoff]', phoneE164, lastMessage);
    return;
  }

  const match = to.match(/<([^>]+)>/);
  const emailTo = match?.[1] ?? to;

  await sendEmail({
    to: emailTo,
    subject: `[Eleveri WhatsApp] Handoff ${phoneE164}`,
    text: `Un huésped pidió atención humana.\nTeléfono: ${phoneE164}\nÚltimo mensaje: ${lastMessage}\n`,
  });
}

async function replyAvailability(): Promise<string> {
  const site = publicSiteUrl();
  const property = await prisma.property.findFirst({
    where: { status: 'published', slug: 'glamping-wana' },
    select: { title: true, pricePerNight: true, slug: true },
  });

  if (!property) {
    return `Explora espacios en ${site}/properties`;
  }

  const price = Number(property.pricePerNight);
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(price);

  return `${property.title} desde ${formatted} / noche.\nReserva con fechas en:\n${site}/properties/${property.slug}`;
}

async function replyMyBooking(phoneE164: string): Promise<string> {
  const bookings = await prisma.booking.findMany({
    where: {
      guestPhone: phoneE164,
      status: { in: ['pending_payment', 'confirmed', 'checked_in'] },
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: { property: { select: { title: true } } },
  });

  if (bookings.length === 0) {
    const byUser = await prisma.user.findFirst({
      where: { phoneE164 },
      select: { id: true },
    });
    if (byUser) {
      const userBookings = await prisma.booking.findMany({
        where: {
          guestId: byUser.id,
          status: { in: ['pending_payment', 'confirmed', 'checked_in'] },
        },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { property: { select: { title: true } } },
      });
      if (userBookings.length > 0) {
        return formatBookingsList(userBookings);
      }
    }
    return 'No encontramos reservas activas con este número. Si reservaste con otro teléfono, escribe 4 para ayuda.';
  }

  return formatBookingsList(bookings);
}

function formatBookingsList(
  bookings: Array<{
    status: string;
    checkIn: Date;
    checkOut: Date;
    property: { title: string };
  }>,
): string {
  return bookings
    .map((b) => {
      const inDate = b.checkIn.toISOString().slice(0, 10);
      const outDate = b.checkOut.toISOString().slice(0, 10);
      return `• ${b.property.title}\n  ${inDate} → ${outDate}\n  Estado: ${b.status}`;
    })
    .join('\n\n');
}

export async function handleInboundWhatsAppMessage(msg: InboundWhatsAppMessage): Promise<void> {
  const phone =
    normalizePhoneE164(msg.fromPhoneE164.startsWith('+') ? msg.fromPhoneE164 : `+${msg.fromPhoneE164}`) ??
    normalizePhoneE164(msg.fromPhoneE164);

  if (!phone) return;

  const conv = await getOrCreateConversation(phone);

  if (conv.needsHuman) {
    await sendWhatsAppText({
      toPhoneE164: phone,
      body: 'Un miembro del equipo Eleveri te contactará pronto. Gracias por tu paciencia.',
    });
    return;
  }

  const text = normalizeInboundText(msg.text);

  if (/^(4|humano|persona|agente|soporte)$/.test(text) || text.includes('hablar con')) {
    await prisma.whatsAppConversation.update({
      where: { phoneE164: phone },
      data: { needsHuman: true },
    });
    await notifyHumanHandoff(phone, msg.text);
    await sendWhatsAppText({
      toPhoneE164: phone,
      body: 'Te conectamos con el equipo Eleveri. Responderemos por este chat en horario hábil.',
    });
    return;
  }

  if (/^(hola|menu|menú|hi|hello|ayuda|help)$/.test(text) || text === '') {
    await sendWhatsAppText({ toPhoneE164: phone, body: BOT_MAIN_MENU });
    return;
  }

  if (/^(1|disponibilidad|precio|precios|reservar)$/.test(text)) {
    const body = await replyAvailability();
    await sendWhatsAppText({ toPhoneE164: phone, body });
    return;
  }

  if (/^(2|reserva|reservas|estado|mi reserva)$/.test(text)) {
    const body = await replyMyBooking(phone);
    await sendWhatsAppText({ toPhoneE164: phone, body });
    return;
  }

  if (/^(3|faq|cancel|cancelación|cancelacion|reglas)$/.test(text)) {
    await sendWhatsAppText({
      toPhoneE164: phone,
      body: `${FAQ_CANCEL_POLICY}\n\n${FAQ_HOUSE_RULES}`,
    });
    return;
  }

  await sendWhatsAppText({
    toPhoneE164: phone,
    body: `No entendí esa opción.\n\n${BOT_MAIN_MENU}`,
  });
}

/** Parse Cloud API webhook payload for inbound text messages. */
export function extractInboundMessages(payload: unknown): InboundWhatsAppMessage[] {
  const out: InboundWhatsAppMessage[] = [];
  if (!payload || typeof payload !== 'object') return out;

  const entry = (payload as { entry?: unknown[] }).entry;
  if (!Array.isArray(entry)) return out;

  for (const item of entry) {
    const changes = (item as { changes?: unknown[] }).changes;
    if (!Array.isArray(changes)) continue;

    for (const change of changes) {
      const value = (change as { value?: { messages?: unknown[] } }).value;
      const messages = value?.messages;
      if (!Array.isArray(messages)) continue;

      for (const m of messages) {
        const msg = m as {
          from?: string;
          id?: string;
          type?: string;
          text?: { body?: string };
        };
        if (msg.type !== 'text' || !msg.text?.body || !msg.from) continue;

        const fromDigits = msg.from;
        const e164 = fromDigits.startsWith('+') ? fromDigits : `+${fromDigits}`;
        out.push({
          fromPhoneE164: e164,
          text: msg.text.body,
          messageId: msg.id,
        });
      }
    }
  }

  return out;
}

/** Link inbound sender to user when phone matches. */
export async function linkConversationToUser(fromWaId: string): Promise<void> {
  const e164 = normalizePhoneE164(fromWaId.startsWith('+') ? fromWaId : `+${fromWaId}`);
  if (!e164) return;

  const user = await prisma.user.findFirst({ where: { phoneE164: e164 } });
  if (!user) return;

  await prisma.whatsAppConversation.updateMany({
    where: { phoneE164: e164, userId: null },
    data: { userId: user.id },
  });
}
