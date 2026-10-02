'use client';

import { useState } from 'react';
import { wanaApi, type AuthUser } from '@/lib/api-client';

export default function WhatsAppPreferences({
  user,
  onUpdated,
}: {
  user: AuthUser;
  onUpdated: (user: AuthUser) => void;
}) {
  const [phone, setPhone] = useState(user.phone_e164 ?? '');
  const [optIn, setOptIn] = useState(Boolean(user.whatsapp_opt_in));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const { user: updated } = await wanaApi.updateProfile({
        phone_e164: phone.trim() || null,
        whatsapp_opt_in: optIn && Boolean(phone.trim()),
      });
      onUpdated(updated);
      setMessage('Preferencias guardadas.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="rounded-xl border border-wana-border bg-wana-cream/50 p-4 space-y-4">
      <div>
        <p className="wana-label">WhatsApp</p>
        <p className="mt-1 text-sm text-wana-muted">
          Confirmaciones, recordatorios y comprobantes por WhatsApp (requiere opt-in).
        </p>
      </div>
      <div>
        <label htmlFor="wa-phone" className="wana-label">
          Celular (Colombia)
        </label>
        <input
          id="wa-phone"
          type="tel"
          autoComplete="tel"
          placeholder="+57 300 123 4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="mt-1 w-full rounded-lg border border-wana-border px-3 py-2 text-sm"
        />
      </div>
      <label className="flex items-start gap-2 text-sm text-wana-charcoal">
        <input
          type="checkbox"
          checked={optIn}
          onChange={(e) => setOptIn(e.target.checked)}
          className="mt-1"
        />
        <span>Quiero recibir mensajes de Eleveri por WhatsApp sobre mis reservas.</span>
      </label>
      {message && <p className="text-sm text-wana-muted">{message}</p>}
      <button type="submit" disabled={saving} className="wana-btn-primary min-h-[44px]">
        {saving ? 'Guardando…' : 'Guardar WhatsApp'}
      </button>
    </form>
  );
}
