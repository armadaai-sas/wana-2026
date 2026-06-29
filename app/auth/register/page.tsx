'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import TurnstileWidget from '@/components/auth/TurnstileWidget';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import AuthDivider from '@/components/auth/AuthDivider';

const TURNSTILE_ENABLED = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'guest' | 'host'>('guest');
  const [turnstileToken, setTurnstileToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (TURNSTILE_ENABLED && !turnstileToken) {
      setError('Completa la verificación de seguridad');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const user = await register({
        email,
        password,
        name,
        role,
        turnstile_token: turnstileToken || undefined,
      });
      router.push(user.role === 'host' ? '/host' : '/properties');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (credential: string) => {
    if (TURNSTILE_ENABLED && !turnstileToken) {
      setError('Completa la verificación de seguridad antes de Google');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const user = await loginWithGoogle(credential, {
        turnstile_token: turnstileToken || undefined,
        role,
      });
      router.push(user.role === 'host' ? '/host' : '/properties');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error con Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header sticky={false} />
      <main className="wana-container flex min-h-[70vh] items-center justify-center py-12">
        <div className="wana-card w-full max-w-md p-8 shadow-wana-lg">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-wana-forest">Únete a Waná</p>
          <h1 className="mt-1 font-display text-3xl text-slate-900">Crear cuenta</h1>
          <p className="mt-2 text-sm text-slate-600">Huésped o anfitrión — empieza en minutos.</p>

          <div className="mt-6 space-y-4">
            <TurnstileWidget onToken={setTurnstileToken} onExpire={() => setTurnstileToken('')} />
            <GoogleSignInButton onCredential={handleGoogle} text="signup_with" />
          </div>

          <AuthDivider label="o con email" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Nombre</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-wana-forest focus:ring-2 focus:ring-wana-forest/10"
                required
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-wana-forest focus:ring-2 focus:ring-wana-forest/10"
                required
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium text-slate-700">Contraseña (mín. 8)</span>
              <input
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-wana-forest focus:ring-2 focus:ring-wana-forest/10"
                required
              />
            </label>
            <fieldset className="space-y-2">
              <span className="text-sm font-medium text-slate-700">Quiero</span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRole('guest')}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium min-h-[44px] ${
                    role === 'guest' ? 'border-wana-forest bg-wana-forest/5' : 'border-slate-200'
                  }`}
                >
                  Reservar
                </button>
                <button
                  type="button"
                  onClick={() => setRole('host')}
                  className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium min-h-[44px] ${
                    role === 'host' ? 'border-wana-forest bg-wana-forest/5' : 'border-slate-200'
                  }`}
                >
                  Anfitrión
                </button>
              </div>
            </fieldset>

            {error && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="wana-btn-primary w-full min-h-[44px] !rounded-xl"
            >
              {loading ? 'Creando…' : 'Crear cuenta'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="font-medium text-wana-forest hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
