'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { wanaApi } from '@/lib/api-client';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (!token) {
      setError('Enlace inválido. Solicita uno nuevo.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await wanaApi.resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push('/auth/login'), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo restablecer');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="wana-card w-full max-w-md p-8 text-center">
        <p className="text-slate-600">Enlace inválido o incompleto.</p>
        <Link href="/auth/forgot-password" className="wana-btn-primary mt-6 inline-flex min-h-[44px]">
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="wana-card w-full max-w-md p-8 text-center">
        <p className="font-medium text-emerald-800">Contraseña actualizada. Redirigiendo al login…</p>
      </div>
    );
  }

  return (
    <div className="wana-card w-full max-w-md p-8">
      <h1 className="font-display text-2xl text-slate-900">Nueva contraseña</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Contraseña (mín. 8)</span>
          <input
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-wana-forest"
            required
            disabled={loading}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium text-slate-700">Confirmar</span>
          <input
            type="password"
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-wana-forest"
            required
            disabled={loading}
          />
        </label>
        {error && (
          <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
        )}
        <button type="submit" disabled={loading} className="wana-btn-primary w-full min-h-[44px]">
          {loading ? 'Guardando…' : 'Restablecer contraseña'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <Header sticky={false} />
      <main className="wana-container flex min-h-[70vh] items-center justify-center py-12">
        <Suspense fallback={<p className="text-slate-500">Cargando…</p>}>
          <ResetPasswordForm />
        </Suspense>
      </main>
    </>
  );
}
