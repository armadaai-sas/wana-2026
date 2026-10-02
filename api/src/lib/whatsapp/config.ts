export function isWhatsAppConfigured(): boolean {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
      process.env.WHATSAPP_PHONE_NUMBER_ID,
  );
}

export function whatsAppGraphVersion(): string {
  return process.env.WHATSAPP_GRAPH_API_VERSION ?? 'v21.0';
}

export function whatsAppPhoneNumberId(): string {
  const id = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!id) throw new Error('WHATSAPP_PHONE_NUMBER_ID not configured');
  return id;
}

export function whatsAppAccessToken(): string {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) throw new Error('WHATSAPP_ACCESS_TOKEN not configured');
  return token;
}

export function templateName(key: keyof typeof TEMPLATE_ENV_KEYS): string {
  const envKey = TEMPLATE_ENV_KEYS[key];
  return process.env[envKey] ?? DEFAULT_TEMPLATES[key];
}

const DEFAULT_TEMPLATES = {
  booking_confirmation: 'booking_confirmation',
  checkin_reminder: 'checkin_reminder',
  booking_cancellation: 'booking_cancellation',
  invoice_receipt: 'invoice_receipt',
  host_new_booking: 'host_new_booking',
} as const;

const TEMPLATE_ENV_KEYS = {
  booking_confirmation: 'WHATSAPP_TEMPLATE_BOOKING_CONFIRMATION',
  checkin_reminder: 'WHATSAPP_TEMPLATE_CHECKIN_REMINDER',
  booking_cancellation: 'WHATSAPP_TEMPLATE_BOOKING_CANCELLATION',
  invoice_receipt: 'WHATSAPP_TEMPLATE_INVOICE_RECEIPT',
  host_new_booking: 'WHATSAPP_TEMPLATE_HOST_NEW_BOOKING',
} as const;
