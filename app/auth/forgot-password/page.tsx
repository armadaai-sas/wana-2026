'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { wanaApi } from '@/lib/api-client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const res = await wanaApi.forgotPassword(email);
      setMessage({ type: 'success', text: res.message });
      setEmail('');
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'No se pudo enviar el correo',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header sticky={false} />
      <main className="wana-container flex min-h-[70vh] items-center justify-center py-12">
        <div className="wana-card w-full max-w-md p-8">
          <h1 className="font-display text-2xl text-slate-900">Recuperar contraseña</h1>
          <p className="mt-3 text-sm text-slate-600">
            Te enviaremos un enlace válido por 1 hora para crear una nueva contraseña.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-wana-forest"
                required
                disabled={loading}
              />
            </label>

            {message && (
              <div
                className={`rounded-xl px-4 py-3 text-sm ${
                  message.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800'
                    : 'bg-red-50 text-red-800'
                }`}
              >
                {message.text}
              </div>
            )}

            <button type="submit" disabled={loading} className="wana-btn-primary w-full min-h-[44px]">
              {loading ? 'Enviando…' : 'Enviar enlace'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            <Link href="/auth/login" className="font-medium text-wana-forest hover:underline">
              Volver al login
            </Link>
            {' · '}
            <Link href="/account" className="font-medium text-wana-forest hover:underline">
              Cambiar desde mi cuenta
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
