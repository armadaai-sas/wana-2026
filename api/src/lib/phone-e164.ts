/** Normalize guest phone to E.164 (Colombia default +57). */
export function normalizePhoneE164(input: string, defaultCountry: 'CO' = 'CO'): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('+')) {
    const digits = trimmed.slice(1).replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) return null;
    return `+${digits}`;
  }

  const digits = trimmed.replace(/\D/g, '');
  if (defaultCountry === 'CO') {
    if (digits.length === 10 && digits.startsWith('3')) return `+57${digits}`;
    if (digits.length === 12 && digits.startsWith('57')) return `+${digits}`;
  }

  return null;
}

/** WhatsApp Cloud API expects digits only (no +). */
export function whatsAppRecipientId(phoneE164: string): string {
  return phoneE164.replace(/\D/g, '');
}
